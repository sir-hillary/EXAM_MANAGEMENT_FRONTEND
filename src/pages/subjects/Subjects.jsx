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
    {
      key: "name",
      header: "Subject",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.parent_subject_id && (
            <span className="w-4 h-px bg-gray-300 inline-block ml-2" />
          )}
          <span
            className={
              row.parent_subject_id
                ? "text-gray-600"
                : "font-medium text-gray-900"
            }
          >
            {row.name}
          </span>
          {row.is_split_paper && (
            <span className="badge bg-blue-100 text-blue-700">split</span>
          )}
          {row.parent_subject_id && (
            <span className="badge bg-amber-100 text-amber-700">
              Paper {row.paper_number}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "code",
      header: "Code",
      render: (row) => (
        <span className="badge bg-gray-100 text-gray-700">{row.code}</span>
      ),
    },
    { key: "max_marks", header: "Max marks" },
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
