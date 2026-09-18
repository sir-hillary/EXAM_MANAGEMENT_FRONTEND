import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Modal from "../../components/ui/Modal";
import { useCreateClass, useUpdateClass } from "../../hooks/useClasses";
import { useTeachers } from "../../hooks/useTeachers";
import { getDivision } from "../../utils/schoolDivisions";
import { TeacherAvatar } from "../../components/ui/TeacherAvatar";

const DESIGNATIONS = {
  headteacher: {
    label: "Head Teacher",
    color: "#b45309",
    bg: "#fef3c7",
  },
  deputy_headteacher: {
    label: "Deputy Head Teacher",
    color: "#0369a1",
    bg: "#e0f2fe",
  },
  teacher: {
    label: "Teacher",
    color: "#15803d",
    bg: "#f0fdf4",
  },
};

const formatDesignation = (designation) =>
  DESIGNATIONS[designation]?.label || designation || "Teacher";

const getDesignationStyle = (designation) =>
  DESIGNATIONS[designation] || DESIGNATIONS.teacher;

const classSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Class name is required")
    .max(100, "Class name cannot exceed 100 characters"),

  grade: z.coerce
    .number()
    .int()
    .min(4, "Grade must be between 4 and 8")
    .max(8, "Grade must be between 4 and 8"),

  capacity: z.union([
    z.coerce.number().int().min(1, "Capacity must be at least 1").max(
      200,
      "Capacity cannot exceed 200"
    ),
    z.literal(""),
  ]),

  class_teacher_id: z.union([
    z.coerce.number().int().positive(),
    z.literal(""),
  ]),

  parent_rep: z
    .string()
    .trim()
    .max(150, "Parent representative name cannot exceed 150 characters")
    .or(z.literal("")),
});

const ClassFormModal = ({ isOpen, onClose, initialData }) => {
  const isEditing = Boolean(initialData);

  const createClass = useCreateClass();
  const updateClass = useUpdateClass();

  const { data: teachersData, isLoading: teachersLoading } = useTeachers({
    limit: 100,
  });

  const teachers = teachersData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      grade: "",
      capacity: "",
      class_teacher_id: "",
      parent_rep: "",
    },
  });

  const gradeValue = useWatch({
    control,
    name: "grade",
  });

  const selectedTeacherId = useWatch({
    control,
    name: "class_teacher_id",
  });

  const division = gradeValue
    ? getDivision(Number(gradeValue))
    : null;

  const selectedTeacher = teachers.find(
    (teacher) =>
      String(teacher.id) === String(selectedTeacherId)
  );

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      reset({
        name: initialData.name || "",
        grade: initialData.grade ?? "",
        capacity: initialData.capacity ?? "",
        class_teacher_id: initialData.class_teacher_id ?? "",
        parent_rep: initialData.parent_rep || "",
      });
    } else {
      reset({
        name: "",
        grade: "",
        capacity: "",
        class_teacher_id: "",
        parent_rep: "",
      });
    }
  }, [isOpen, initialData, reset]);

  const isSaving =
    isSubmitting ||
    createClass.isPending ||
    updateClass.isPending;

  const serverError =
    createClass.error?.response?.data?.error ||
    updateClass.error?.response?.data?.error ||
    createClass.error?.message ||
    updateClass.error?.message;

  const onSubmit = async (formData) => {
    const payload = {
      name: formData.name.trim(),
      grade: Number(formData.grade),

      capacity:
        formData.capacity === "" ||
        formData.capacity === null ||
        formData.capacity === undefined
          ? null
          : Number(formData.capacity),

      class_teacher_id:
        formData.class_teacher_id === "" ||
        formData.class_teacher_id === null ||
        formData.class_teacher_id === undefined
          ? null
          : Number(formData.class_teacher_id),

      parent_rep:
        formData.parent_rep?.trim() || null,
    };

    try {
      if (isEditing) {
        await updateClass.mutateAsync({
          id: initialData.id,
          payload,
        });
      } else {
        await createClass.mutateAsync(payload);
      }

      onClose();
    } catch {
      // Mutation error is displayed through serverError.
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit class" : "Create class"}
      maxWidth="max-w-lg"
    >
      <div className="mb-5">
        <p className="text-sm text-gray-500">
          {isEditing
            ? "Update the class details and class teacher assignment."
            : "Set up a class with its grade, capacity and class teacher."}
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <div className="mt-0.5 shrink-0">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
              !
            </span>
          </div>

          <p>{serverError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Class name */}
        <div>
          <label
            htmlFor="class-name"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Class name
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            id="class-name"
            type="text"
            autoComplete="off"
            placeholder="e.g. Grade 7 Elimu"
            className="input-field"
            {...register("name")}
          />

          {errors.name && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Grade + capacity */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Grade */}
          <div>
            <label
              htmlFor="class-grade"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Grade
              <span className="ml-1 text-red-500">*</span>
            </label>

            <select
              id="class-grade"
              className="input-field"
              {...register("grade")}
            >
              <option value="">Select grade</option>

              {[4, 5, 6, 7, 8].map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>

            {errors.grade && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.grade.message}
              </p>
            )}

            {division && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Division
                </span>

                <span
                  className={`badge ${division.color}`}
                >
                  {division.label}
                </span>
              </div>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label
              htmlFor="class-capacity"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Capacity
              <span className="ml-1 text-xs font-normal text-gray-400">
                optional
              </span>
            </label>

            <input
              id="class-capacity"
              type="number"
              min="1"
              max="200"
              placeholder="e.g. 40"
              className="input-field"
              {...register("capacity")}
            />

            {errors.capacity && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.capacity.message}
              </p>
            )}
          </div>
        </div>

        {/* Class teacher */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="class-teacher"
              className="block text-sm font-medium text-gray-700"
            >
              Class teacher
            </label>

            <span className="text-xs text-gray-400">
              optional
            </span>
          </div>

          {/* Selected teacher preview */}
          {selectedTeacher && (
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
              <TeacherAvatar
                teacher={selectedTeacher}
                size="sm"
                showStatus
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {selectedTeacher.first_name}{" "}
                  {selectedTeacher.last_name}
                </p>

                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                  {selectedTeacher.employee_number && (
                    <span>
                      {selectedTeacher.employee_number}
                    </span>
                  )}

                  {selectedTeacher.tsc_number && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span>
                        TSC {selectedTeacher.tsc_number}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {selectedTeacher.designation && (
                <span
                  className="shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold"
                  style={{
                    backgroundColor:
                      getDesignationStyle(
                        selectedTeacher.designation
                      ).bg,
                    color:
                      getDesignationStyle(
                        selectedTeacher.designation
                      ).color,
                  }}
                >
                  {formatDesignation(
                    selectedTeacher.designation
                  )}
                </span>
              )}
            </div>
          )}

          <select
            id="class-teacher"
            className="input-field"
            disabled={teachersLoading}
            {...register("class_teacher_id")}
          >
            <option value="">
              {teachersLoading
                ? "Loading teachers..."
                : "No class teacher assigned"}
            </option>

            {teachers
              .filter((teacher) => teacher.is_active !== false)
              .map((teacher) => (
                <option
                  key={teacher.id}
                  value={teacher.id}
                >
                  {teacher.first_name} {teacher.last_name}
                  {teacher.designation &&
                  teacher.designation !== "teacher"
                    ? ` — ${formatDesignation(
                        teacher.designation
                      )}`
                    : ""}
                </option>
              ))}
          </select>

          <p className="mt-1.5 text-xs text-gray-400">
            Only active teachers are available for assignment.
          </p>

          {teachers.length === 0 && !teachersLoading && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              No teachers are currently available.
            </p>
          )}

          {errors.class_teacher_id && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.class_teacher_id.message}
            </p>
          )}
        </div>

        {/* Parent representative */}
        <div>
          <label
            htmlFor="parent-rep"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Parent representative
            <span className="ml-1 text-xs font-normal text-gray-400">
              optional
            </span>
          </label>

          <input
            id="parent-rep"
            type="text"
            autoComplete="off"
            placeholder="Full name of parent representative"
            className="input-field"
            {...register("parent_rep")}
          />

          {errors.parent_rep && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.parent_rep.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="btn-secondary w-full justify-center sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary w-full justify-center sm:w-auto"
          >
            {isSaving
              ? "Saving..."
              : isEditing
              ? "Save changes"
              : "Create class"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ClassFormModal;