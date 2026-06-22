import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useTeachers, useDeleteTeacher } from "../../hooks/useTeachers";
import  PageHeader  from "../../components/ui/PageHeader";
import  DataTable  from "../../components/ui/DataTable";
import  ConfirmDialog  from "../../components/ui/ConfirmDialog";
import  TeacherFormModal  from "./TeacherFormModal";
import TableSkeleton from "../../components/ui/TableSkeleton";

const Teachers = () => {
  const { data, isLoading, isError, error } = useTeachers();
  const deleteTeacher = useDeleteTeacher();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (row) => `${row.first_name} ${row.last_name}`,
    },
    { key: "email", header: "Email" },
    { key: "employee_number", header: "Employee #" },
  ];

 if (isLoading) return <TableSkeleton rows={8} cols={4} />;
  if (isError) return <p className="text-sm text-red-600">{error.message}</p>;

  return (
    <div>
      <PageHeader
        title="Teachers"
        description="Manage teaching staff"
        action={
          <button
            onClick={() => {
              setEditingTeacher(null);
              setFormOpen(true);
            }}
            className="btn-primary w-full sm:w-auto justify-center"
          >
            <Plus size={16} /> New teacher
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data}
        actions={(row) => (
          <>
            <button
              onClick={() => {
                setEditingTeacher(row);
                setFormOpen(true);
              }}
              className="text-gray-400 hover:text-brand-600"
              aria-label="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setDeleteTarget(row)}
              className="text-gray-400 hover:text-red-600"
              aria-label="Delete"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      />

      <TeacherFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingTeacher}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteTeacher.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }
        title="Delete teacher"
        message={`Are you sure you want to delete "${deleteTarget?.first_name} ${deleteTarget?.last_name}"?`}
        isLoading={deleteTeacher.isPending}
      />
    </div>
  );
};

export default Teachers;
