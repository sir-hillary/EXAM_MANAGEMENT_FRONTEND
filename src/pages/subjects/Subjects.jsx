import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useSubjects, useDeleteSubject } from "../../hooks/useSubjects";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import SubjectFormModal from "./SubjectFormModal";
import TableSkeleton from "../../components/ui/TableSkeleton";

const Subjects = () => {
  const { data, isLoading, isError, error } = useSubjects();
  const deleteSubject = useDeleteSubject();

  const [formOpen, setFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = [
    { key: "name", header: "Name" },
    {
      key: "code",
      header: "Code",
      render: (row) => (
        <span className="badge bg-gray-100 text-gray-700">{row.code}</span>
      ),
    },
  ];

 if (isLoading) return <TableSkeleton rows={8} cols={4} />;
  if (isError) return <p className="text-sm text-red-600">{error.message}</p>;

  return (
    <div>
      <PageHeader
        title="Subjects"
        description="Manage the subjects taught at your school"
        action={
          <button
            onClick={() => {
              setEditingSubject(null);
              setFormOpen(true);
            }}
            className="btn-primary w-full sm:w-auto justify-center"
          >
            <Plus size={16} /> New subject
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
                setEditingSubject(row);
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

      <SubjectFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingSubject}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteSubject.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }
        title="Delete subject"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        isLoading={deleteSubject.isPending}
      />
    </div>
  );
};

export default Subjects;
