import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useStudents, useDeleteStudent } from "../../hooks/useStudents";
import { useClasses } from "../../hooks/useClasses";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import StudentFormModal from "./StudentFormModal";
import TableSkeleton from "../../components/ui/TableSkeleton";

const Students = () => {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useStudents({
    search: search || undefined,
    class_id: classFilter || undefined,
    page,
    limit: 20,
  });
  const { data: classesData } = useClasses({ limit: 100 });
  const deleteStudent = useDeleteStudent();

  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (row) => `${row.first_name} ${row.last_name}`,
    },
    { key: "student_number", header: "Student #" },
    {
      key: "class_name",
      header: "Class",
      render: (row) => row.class_name || "—",
    },
    {
      key: "date_of_birth",
      header: "Date of birth",
      render: (row) =>
        row.date_of_birth
          ? new Date(row.date_of_birth).toLocaleDateString()
          : "—",
    },
  ];

  if (isLoading) return <TableSkeleton rows={8} cols={4} />;

  if (isError) return <p className="text-sm text-red-600">{error.message}</p>;

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage student enrollment"
        action={
          <button
            onClick={() => {
              setEditingStudent(null);
              setFormOpen(true);
            }}
            className="btn-primary w-full sm:w-auto justify-center"
          >
            <Plus size={16} /> New student
          </button>
        }
      />

      {/* Filters — stack on mobile, inline on desktop */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or student number..."
            className="input-field pl-8"
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => {
            setClassFilter(e.target.value);
            setPage(1);
          }}
          className="input-field sm:w-48"
        >
          <option value="">All classes</option>
          {classesData?.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.data}
            emptyMessage="No students match your filters"
            actions={(row) => (
              <>
                <button
                  onClick={() => {
                    setEditingStudent(row);
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

          {data?.meta && data.meta.total_pages > 1 && (
            <div className="flex items-center justify-center sm:justify-between gap-3 mt-4">
              <span className="hidden sm:inline text-xs text-gray-500">
                Page {data.meta.page} of {data.meta.total_pages} ·{" "}
                {data.meta.total} total
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-secondary text-xs px-2.5 py-1"
                >
                  Previous
                </button>
                <button
                  disabled={page >= data.meta.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary text-xs px-2.5 py-1"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <StudentFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingStudent}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteStudent.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }
        title="Delete student"
        message={`Are you sure you want to delete "${deleteTarget?.first_name} ${deleteTarget?.last_name}"? Students with existing results cannot be deleted.`}
        isLoading={deleteStudent.isPending}
      />
    </div>
  );
};

export default Students;
