import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useExams, useDeleteExam } from "../../hooks/useExams";
import { useClasses } from "../../hooks/useClasses";
import  PageHeader  from "../../components/ui/PageHeader";
import  DataTable  from "../../components/ui/DataTable";
import  ConfirmDialog  from "../../components/ui/ConfirmDialog";
import  SelectField  from "../../components/ui/SelectField";
import  ExamFormModal  from "./ExamFormModal";
import TableSkeleton from "../../components/ui/TableSkeleton";

const examTypeBadge = {
  "Mid-term": "bg-amber-100 text-amber-700",
  "End-term": "bg-purple-100 text-purple-700",
};

const Exams = () => {
  const [classFilter, setClassFilter] = useState("");
  const { data, isLoading, isError, error } = useExams({
    class_id: classFilter || undefined,
  });
  const { data: classesData } = useClasses({ limit: 100 });
  const deleteExam = useDeleteExam();

  const [formOpen, setFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = [
    { key: "title", header: "Title" },
    { key: "class_name", header: "Class" },
    { key: "subject_name", header: "Subject" },
    {
      key: "exam_type",
      header: "Type",
      render: (row) => (
        <span
          className={`badge ${examTypeBadge[row.exam_type] || "bg-gray-100 text-gray-700"}`}
        >
          {row.exam_type}
        </span>
      ),
    },
    {
      key: "exam_date",
      header: "Date",
      render: (row) => new Date(row.exam_date).toLocaleDateString(),
    },
    { key: "total_marks", header: "Total marks" },
  ];

  if (isLoading) return <TableSkeleton rows={8} cols={4} />;

  if (isError) return <p className="text-sm text-red-600">{error.message}</p>;

  return (
    <div>
      <PageHeader
        title="Exams"
        description="Schedule and manage exams"
        action={
          <button
            onClick={() => {
              setEditingExam(null);
              setFormOpen(true);
            }}
            className="btn-primary w-full sm:w-auto justify-center"
          >
            <Plus size={16} /> New exam
          </button>
        }
      />

      <div className="mb-4 sm:w-64">
        <SelectField
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        >
          <option value="">All classes</option>
          {classesData?.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <TableSkeleton rows={8} cols={4} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data}
          emptyMessage="No exams scheduled yet"
          actions={(row) => (
            <>
              <button
                onClick={() => {
                  setEditingExam(row);
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
      )}

      <ExamFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingExam}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteExam.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }
        title="Delete exam"
        message={`Delete "${deleteTarget?.title}"? Exams with recorded results cannot be deleted.`}
        isLoading={deleteExam.isPending}
      />
    </div>
  );
};

export default Exams;
