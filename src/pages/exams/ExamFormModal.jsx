import { useEffect } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Modal from "../../components/ui/Modal";
import SelectField from "../../components/ui/SelectField";

import {
  useCreateExam,
  useUpdateExam,
} from "../../hooks/useExams";

import { useClasses } from "../../hooks/useClasses";
import { useClassSubjects } from "../../hooks/useClassSubjects";
import { useTeacherSubjects } from "../../hooks/useTeacherSubjects";

/*
|--------------------------------------------------------------------------
| Exam types
|--------------------------------------------------------------------------
|
| These IDs must match the records in the exam_types table.
|
*/
const EXAM_TYPES = [
  {
    id: 1,
    name: "Mid-term",
  },
  {
    id: 2,
    name: "End-term",
  },
];

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/
const schema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title cannot exceed 200 characters"),

    class_id: z.coerce
      .number()
      .int()
      .min(1, "Select a class"),

    teacher_id: z.union([
      z.coerce.number().int().min(1),
      z.literal(""),
    ]),

    exam_date: z
      .string()
      .min(1, "Exam date is required"),

    total_questions: z.coerce
      .number()
      .int()
      .min(1, "Total questions must be at least 1")
      .max(1000, "Total questions cannot exceed 1000"),

    exam_type_id: z.coerce
      .number()
      .int()
      .min(1, "Select an exam type"),

    term_number: z.coerce
      .number()
      .int()
      .min(1, "Select a term")
      .max(3, "Select a term"),

    academic_year: z
      .string()
      .regex(
        /^\d{4}\/\d{4}$/,
        "Format must be 2024/2025"
      ),

    subjects: z
      .array(
        z.object({
          subject_id: z.coerce
            .number()
            .int()
            .min(1, "Select a subject"),

          question_count: z.coerce
            .number()
            .int()
            .min(1, "At least 1 question is required"),
        })
      )
      .min(1, "Add at least one subject"),
  })
  .superRefine((data, ctx) => {
    /*
     * Make sure a subject isn't selected twice.
     */
    const subjectIds = data.subjects.map((subject) =>
      Number(subject.subject_id)
    );

    if (new Set(subjectIds).size !== subjectIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subjects"],
        message: "A subject cannot be added more than once",
      });
    }

    /*
     * Make sure total_questions matches the allocation.
     */
    const assignedQuestions = data.subjects.reduce(
      (total, subject) =>
        total + Number(subject.question_count || 0),
      0
    );

    if (
      assignedQuestions !==
      Number(data.total_questions)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["total_questions"],
        message: `Assigned questions total ${assignedQuestions}, but total questions is ${data.total_questions}`,
      });
    }
  });

/*
|--------------------------------------------------------------------------
| Current academic year
|--------------------------------------------------------------------------
*/
const currentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();

  return now.getMonth() >= 8
    ? `${year}/${year + 1}`
    : `${year - 1}/${year}`;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/
const ExamFormModal = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  const createExam = useCreateExam();
  const updateExam = useUpdateExam();

  const { data: classesData } = useClasses({
    limit: 100,
  });

  /*
   * Returns all class-subject assignments.
   */
  const { data: classSubjectsData } =
    useClassSubjects();

  /*
   * Returns teacher-subject assignments.
   */
  const { data: teacherSubjectsData } =
    useTeacherSubjects();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),

    defaultValues: {
      title: "",
      class_id: "",
      teacher_id: "",
      exam_date: "",
      total_questions: 1,
      exam_type_id: "",
      term_number: "",
      academic_year: currentAcademicYear(),
      subjects: [],
    },
  });

  const {
    fields: subjectFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "subjects",
  });

  const selectedClassId = useWatch({
    control,
    name: "class_id",
  });

  const selectedSubjects =
    useWatch({
      control,
      name: "subjects",
    }) || [];

  /*
   * Only subjects assigned to the selected class.
   *
   * We support the likely field names returned by the
   * class-subject endpoint without introducing a new API.
   */
  const subjectsForClass = (
    classSubjectsData?.data || []
  ).filter(
    (classSubject) =>
      String(classSubject.class_id) ===
      String(selectedClassId)
  );

  /*
   * Subject IDs already selected in this exam.
   */
  const selectedSubjectIds = selectedSubjects.map(
    (subject) => String(subject.subject_id)
  );

  /*
   * Find teachers who are qualified for the selected
   * subjects.
   *
   * The exams table currently has one teacher_id, so the
   * teacher must be associated with every selected subject.
   */
  const qualifiedTeachers = (() => {
    const teacherSubjects =
      teacherSubjectsData?.data || [];

    if (selectedSubjects.length === 0) {
      return [];
    }

    const teacherIds = [
      ...new Set(
        teacherSubjects.map(
          (item) => item.teacher_id
        )
      ),
    ];

    return teacherIds
      .map((teacherId) => {
        const assignments = teacherSubjects.filter(
          (item) =>
            String(item.teacher_id) ===
            String(teacherId)
        );

        const teachesAllSelectedSubjects =
          selectedSubjectIds.every((subjectId) =>
            assignments.some(
              (assignment) =>
                String(
                  assignment.subject_id
                ) === subjectId
            )
          );

        if (!teachesAllSelectedSubjects) {
          return null;
        }

        const first = assignments[0];

        return {
          teacher_id: teacherId,
          first_name: first?.first_name || "",
          last_name: first?.last_name || "",
        };
      })
      .filter(Boolean);
  })();

  /*
   * Calculate total questions assigned to subjects.
   */
  const assignedQuestionCount =
    selectedSubjects.reduce(
      (total, subject) =>
        total +
        Number(subject.question_count || 0),
      0
    );

  /*
   * Reset when modal opens.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialData) {
      reset({
        title: initialData.title || "",

        class_id:
          initialData.class_id ?? "",

        teacher_id:
          initialData.teacher_id ?? "",

        exam_date:
          initialData.exam_date?.split("T")[0] ||
          "",

        total_questions:
          Number(initialData.total_questions) || 1,

        exam_type_id:
          initialData.exam_type_id ?? "",

        term_number:
          initialData.term_number ?? "",

        academic_year:
          initialData.academic_year ||
          currentAcademicYear(),

        subjects: Array.isArray(
          initialData.subjects
        )
          ? initialData.subjects.map(
              (subject) => ({
                subject_id: Number(
                  subject.id
                ),
                question_count:
                  Number(
                    subject.question_count
                  ) || 1,
              })
            )
          : [],
      });

      return;
    }

    reset({
      title: "",
      class_id: "",
      teacher_id: "",
      exam_date: "",
      total_questions: 1,
      exam_type_id: "",
      term_number: "",
      academic_year: currentAcademicYear(),
      subjects: [],
    });
  }, [
    isOpen,
    initialData,
    reset,
  ]);

  /*
   * Automatically keep total_questions equal to the
   * sum of subject question counts.
   */
  useEffect(() => {
    if (selectedSubjects.length === 0) {
      return;
    }

    setValue(
      "total_questions",
      assignedQuestionCount,
      {
        shouldValidate: true,
      }
    );
  }, [
    assignedQuestionCount,
    selectedSubjects.length,
    setValue,
  ]);

  /*
   * Clear teacher when the selected subjects change and
   * the current teacher is no longer qualified.
   */
  useEffect(() => {
    const currentTeacherId =
      getValues("teacher_id");

    if (!currentTeacherId) {
      return;
    }

    const stillQualified =
      qualifiedTeachers.some(
        (teacher) =>
          String(
            teacher.teacher_id
          ) ===
          String(currentTeacherId)
      );

    if (!stillQualified) {
      setValue("teacher_id", "");
    }
  }, [
    selectedSubjectIds.join(","),
    getValues,
    qualifiedTeachers,
    setValue,
  ]);

  const isSubmitting =
    createExam.isPending ||
    updateExam.isPending;

  const serverError =
    createExam.error?.response?.data?.message ||
    createExam.error?.response?.data?.error ||
    createExam.error?.message ||
    updateExam.error?.response?.data?.message ||
    updateExam.error?.response?.data?.error ||
    updateExam.error?.message;

  /*
   * Add a new subject.
   */
  const handleAddSubject = () => {
    if (!selectedClassId) {
      return;
    }

    const availableSubject =
      subjectsForClass.find(
        (classSubject) =>
          !selectedSubjectIds.includes(
            String(
              classSubject.subject_id
            )
          )
      );

    if (!availableSubject) {
      return;
    }

    append({
      subject_id: Number(
        availableSubject.subject_id
      ),
      question_count: 1,
    });
  };

  /*
   * Submit.
   */
  const onSubmit = (formData) => {
    const payload = {
      title: formData.title.trim(),

      class_id: Number(
        formData.class_id
      ),

      teacher_id: formData.teacher_id
        ? Number(formData.teacher_id)
        : null,

      exam_date: formData.exam_date,

      total_questions: Number(
        formData.total_questions
      ),

      exam_type_id: Number(
        formData.exam_type_id
      ),

      term_number: Number(
        formData.term_number
      ),

      academic_year:
        formData.academic_year,

      subjects:
        formData.subjects.map(
          (subject) => ({
            subject_id: Number(
              subject.subject_id
            ),
            question_count: Number(
              subject.question_count
            ),
          })
        ),
    };

    const mutation = isEditing
      ? updateExam.mutateAsync({
          id: initialData.id,
          payload,
        })
      : createExam.mutateAsync(
          payload
        );

    mutation
      .then(() => {
        onClose();
      })
      .catch(() => {
        // Mutation error is displayed above.
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? "Edit exam"
          : "New exam"
      }
      maxWidth="max-w-2xl"
    >
      {serverError && (
        <div className="mb-3 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* ======================================================== */}
        {/* TITLE */}
        {/* ======================================================== */}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Exam title
          </label>

          <input
            className="input-field"
            placeholder="SOCIALSTUDIES/CRE"
            {...register("title")}
          />

          {errors.title && (
            <p className="mt-1 text-xs text-red-600">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* ======================================================== */}
        {/* CLASS + EXAM TYPE */}
        {/* ======================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField
            label="Class"
            error={
              errors.class_id?.message
            }
            {...register("class_id")}
          >
            <option value="">
              Select class...
            </option>

            {classesData?.data?.map(
              (classItem) => (
                <option
                  key={classItem.id}
                  value={classItem.id}
                >
                  {classItem.name}
                </option>
              )
            )}
          </SelectField>

          <SelectField
            label="Exam type"
            error={
              errors.exam_type_id?.message
            }
            {...register("exam_type_id")}
          >
            <option value="">
              Select type...
            </option>

            {EXAM_TYPES.map(
              (type) => (
                <option
                  key={type.id}
                  value={type.id}
                >
                  {type.name}
                </option>
              )
            )}
          </SelectField>
        </div>

        {/* ======================================================== */}
        {/* SUBJECTS */}
        {/* ======================================================== */}

        <div className="border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Exam subjects
              </h3>

              <p className="text-xs text-gray-500 mt-0.5">
                Add each subject and specify the
                number of questions it contributes.
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleAddSubject
              }
              disabled={
                !selectedClassId ||
                subjectsForClass.length ===
                  selectedSubjects.length
              }
              className="btn-secondary text-xs whitespace-nowrap"
            >
              + Add subject
            </button>
          </div>

          {!selectedClassId && (
            <p className="text-xs text-gray-500 py-2">
              Select a class first.
            </p>
          )}

          {selectedClassId &&
            subjectsForClass.length ===
              0 && (
              <p className="text-xs text-amber-600 py-2">
                This class has no subjects
                assigned yet. Go to
                Assignments → Class
                Subjects first.
              </p>
            )}

          {selectedClassId &&
            subjectsForClass.length >
              0 &&
            subjectFields.length ===
              0 && (
              <div className="text-center py-4 border border-dashed border-gray-300 rounded-md">
                <p className="text-xs text-gray-500">
                  No subjects added to
                  this exam yet.
                </p>

                <button
                  type="button"
                  onClick={
                    handleAddSubject
                  }
                  className="mt-2 text-xs font-medium text-blue-600 hover:underline"
                >
                  Add the first subject
                </button>
              </div>
            )}

          <div className="space-y-2">
            {subjectFields.map(
              (field, index) => {
                const selectedSubjectId =
                  selectedSubjects[
                    index
                  ]?.subject_id;

                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-2 items-end"
                  >
                    {/* Subject */}
                    <SelectField
                      label={
                        index === 0
                          ? "Subject"
                          : undefined
                      }
                      error={
                        errors.subjects?.[
                          index
                        ]?.subject_id
                          ?.message
                      }
                      {...register(
                        `subjects.${index}.subject_id`
                      )}
                    >
                      <option value="">
                        Select subject...
                      </option>

                      {subjectsForClass.map(
                        (
                          classSubject
                        ) => {
                          const subjectId =
                            classSubject.subject_id;

                          const alreadySelected =
                            selectedSubjectIds.includes(
                              String(
                                subjectId
                              )
                            ) &&
                            String(
                              subjectId
                            ) !==
                              String(
                                selectedSubjectId
                              );

                          return (
                            <option
                              key={
                                subjectId
                              }
                              value={
                                subjectId
                              }
                              disabled={
                                alreadySelected
                              }
                            >
                              {classSubject.subject_name ||
                                classSubject.name ||
                                `Subject ${subjectId}`}
                            </option>
                          );
                        }
                      )}
                    </SelectField>

                    {/* Question count */}
                    <div>
                      {index === 0 && (
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Questions
                        </label>
                      )}

                      <input
                        type="number"
                        min="1"
                        className="input-field"
                        {...register(
                          `subjects.${index}.question_count`
                        )}
                      />

                      {errors
                        .subjects?.[
                        index
                      ]?.question_count && (
                        <p className="mt-1 text-xs text-red-600">
                          {
                            errors
                              .subjects[
                              index
                            ]
                              .question_count
                              .message
                          }
                        </p>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() =>
                        remove(index)
                      }
                      className="h-10 px-3 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                );
              }
            )}
          </div>

          {errors.subjects?.message && (
            <p className="mt-2 text-xs text-red-600">
              {errors.subjects.message}
            </p>
          )}

          {/* Assigned total */}
          {subjectFields.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Total questions
              </span>

              <span className="font-semibold text-gray-800">
                {assignedQuestionCount}
              </span>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* TEACHER */}
        {/* ======================================================== */}

        <SelectField
          label="Teacher (optional)"
          error={
            errors.teacher_id?.message
          }
          {...register("teacher_id")}
          disabled={
            selectedSubjects.length ===
            0
          }
        >
          <option value="">
            {selectedSubjects.length > 0
              ? "Unassigned"
              : "Add a subject first"}
          </option>

          {qualifiedTeachers.map(
            (teacher) => (
              <option
                key={teacher.teacher_id}
                value={
                  teacher.teacher_id
                }
              >
                {teacher.first_name}{" "}
                {teacher.last_name}
              </option>
            )
          )}
        </SelectField>

        {selectedSubjects.length >
          0 &&
          qualifiedTeachers.length ===
            0 && (
            <p className="text-xs text-amber-600 -mt-2">
              No teacher is currently
              assigned to all selected
              subjects.
            </p>
          )}

        {/* ======================================================== */}
        {/* DATE + TOTAL QUESTIONS */}
        {/* ======================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Exam date
            </label>

            <input
              type="date"
              className="input-field"
              {...register("exam_date")}
            />

            {errors.exam_date && (
              <p className="mt-1 text-xs text-red-600">
                {
                  errors.exam_date
                    .message
                }
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Total questions
            </label>

            <input
              type="number"
              className="input-field bg-gray-50"
              readOnly
              {...register(
                "total_questions"
              )}
            />

            {errors.total_questions && (
              <p className="mt-1 text-xs text-red-600">
                {
                  errors.total_questions
                    .message
                }
              </p>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* TERM + ACADEMIC YEAR */}
        {/* ======================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField
            label="Term"
            error={
              errors.term_number?.message
            }
            {...register("term_number")}
          >
            <option value="">
              Select term...
            </option>

            <option value="1">
              Term 1
            </option>

            <option value="2">
              Term 2
            </option>

            <option value="3">
              Term 3
            </option>
          </SelectField>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Academic year
            </label>

            <input
              className="input-field"
              placeholder="2026/2027"
              {...register(
                "academic_year"
              )}
            />

            {errors.academic_year && (
              <p className="mt-1 text-xs text-red-600">
                {
                  errors
                    .academic_year
                    .message
                }
              </p>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* ACTIONS */}
        {/* ======================================================== */}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary w-full sm:w-auto justify-center"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full sm:w-auto justify-center"
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Create exam"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ExamFormModal;