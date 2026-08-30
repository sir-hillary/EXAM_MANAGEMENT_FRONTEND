import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  CalendarDays,
  Filter,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useExams, useDeleteExam } from "../../hooks/useExams";
import { useClasses } from "../../hooks/useClasses";

import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import SelectField from "../../components/ui/SelectField";
import ExamFormModal from "./ExamFormModal";
import TableSkeleton from "../../components/ui/TableSkeleton";

const examTypeBadge = {
  "Mid-term":
    "bg-amber-50 text-amber-700 border border-amber-100",
  "End-term":
    "bg-violet-50 text-violet-700 border border-violet-100",
};

const Exams = () => {
  const [classFilter, setClassFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useExams({
    class_id: classFilter || undefined,
    term_number: termFilter || undefined,
    academic_year: yearFilter || undefined,
  });

  const { data: classesData } = useClasses({ limit: 100 });
  const deleteExam = useDeleteExam();

  const hasFilters = classFilter || termFilter || yearFilter;

  const clearFilters = () => {
    setClassFilter("");
    setTermFilter("");
    setYearFilter("");
  };

  const columns = [
    {
      key: "title",
      header: "Exam",
      render: (row) => (
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <ClipboardList size={16} />
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {row.title}
            </p>

            <p className="text-xs text-gray-400 mt-0.5">
              {row.subject_name || "No subject"}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "class_name",
      header: "Class",
      render: (row) => (
        <span className="text-sm font-medium text-gray-700">
          {row.class_name || "—"}
        </span>
      ),
    },

    {
      key: "exam_type",
      header: "Type",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
            examTypeBadge[row.exam_type] ||
            "bg-gray-50 text-gray-600 border border-gray-100"
          }`}
        >
          {row.exam_type || "Unknown"}
        </span>
      ),
    },

    {
      key: "exam_date",
      header: "Date",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap">
          <CalendarDays size={13} className="text-gray-400" />
          {row.exam_date
            ? new Date(row.exam_date).toLocaleDateString()
            : "—"}
        </div>
      ),
    },

    {
      key: "total_marks",
      header: "Marks",
      render: (row) => (
        <span className="text-sm font-semibold text-gray-700">
          {row.total_marks ?? "—"}
        </span>
      ),
    },

    {
      key: "term",
      header: "Term",
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.term_number ? `Term ${row.term_number}` : "—"}
        </span>
      ),
    },

    {
      key: "academic_year",
      header: "Academic year",
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.academic_year || "—"}
        </span>
      ),
    },
  ];

  const openCreateModal = () => {
    setEditingExam(null);
    setFormOpen(true);
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);
    setFormOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* ─────────────────────────────────────────────────────────────
          Page header
      ───────────────────────────────────────────────────────────── */}
      <PageHeader
        title="Exams"
        description="Schedule, organize and manage academic examinations"
        action={
          <button
            onClick={openCreateModal}
            className="btn-primary w-full sm:w-auto justify-center shadow-sm"
          >
            <Plus size={16} />
            New exam
          </button>
        }
      />

      {/* ─────────────────────────────────────────────────────────────
          Filters
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center">
              <Filter size={15} />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Filter exams
              </p>
              <p className="text-[11px] text-gray-400">
                Narrow the list by class, term or academic year
              </p>
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="self-start sm:self-auto text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Class
              </label>

              <SelectField
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full"
              >
                <option value="">All classes</option>

                {classesData?.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectField>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Term
              </label>

              <SelectField
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
                className="w-full"
              >
                <option value="">All terms</option>
                <option value="1">Term 1</option>
                <option value="2">Term 2</option>
                <option value="3">Term 3</option>
              </SelectField>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Academic year
              </label>

              <input
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                placeholder="e.g. 2024/2025"
                className="input-field w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          Results heading
      ───────────────────────────────────────────────────────────── */}
      {!isLoading && !isError && (
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Exam schedule
            </h2>

            <p className="text-xs text-gray-400 mt-0.5">
              {data?.data?.length
                ? `${data.data.length} exam${
                    data.data.length === 1 ? "" : "s"
                  } found`
                : "No exams found"}
            </p>
          </div>

          {hasFilters && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-full">
              <Filter size={11} />
              Filters active
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          Content
      ───────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
          <TableSkeleton rows={8} cols={7} />
        </div>
      ) : isError ? (
        <div className="bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
            <ClipboardList size={18} />
          </div>

          <p className="text-sm font-semibold text-gray-900">
            Unable to load exams
          </p>

          <p className="text-xs text-red-600 mt-1">
            {error?.message || "Something went wrong while loading exams."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
          <DataTable
            columns={columns}
            data={data?.data}
            emptyMessage="No exams scheduled yet"
            actions={(row) => (
              <div className="flex items-center justify-end gap-1.5">
                {/* Edit */}
                <button
                  onClick={() => openEditModal(row)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                  aria-label="Edit exam"
                  title="Edit exam"
                >
                  <Pencil size={14} />
                </button>

                {/* Exam fees */}
                <button
                  onClick={() => navigate(`/exam-fees/${row.id}`)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                  aria-label="Manage exam fees"
                  title="Manage exam fees"
                >
                  <CreditCard size={14} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => setDeleteTarget(row)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  aria-label="Delete exam"
                  title="Delete exam"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          Exam form
      ───────────────────────────────────────────────────────────── */}
      <ExamFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingExam}
      />

      {/* ─────────────────────────────────────────────────────────────
          Delete confirmation
      ───────────────────────────────────────────────────────────── */}
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
