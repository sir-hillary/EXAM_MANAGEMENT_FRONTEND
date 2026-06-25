import { useState } from "react";
import { Plus, Pencil, Trash2, BarChart3 } from "lucide-react";
import { useClasses, useDeleteClass } from "../../hooks/useClasses";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ClassFormModal from "./ClassFormModal";
import TableSkeleton from "../../components/ui/TableSkeleton";
import { getDivision } from "../../utils/schoolDivisions";
import { useNavigate } from "react-router-dom";

const Classes = () => {
  const { data, isLoading, isError, error } = useClasses();
  const deleteClass = useDeleteClass();

  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const columns = [
    { key: "name", header: "Name" },
    {
      key: "division",
      header: "Division",
      render: (row) => {
        const div = getDivision(row.grade);
        return <span className={`badge ${div.color}`}>{div.label}</span>;
      },
    },
    { key: "grade", header: "Grade" },
    {
      key: "class_teacher_name",
      header: "Class teacher",
      render: (row) =>
        row.class_teacher_name ? (
          <span className="text-gray-700">{row.class_teacher_name}</span>
        ) : (
          <span className="text-gray-400 text-xs">Unassigned</span>
        ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  if (isLoading) return <TableSkeleton rows={8} cols={4} />;

  if (isError) {
    return <p className="text-sm text-red-600">{error.message}</p>;
  }

  return (
    <div>
      <PageHeader
        title="Classes"
        description="Manage the classes offered at your school"
        action={
          <button
            onClick={() => {
              setEditingClass(null);
              setFormOpen(true);
            }}
            className="btn-primary w-full sm:w-auto justify-center"
          >
            <Plus size={16} /> New class
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data}
        actions={(row) => (
          <>
            <button
              onClick={() => navigate(`/classes/${row.id}/performance`)}
              className="text-gray-400 hover:text-brand-600"
              aria-label="View performance"
              title="Class performance"
            >
              <BarChart3 size={16} />
            </button>
            <button
              onClick={() => {
                setEditingClass(row);
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

      <ClassFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingClass}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteClass.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
        title="Delete class"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        isLoading={deleteClass.isPending}
      />
    </div>
  );
};

export default Classes;
