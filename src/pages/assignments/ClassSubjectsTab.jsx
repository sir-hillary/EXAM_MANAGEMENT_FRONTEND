import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  BookOpen,
  UsersRound,
  GraduationCap,
  CalendarDays,
  UserRound,
} from "lucide-react";

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
    now.getMonth() >= 8
      ? now.getFullYear()
      : now.getFullYear() - 1;

  return `${startYear}/${startYear + 1}`;
};

const defaultValues = {
  class_id: "",
  subject_id: "",
  teacher_id: "",
  academic_year: currentAcademicYear(),
};

const schema = z.object({
  class_id: z.coerce
    .number()
    .int()
    .min(1, "Select a class"),

  subject_id: z.coerce
    .number()
    .int()
    .min(1, "Select a subject"),

  teacher_id: z.union([
    z.coerce.number().int().min(1),
    z.literal(""),
  ]),

  academic_year: z
    .string()
    .trim()
    .regex(
      /^\d{4}\/\d{4}$/,
      "Format must be YYYY/YYYY",
    ),
});

const ClassSubjectsTab = () => {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useClassSubjects();

  const {
    data: classesData,
    isLoading: classesLoading,
  } = useClasses({ limit: 100 });

  const {
    data: subjectsData,
    isLoading: subjectsLoading,
  } = useSubjects({ limit: 100 });

  const {
    data: teacherSubjectsData,
    isLoading: teacherSubjectsLoading,
  } = useTeacherSubjects();

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

  const qualifiedTeachers = (
    teacherSubjectsData?.data ?? []
  ).filter(
    (teacherSubject) =>
      String(teacherSubject.subject_id) ===
      String(selectedSubjectId),
  );

  // Reset teacher selection when the subject changes.
  useEffect(() => {
    setValue("teacher_id", "");
  }, [selectedSubjectId, setValue]);

  const classes = classesData?.data ?? [];
  const subjects = subjectsData?.data ?? [];
  const classSubjects = data?.data ?? [];

  const isFormLoading =
    classesLoading ||
    subjectsLoading ||
    teacherSubjectsLoading;

  const onSubmit = (formData) => {
    const payload = {
      class_id: Number(formData.class_id),
      subject_id: Number(formData.subject_id),
      teacher_id:
        formData.teacher_id === ""
          ? null
          : Number(formData.teacher_id),
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

  const columns = [
    {
      key: "class_name",
      header: "Class",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <GraduationCap size={18} />
          </div>

          <span className="font-medium text-gray-900">
            {row.class_name}
          </span>
        </div>
      ),
    },

    {
      key: "subject_name",
      header: "Subject",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.subject_name}
          </p>

          {row.code && (
            <span className="mt-0.5 inline-flex rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-500">
              {row.code}
            </span>
          )}
        </div>
      ),
    },

    {
      key: "teacher",
      header: "Assigned teacher",
      render: (row) =>
        row.first_name ? (
          <div className="flex items-center gap-2">
            <UserRound
              size={15}
              className="text-gray-400"
            />

            <span className="text-sm text-gray-700">
              {row.first_name} {row.last_name}
            </span>
          </div>
        ) : (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            Unassigned
          </span>
        ),
    },

    {
      key: "academic_year",
      header: "Academic year",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
          <CalendarDays
            size={14}
            className="text-gray-400"
          />
          {row.academic_year}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BookOpen size={20} />
            </div>

            <h2 className="text-lg font-semibold tracking-tight text-gray-900">
              Class Subject Assignments
            </h2>
          </div>

          <p className="max-w-2xl text-sm text-gray-500">
            Manage the subjects offered by each class,
            assign qualified teachers, and organize
            academic-year offerings.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
          <UsersRound
            size={16}
            className="text-blue-600"
          />

          <span>
            <strong className="font-semibold text-gray-900">
              {classSubjects.length}
            </strong>{" "}
            {classSubjects.length === 1
              ? "assignment"
              : "assignments"}
          </span>
        </div>
      </div>

      {/* Assignment form */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Plus size={20} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Create class subject assignment
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                Choose a class, subject, academic year,
                and optionally a qualified teacher.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {assign.error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {assign.error.message ||
                "Failed to assign subject to class."}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SelectField
                label="Class"
                error={errors.class_id?.message}
                disabled={isFormLoading || assign.isPending}
                {...register("class_id")}
              >
                <option value="">
                  {classesLoading
                    ? "Loading classes..."
                    : "Select class"}
                </option>

                {classes.map((classItem) => (
                  <option
                    key={classItem.id}
                    value={classItem.id}
                  >
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
                <option value="">
                  {subjectsLoading
                    ? "Loading subjects..."
                    : "Select subject"}
                </option>

                {subjects.map((subject) => (
                  <option
                    key={subject.id}
                    value={subject.id}
                  >
                    {subject.name}
                    {subject.code
                      ? ` (${subject.code})`
                      : ""}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Qualified teacher"
                error={errors.teacher_id?.message}
                disabled={
                  !selectedSubjectId ||
                  isFormLoading ||
                  assign.isPending
                }
                {...register("teacher_id")}
              >
                <option value="">
                  {!selectedSubjectId
                    ? "Select a subject first"
                    : qualifiedTeachers.length === 0
                      ? "No qualified teachers"
                      : "Leave unassigned"}
                </option>

                {qualifiedTeachers.map(
                  (teacherSubject) => (
                    <option
                      key={teacherSubject.teacher_id}
                      value={teacherSubject.teacher_id}
                    >
                      {teacherSubject.first_name}{" "}
                      {teacherSubject.last_name}
                    </option>
                  ),
                )}
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
                  placeholder="2026/2027"
                  className="input-field"
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

            {/* Teacher qualification notice */}
            {selectedSubjectId &&
              qualifiedTeachers.length === 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <UserRound
                    size={16}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <p className="text-xs leading-relaxed text-amber-700">
                    No teachers are qualified for this
                    subject yet. You can continue without
                    assigning a teacher, or add a
                    qualification in the Teacher
                    Qualifications section.
                  </p>
                </div>
              )}

            {/* Form footer */}
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                Subjects can be offered across multiple
                classes and academic years.
              </p>

              <button
                type="submit"
                disabled={
                  assign.isPending ||
                  isFormLoading
                }
                className="btn-primary w-full justify-center sm:w-auto"
              >
                <Plus size={16} />

                {assign.isPending
                  ? "Assigning..."
                  : "Assign subject"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Existing assignments */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Current class offerings
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Review subjects assigned to classes and
              manage their teacher allocations.
            </p>
          </div>

          {!isLoading && !isError && (
            <span className="text-xs font-medium text-gray-500">
              {classSubjects.length} total
            </span>
          )}
        </div>

        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="py-6">
              <TableSkeleton
                rows={6}
                cols={5}
              />
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
                  className="rounded-md p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${row.subject_name} from ${row.class_name}`}
                  title="Remove class subject assignment"
                >
                  <Trash2 size={16} />
                </button>
              )}
            />
          )}
        </div>
      </section>

      {/* Remove assignment confirmation */}
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
            ? `Remove ${deleteTarget.subject_name} from ${deleteTarget.class_name} for academic year ${deleteTarget.academic_year}? This removes only the class-subject assignment. Existing exams and results are not deleted.`
            : ""
        }
        isLoading={unassign.isPending}
      />
    </div>
  );
};

export default ClassSubjectsTab;