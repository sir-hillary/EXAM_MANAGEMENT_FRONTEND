import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useClassSubjects,
  useAssignClassSubject,
  useUnassignClassSubject,
} from "../../hooks/useClassSubjects";

import { useTeacherSubjects } from "../../hooks/useTeacherSubjects";
import { useClasses } from "../../hooks/useClasses";
import { useSubjects } from "../../hooks/useSubjects";

import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import SelectField from "../../components/ui/SelectField";
import TableSkeleton from "../../components/ui/TableSkeleton";

const currentAcademicYear = () => {
  const now = new Date();

  const startYear =
    now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;

  return `${startYear}/${startYear + 1}`;
};

const defaultValues = {
  class_id: "",
  subject_id: "",
  teacher_id: "",
  academic_year: currentAcademicYear(),
};

const schema = z.object({
  class_id: z.coerce.number().int().min(1, "Select a class"),

  subject_id: z.coerce.number().int().min(1, "Select a subject"),

  teacher_id: z.union([z.coerce.number().int().min(1), z.literal("")]),

  academic_year: z
    .string()
    .trim()
    .regex(/^\d{4}\/\d{4}$/, "Format must be YYYY/YYYY"),
});

const ClassSubjectsTab = () => {
  const { data, isLoading, isError, error } = useClassSubjects();

  const { data: classesData, isLoading: classesLoading } = useClasses({
    limit: 100,
  });

  const { data: subjectsData, isLoading: subjectsLoading } = useSubjects({
    limit: 100,
  });

  const { data: teacherSubjectsData, isLoading: teacherSubjectsLoading } =
    useTeacherSubjects();

  const assign = useAssignClassSubject();
  const unassign = useUnassignClassSubject();

  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const selectedSubjectId = useWatch({
    control,
    name: "subject_id",
  });

  /*
   * Only show teachers who are assigned to the
   * selected subject through teacher_subjects.
   */
  const qualifiedTeachers = (teacherSubjectsData?.data ?? []).filter(
    (teacherSubject) =>
      String(teacherSubject.subject_id) === String(selectedSubjectId),
  );

  /*
   * Clear the selected teacher whenever the subject
   * changes. This prevents a teacher selected for
   * Subject A from being submitted for Subject B.
   */
  useEffect(() => {
    setValue("teacher_id", "");
  }, [selectedSubjectId, setValue]);

  const onSubmit = (formData) => {
    const payload = {
      class_id: Number(formData.class_id),
      subject_id: Number(formData.subject_id),
      teacher_id:
        formData.teacher_id === "" ? null : Number(formData.teacher_id),
      academic_year: formData.academic_year.trim(),
    };

    assign.mutate(payload, {
      onSuccess: () => {
        reset({
          ...defaultValues,
          academic_year: formData.academic_year.trim(),
        });
      },
    });
  };

  const classes = classesData?.data ?? [];
  const subjects = subjectsData?.data ?? [];
  const classSubjects = data?.data ?? [];

  const isFormLoading =
    classesLoading || subjectsLoading || teacherSubjectsLoading;

  const columns = [
    {
      key: "class_name",
      header: "Class",
      render: (row) => (
        <span className="font-medium text-gray-900">{row.class_name}</span>
      ),
    },

    {
      key: "subject_name",
      header: "Subject",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.subject_name}</p>

          {row.code && (
            <span className="text-xs text-gray-500">{row.code}</span>
          )}
        </div>
      ),
    },

    {
      key: "teacher",
      header: "Teacher",
      render: (row) =>
        row.first_name ? (
          <span className="text-gray-700">
            {row.first_name} {row.last_name}
          </span>
        ) : (
          <span className="text-gray-400">Unassigned</span>
        ),
    },

    {
      key: "academic_year",
      header: "Academic year",
    },
  ];

  return (
    <div>
      <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Offer a subject to a class
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Assign an examinable subject to a class for a specific academic year
            and optionally assign a qualified teacher.
          </p>
        </div>

        {assign.error && (
          <div
            role="alert"
            className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {assign.error.message || "Failed to assign subject to class."}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField
              label="Class"
              error={errors.class_id?.message}
              disabled={isFormLoading || assign.isPending}
              {...register("class_id")}
            >
              <option value="">Select class...</option>

              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Subject"
              error={errors.subject_id?.message}
              disabled={isFormLoading || assign.isPending}
              {...register("subject_id")}
            >
              <option value="">Select subject...</option>

              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                  {subject.code ? ` (${subject.code})` : ""}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Teacher"
              error={errors.teacher_id?.message}
              disabled={!selectedSubjectId || isFormLoading || assign.isPending}
              {...register("teacher_id")}
            >
              <option value="">
                {!selectedSubjectId
                  ? "Select a subject first"
                  : qualifiedTeachers.length === 0
                    ? "No qualified teachers"
                    : "Unassigned for now"}
              </option>

              {qualifiedTeachers.map((teacherSubject) => (
                <option
                  key={teacherSubject.teacher_id}
                  value={teacherSubject.teacher_id}
                >
                  {teacherSubject.first_name} {teacherSubject.last_name}
                </option>
              ))}
            </SelectField>

            <div>
              <label
                htmlFor="academic-year"
                className="mb-1 block text-xs font-medium text-gray-600"
              >
                Academic year
              </label>

              <input
                id="academic-year"
                type="text"
                className="input-field"
                placeholder="2026/2027"
                disabled={assign.isPending}
                {...register("academic_year")}
              />

              {errors.academic_year && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.academic_year.message}
                </p>
              )}
            </div>
          </div>

          {selectedSubjectId && qualifiedTeachers.length === 0 && (
            <p className="text-xs text-amber-600">
              No teachers are qualified for this subject yet. You can assign the
              subject without a teacher, or assign a teacher in the Teacher
              Qualifications section first.
            </p>
          )}

          <button
            type="submit"
            disabled={assign.isPending || isFormLoading}
            className="btn-primary w-full justify-center sm:w-auto"
          >
            <Plus size={16} />

            {assign.isPending ? "Assigning..." : "Assign subject to class"}
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <TableSkeleton rows={8} cols={5} />
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-medium text-red-700">
            Failed to load class subject assignments
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error?.message ||
              "Something went wrong while loading assignments."}
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={classSubjects}
          emptyMessage="No subjects have been assigned to any class yet."
          actions={(row) => (
            <button
              type="button"
              onClick={() => setDeleteTarget(row)}
              className="text-gray-400 hover:text-red-600"
              aria-label={`Remove ${row.subject_name} from ${row.class_name}`}
              title={`Remove ${row.subject_name} from ${row.class_name}`}
            >
              <Trash2 size={16} />
            </button>
          )}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;

          unassign.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
        title="Remove subject from class"
        message={
          deleteTarget
            ? `Remove ${deleteTarget.subject_name} from ${deleteTarget.class_name}? This only removes the class-subject assignment. Existing exams and results are not deleted.`
            : ""
        }
        isLoading={unassign.isPending}
      />
    </div>
  );
};

export default ClassSubjectsTab;
