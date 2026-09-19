import { useState } from "react";
import {
  Plus,
  Trash2,
  BookOpen,
  UsersRound,
  GraduationCap,
  UserCheck,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useTeacherSubjects,
  useAssignTeacherSubject,
  useUnassignTeacherSubject,
} from "../../hooks/useTeacherSubjects";

import { useTeachers } from "../../hooks/useTeachers";
import { useSubjects } from "../../hooks/useSubjects";

import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import SelectField from "../../components/ui/SelectField";
import TableSkeleton from "../../components/ui/TableSkeleton";

const schema = z.object({
  teacher_id: z.coerce
    .number()
    .int()
    .min(1, "Select a teacher"),

  subject_id: z.coerce
    .number()
    .int()
    .min(1, "Select a subject"),
});

const TeacherSubjectsTab = () => {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useTeacherSubjects();

  const {
    data: teachersData,
    isLoading: teachersLoading,
  } = useTeachers({ limit: 100 });

  const {
    data: subjectsData,
    isLoading: subjectsLoading,
  } = useSubjects({ limit: 100 });

  const assign = useAssignTeacherSubject();
  const unassign = useUnassignTeacherSubject();

  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      teacher_id: "",
      subject_id: "",
    },
  });

  const assignments = data?.data ?? [];
  const teachers = teachersData?.data ?? [];
  const subjects = subjectsData?.data ?? [];

  const isFormLoading = teachersLoading || subjectsLoading;

  const onSubmit = (formData) => {
    assign.mutate(
      {
        teacher_id: Number(formData.teacher_id),
        subject_id: Number(formData.subject_id),
      },
      {
        onSuccess: () => {
          reset({
            teacher_id: "",
            subject_id: "",
          });
        },
      },
    );
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const columns = [
    {
      key: "teacher",
      header: "Teacher",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <UserCheck size={17} />
          </div>

          <div>
            <p className="font-medium text-gray-900">
              {row.first_name} {row.last_name}
            </p>

            {row.email && (
              <p className="text-xs text-gray-500">
                {row.email}
              </p>
            )}
          </div>
        </div>
      ),
    },

    {
      key: "subject_name",
      header: "Subject",
      render: (row) => (
        <span className="font-medium text-gray-700">
          {row.subject_name}
        </span>
      ),
    },

    {
      key: "code",
      header: "Subject code",
      render: (row) => (
        <span className="inline-flex rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
          {row.code || "—"}
        </span>
      ),
    },

    {
      key: "assigned_at",
      header: "Date assigned",
      render: (row) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.assigned_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <GraduationCap size={20} />
            </div>

            <h2 className="text-lg font-semibold tracking-tight text-gray-900">
              Teacher Qualifications
            </h2>
          </div>

          <p className="max-w-2xl text-sm text-gray-500">
            Manage the subjects each teacher is qualified
            to teach. These qualifications can be used
            when assigning teachers to classes.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
          <UsersRound size={16} className="text-blue-600" />

          <span>
            <strong className="font-semibold text-gray-900">
              {assignments.length}
            </strong>{" "}
            {assignments.length === 1
              ? "qualification"
              : "qualifications"}
          </span>
        </div>
      </div>

      {/* Assignment panel */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <BookOpen size={19} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Assign a subject qualification
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                Select a teacher and the subject they are
                qualified to teach.
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
                "Failed to assign subject qualification."}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="Select teacher"
                error={errors.teacher_id?.message}
                disabled={isFormLoading || assign.isPending}
                {...register("teacher_id")}
              >
                <option value="">
                  {teachersLoading
                    ? "Loading teachers..."
                    : "Choose a teacher"}
                </option>

                {teachers.map((teacher) => (
                  <option
                    key={teacher.id}
                    value={teacher.id}
                  >
                    {teacher.first_name} {teacher.last_name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Select subject"
                error={errors.subject_id?.message}
                disabled={isFormLoading || assign.isPending}
                {...register("subject_id")}
              >
                <option value="">
                  {subjectsLoading
                    ? "Loading subjects..."
                    : "Choose a subject"}
                </option>

                {subjects.map((subject) => (
                  <option
                    key={subject.id}
                    value={subject.id}
                  >
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                A teacher can be qualified for multiple
                subjects.
              </p>

              <button
                type="submit"
                disabled={assign.isPending || isFormLoading}
                className="btn-primary w-full justify-center sm:w-auto"
              >
                <Plus size={16} />

                {assign.isPending
                  ? "Assigning..."
                  : "Assign qualification"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Qualifications table */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Assigned qualifications
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              View and manage teacher-subject assignments.
            </p>
          </div>

          {!isLoading && !isError && (
            <span className="text-xs font-medium text-gray-500">
              {assignments.length} total
            </span>
          )}
        </div>

        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="py-6">
              <TableSkeleton rows={6} cols={4} />
            </div>
          ) : isError ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4"
            >
              <p className="text-sm font-medium text-red-700">
                Failed to load qualifications
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error?.message ||
                  "Something went wrong while loading teacher qualifications."}
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={assignments}
              emptyMessage="No teacher qualifications have been assigned yet."
              actions={(row) => (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(row)}
                  className="rounded-md p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${row.subject_name} qualification for ${row.first_name} ${row.last_name}`}
                  title="Remove qualification"
                >
                  <Trash2 size={16} />
                </button>
              )}
            />
          )}
        </div>
      </section>

      {/* Remove qualification confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;

          unassign.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
        title="Remove teacher qualification"
        message={
          deleteTarget
            ? `Remove ${deleteTarget.first_name} ${deleteTarget.last_name}'s qualification to teach ${deleteTarget.subject_name}? This will remove the teacher-subject qualification, but will not delete class-subject assignments or existing exams.`
            : ""
        }
        isLoading={unassign.isPending}
      />
    </div>
  );
};

export default TeacherSubjectsTab;