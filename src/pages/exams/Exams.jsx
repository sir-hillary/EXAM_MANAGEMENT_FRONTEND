import { useState } from "react";

import {
Plus,
Pencil,
Trash2,
CreditCard,
CalendarDays,
Filter,
ClipboardList,
GraduationCap,
BookOpen,
X,
CircleAlert,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
useExams,
useDeleteExam,
} from "../../hooks/useExams";

import { useClasses } from "../../hooks/useClasses";

import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import SelectField from "../../components/ui/SelectField";
import ExamFormModal from "./ExamFormModal";
import TableSkeleton from "../../components/ui/TableSkeleton";

/**

* Exam type badge styles.
*
* These names must match exam_types.name in the backend.
  */
  const examTypeBadge = {
  "Mid-term": "bg-amber-50 text-amber-700 border-amber-100",
  "End-term": "bg-violet-50 text-violet-700 border-violet-100",
  CAT: "bg-blue-50 text-blue-700 border-blue-100",
  };

/**

* Get the exam type returned by the backend.
  */
  const getExamType = (row) => {
  return row.exam_type || "Unknown";
  };

  const getSubjects = (row) => {
  return Array.isArray(row.subjects) ? row.subjects : [];
  };

/**

* Format exam date for display.
  */
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

const Exams = () => {
const [classFilter, setClassFilter] = useState("");
const [termFilter, setTermFilter] = useState("");
const [yearFilter, setYearFilter] = useState("");

const [formOpen, setFormOpen] = useState(false);
const [editingExam, setEditingExam] = useState(null);
const [deleteTarget, setDeleteTarget] = useState(null);

const navigate = useNavigate();

/**

* Fetch exams.
*
* The backend supports filtering by:
* * class_id
* * term_number
* * academic_year
    */
    const { data, isLoading, isError, error } = useExams({
    class_id: classFilter || undefined,
    term_number: termFilter || undefined,
    academic_year: yearFilter || undefined,
    });

/**

* Fetch classes for the filter.
  */
  const { data: classesData } = useClasses({
  limit: 100,
  });

const deleteExam = useDeleteExam();

const exams = data?.data || [];
const classes = classesData?.data || [];

const hasFilters = Boolean(
classFilter || termFilter || yearFilter
);

const clearFilters = () => {
setClassFilter("");
setTermFilter("");
setYearFilter("");
};

const openCreateModal = () => {
setEditingExam(null);
setFormOpen(true);
};

const openEditModal = (exam) => {
setEditingExam(exam);
setFormOpen(true);
};

const handleDelete = () => {
if (!deleteTarget) return;


deleteExam.mutate(deleteTarget.id, {
  onSuccess: () => {
    setDeleteTarget(null);
  },
});


};

const columns = [
{
key: "title",
header: "Exam",

  render: (row) => {
    const subjects = getSubjects(row);

    return (
      <div className="flex items-center gap-3 min-w-[230px] max-w-[360px]">
        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
          <ClipboardList size={17} />
        </div>

        <div className="min-w-0">
          <p
            className="font-semibold text-gray-900 truncate"
            title={row.title}
          >
            {row.title || "Untitled exam"}
          </p>

          {subjects.length > 0 ? (
            <div className="mt-1 space-y-0.5">
              {subjects.length <= 2 ? (
                subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center gap-1.5 min-w-0"
                  >
                    <BookOpen
                      size={11}
                      className="text-gray-400 shrink-0"
                    />

                    <p
                      className="text-xs text-gray-400 truncate"
                      title={subject.name}
                    >
                      {subject.name}
                      {" · "}
                      {subject.question_count}{" "}
                      {subject.question_count === 1
                        ? "question"
                        : "questions"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-1.5 min-w-0">
                  <BookOpen
                    size={11}
                    className="text-gray-400 shrink-0"
                  />

                  <p
                    className="text-xs text-gray-400 truncate"
                    title={subjects
                      .map((subject) => subject.name)
                      .join(", ")}
                  >
                    {subjects.length} subjects
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-1">
              No subjects assigned
            </p>
          )}
        </div>
      </div>
    );
  },
},

{
  key: "class_name",
  header: "Class",

  render: (row) => (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <div className="w-7 h-7 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center">
        <GraduationCap size={14} />
      </div>

      <span className="text-sm font-medium text-gray-700">
        {row.class_name || "—"}
      </span>
    </div>
  ),
},

{
  key: "exam_type",
  header: "Type",

  render: (row) => {
    const examType = getExamType(row);

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border ${
          examTypeBadge[examType] ||
          "bg-gray-50 text-gray-600 border-gray-100"
        }`}
      >
        {examType}
      </span>
    );
  },
},

{
  key: "exam_date",
  header: "Date",

  render: (row) => (
    <div className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap">
      <CalendarDays
        size={13}
        className="text-gray-400"
      />

      {formatDate(row.exam_date)}
    </div>
  ),
},

{
  key: "total_questions",
  header: "Questions",

  render: (row) => {
    const totalQuestions = Number(row.total_questions || 0);
    const assignedQuestions = Number(
      row.assigned_question_count || 0
    );

    const isComplete =
      assignedQuestions === totalQuestions;

    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center justify-center w-fit min-w-12 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100 text-sm font-semibold text-gray-700">
          {totalQuestions || "—"}
        </span>

        {totalQuestions > 0 && (
          <span
            className={`text-[10px] whitespace-nowrap ${
              isComplete
                ? "text-emerald-600"
                : "text-amber-600"
            }`}
          >
            {assignedQuestions}/{totalQuestions} assigned
          </span>
        )}
      </div>
    );
  },
},

{
  key: "term_number",
  header: "Term",

  render: (row) => (
    <span className="text-sm text-gray-600 whitespace-nowrap">
      {row.term_number
        ? `Term ${row.term_number}`
        : "—"}
    </span>
  ),
},

{
  key: "academic_year",
  header: "Academic year",

  render: (row) => (
    <span className="text-sm text-gray-600 whitespace-nowrap">
      {row.academic_year || "—"}
    </span>
  ),
},


];

return ( <div className="space-y-5">
{/* Page header */}
  <PageHeader
    title="Exams"
    description="Schedule, organize and manage academic examinations"
    action={
      <button
        type="button"
        onClick={openCreateModal}
        className="btn-primary w-full sm:w-auto justify-center shadow-sm"
      >
        <Plus size={16} />
        New exam
      </button>
    }
  />

  {/* Filters */}

  <section className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
    <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
          <Filter size={15} />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">
            Filter exams
          </p>

          <p className="text-[11px] text-gray-400">
            Narrow results by class, term or academic year
          </p>
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          <X size={13} />
          Clear filters
        </button>
      )}
    </div>

    <div className="p-4 sm:p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Class */}

        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Class
          </label>

          <SelectField
            value={classFilter}
            onChange={(e) =>
              setClassFilter(e.target.value)
            }
            className="w-full"
          >
            <option value="">All classes</option>

            {classes.map((classItem) => (
              <option
                key={classItem.id}
                value={classItem.id}
              >
                {classItem.name}
              </option>
            ))}
          </SelectField>
        </div>

        {/* Term */}

        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Term
          </label>

          <SelectField
            value={termFilter}
            onChange={(e) =>
              setTermFilter(e.target.value)
            }
            className="w-full"
          >
            <option value="">All terms</option>
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </SelectField>
        </div>

        {/* Academic year */}

        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Academic year
          </label>

          <input
            value={yearFilter}
            onChange={(e) =>
              setYearFilter(e.target.value)
            }
            placeholder="e.g. 2026/2027"
            className="input-field w-full"
          />
        </div>
      </div>

      {/* Active filters */}

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            Active:
          </span>

          {classFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-[11px] font-medium text-brand-700">
              Class selected
            </span>
          )}

          {termFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-[11px] font-medium text-brand-700">
              Term {termFilter}
            </span>
          )}

          {yearFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-[11px] font-medium text-brand-700">
              {yearFilter}
            </span>
          )}
        </div>
      )}
    </div>
  </section>

  {/* Results heading */}

  {!isLoading && !isError && (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">
          Exam schedule
        </h2>

        <p className="text-xs text-gray-400 mt-0.5">
          {exams.length > 0
            ? `${exams.length} exam${
                exams.length === 1 ? "" : "s"
              } found`
            : "No exams found"}
        </p>
      </div>

      {hasFilters && (
        <div className="inline-flex self-start sm:self-auto items-center gap-1.5 text-[11px] font-medium text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-full">
          <Filter size={11} />
          Filters active
        </div>
      )}
    </div>
  )}

  {/* Content */}

  {isLoading ? (
    <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
      <TableSkeleton rows={8} cols={7} />
    </div>
  ) : isError ? (
    <div className="bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
      <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
        <CircleAlert size={19} />
      </div>

      <p className="text-sm font-semibold text-gray-900">
        Unable to load exams
      </p>

      <p className="text-xs text-red-600 mt-1 max-w-md mx-auto">
        {error?.response?.data?.error ||
          error?.message ||
          "Something went wrong while loading exams."}
      </p>
    </div>
  ) : (
    <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
      <DataTable
        columns={columns}
        data={exams}
        emptyMessage={
          hasFilters
            ? "No exams match the selected filters."
            : "No exams scheduled yet."
        }
        actions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            {/* Edit */}

            <button
              type="button"
              onClick={() => openEditModal(row)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
              aria-label="Edit exam"
              title="Edit exam"
            >
              <Pencil size={14} />
            </button>

            {/* Exam fees */}

            <button
              type="button"
              onClick={() =>
                navigate(`/exam-fees/${row.id}`)
              }
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
              aria-label="Manage exam fees"
              title="Manage exam fees"
            >
              <CreditCard size={14} />
            </button>

            {/* Delete */}

            <button
              type="button"
              onClick={() =>
                setDeleteTarget(row)
              }
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

  {/* Exam form */}

  <ExamFormModal
    isOpen={formOpen}
    onClose={() => {
      setFormOpen(false);
      setEditingExam(null);
    }}
    initialData={editingExam}
  />

  {/* Delete confirmation */}

  <ConfirmDialog
    isOpen={!!deleteTarget}
    onClose={() => setDeleteTarget(null)}
    onConfirm={handleDelete}
    title="Delete exam"
    message={
      deleteTarget
        ? `Delete "${deleteTarget.title}"? Exams with recorded results cannot be deleted.`
        : ""
    }
    isLoading={deleteExam.isPending}
  />
</div>

);
};

export default Exams;
