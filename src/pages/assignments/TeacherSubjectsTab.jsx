import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
  teacher_id: z.coerce.number().int().min(1, "Select a teacher"),
  subject_id: z.coerce.number().int().min(1, "Select a subject"),
});

const TeacherSubjectsTab = () => {
  const { data, isLoading, isError, error } = useTeacherSubjects();
  const { data: teachersData } = useTeachers({ limit: 100 });
  const { data: subjectsData } = useSubjects({ limit: 100 });
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
  });

  const onSubmit = (formData) => {
    assign.mutate(formData, {
      onSuccess: () => reset({ teacher_id: "", subject_id: "" }),
    });
  };

  const columns = [
    {
      key: "teacher",
      header: "Teacher",
      render: (row) => `${row.first_name} ${row.last_name}`,
    },
    { key: "subject_name", header: "Subject" },
    {
      key: "code",
      header: "Code",
      render: (row) => (
        <span className="badge bg-gray-100 text-gray-700">{row.code}</span>
      ),
    },
    {
      key: "assigned_at",
      header: "Assigned",
      render: (row) => new Date(row.assigned_at).toLocaleDateString(),
    },
  ];

  return (
    <div>
      {/* Assignment form */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Qualify a teacher for a subject
        </h3>

        {assign.error && (
          <div className="mb-3 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
            {assign.error.message}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col sm:flex-row sm:items-end gap-3"
        >
          <div className="flex-1">
            <SelectField
              label="Teacher"
              error={errors.teacher_id?.message}
              {...register("teacher_id")}
            >
              <option value="">Select teacher...</option>
              {teachersData?.data?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.first_name} {t.last_name}
                </option>
              ))}
            </SelectField>
          </div>
          <div className="flex-1">
            <SelectField
              label="Subject"
              error={errors.subject_id?.message}
              {...register("subject_id")}
            >
              <option value="">Select subject...</option>
              {subjectsData?.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </SelectField>
          </div>
          <button
            type="submit"
            disabled={assign.isPending}
            className="btn-primary w-full sm:w-auto justify-center shrink-0"
          >
            <Plus size={16} /> {assign.isPending ? "Assigning..." : "Assign"}
          </button>
        </form>
      </div>

      {/* Existing assignments */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <TableSkeleton rows={8} cols={4} />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-600">{error.message}</p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data}
          emptyMessage="No teacher-subject assignments yet"
          actions={(row) => (
            <button
              onClick={() => setDeleteTarget(row)}
              className="text-gray-400 hover:text-red-600"
              aria-label="Unassign"
            >
              <Trash2 size={16} />
            </button>
          )}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          unassign.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }
        title="Remove qualification"
        message={`Remove ${deleteTarget?.first_name} ${deleteTarget?.last_name}'s qualification to teach ${deleteTarget?.subject_name}?`}
        isLoading={unassign.isPending}
      />
    </div>
  );
};

export default TeacherSubjectsTab;
