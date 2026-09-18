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

  const subjects = data?.data ?? [];

  const columns = [
    {
      key: "name",
      header: "Subject",
      render: (row) => (
        <span className="font-medium text-gray-900">{row.name}</span>
      ),
    },

    {
      key: "code",
      header: "Code",
      render: (row) => (
        <span className="badge bg-gray-100 text-gray-700">{row.code}</span>
      ),
    },

    {
      key: "max_marks",
      header: "Max marks",
      render: (row) => (
        <span className="text-gray-700">{row.max_marks ?? 100}</span>
      ),
    },
  ];

  if (isLoading) {
    return <TableSkeleton rows={8} cols={4} />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">
          Failed to load subjects
        </p>

        <p className="mt-1 text-sm text-red-600">
          {error?.message || "Something went wrong while loading subjects."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Subjects"
        description="Manage the subjects taught at your school"
        action={
          <button
            type="button"
            onClick={() => {
              setEditingSubject(null);
              setFormOpen(true);
            }}
            className="btn-primary w-full sm:w-auto justify-center"
          >
            <Plus size={16} />
            New subject
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={subjects}
        actions={(row) => (
          <>
            <button
              type="button"
              onClick={() => {
                setEditingSubject(row);
                setFormOpen(true);
              }}
              className="text-gray-400 hover:text-brand-600"
              aria-label={`Edit ${row.name}`}
              title={`Edit ${row.name}`}
            >
              <Pencil size={16} />
            </button>

            <button
              type="button"
              onClick={() => setDeleteTarget(row)}
              className="text-gray-400 hover:text-red-600"
              aria-label={`Delete ${row.name}`}
              title={`Delete ${row.name}`}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      />

      <SubjectFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingSubject(null);
        }}
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
