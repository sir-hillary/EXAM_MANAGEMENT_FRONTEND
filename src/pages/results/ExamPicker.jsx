import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardEdit,
  BarChart3,
  CalendarDays,
  BookOpen,
  GraduationCap,
  Filter,
  ClipboardList,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useExams } from "../../hooks/useExams";
import { useClasses } from "../../hooks/useClasses";

import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import SelectField from "../../components/ui/SelectField";
import TableSkeleton from "../../components/ui/TableSkeleton";

const examTypeBadge = {
  "Mid-term": "bg-amber-100 text-amber-700 ring-amber-200",
  "End-term": "bg-purple-100 text-purple-700 ring-purple-200",
  CAT: "bg-blue-100 text-blue-700 ring-blue-200",
};

const formatDate = (date) => {
  if (!date) return "—";

  // Prevent timezone shifts when PostgreSQL returns YYYY-MM-DD.
  const dateString = String(date).slice(0, 10);
  const parsedDate = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getExamTypeClass = (type) =>
  examTypeBadge[type] || "bg-gray-100 text-gray-700 ring-gray-200";

const ExamPicker = () => {
  const navigate = useNavigate();
  const [classFilter, setClassFilter] = useState("");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useExams({
    class_id: classFilter || undefined,
  });

  const { data: classesData } = useClasses({ limit: 100 });

  const exams = data?.data || [];
  const classes = classesData?.data || [];

  const handleEnterResults = (examId) => {
    navigate(`/results/entry/${examId}`);
  };

  const handleViewSummary = (examId) => {
    navigate(`/results/summary/${examId}`);
  };

  const columns = [
    {
      key: "title",
      header: "Exam",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.title}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {row.academic_year || "Academic year not specified"}
          </p>
        </div>
      ),
    },
    {
      key: "class_name",
      header: "Class",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
          <GraduationCap size={15} className="text-gray-400" />
          {row.class_name || "—"}
        </span>
      ),
    },
    {
      key: "subject_name",
      header: "Subject",
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.subject_name ||
            row.subjects?.map((subject) => subject.subject_name).join(", ") ||
            "Multiple subjects"}
        </span>
      ),
    },
    {
      key: "exam_type",
      header: "Exam Type",
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getExamTypeClass(
            row.exam_type
          )}`}
        >
          {row.exam_type || "Exam"}
        </span>
      ),
    },
    {
      key: "exam_date",
      header: "Exam Date",
      render: (row) => (
        <span className="text-sm text-gray-600">
          {formatDate(row.exam_date)}
        </span>
      ),
    },
  ];

  const renderActions = (row) => (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => handleEnterResults(row.id)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        aria-label={`Enter results for ${row.title}`}
        title="Enter results"
      >
        <ClipboardEdit size={15} />
        <span>Enter</span>
      </button>

      <button
        type="button"
        onClick={() => handleViewSummary(row.id)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        aria-label={`View summary for ${row.title}`}
        title="View summary"
      >
        <BarChart3 size={15} />
        <span>Summary</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Results"
        description="Select an exam to enter learner results or view class performance."
      />

      {/* Overview */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <ClipboardList size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Exam results management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Choose an exam to record scores or review performance.
              </p>
            </div>
          </div>

          {!isLoading && !isError && (
            <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
              <BookOpen size={16} className="text-gray-400" />
              <span>
                <strong className="text-gray-900">{exams.length}</strong>{" "}
                {exams.length === 1 ? "exam" : "exams"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <Filter size={17} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-800">
            Filter exams
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label
              htmlFor="classFilter"
              className="mb-1.5 block text-xs font-medium text-gray-500"
            >
              Class
            </label>

            <SelectField
              id="classFilter"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="">All classes</option>

              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </SelectField>
          </div>

          {classFilter && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setClassFilter("")}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-brand-600 transition hover:bg-brand-50"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 text-red-600" />

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">
                Unable to load exams
              </h3>

              <p className="mt-1 text-sm text-red-700">
                {error?.response?.data?.message ||
                  error?.message ||
                  "Something went wrong while fetching exams."}
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-900"
              >
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <TableSkeleton rows={6} cols={5} />
        </div>
      ) : !isError ? (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="font-semibold text-gray-900">Available exams</h3>
              <p className="mt-1 text-xs text-gray-500">
                Manage results and review exam performance.
              </p>
            </div>

            <DataTable
              columns={columns}
              data={exams}
              emptyMessage="No exams found for the selected class."
              actions={renderActions}
            />
          </div>

          {/* Mobile exam cards */}
          <div className="space-y-3 md:hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Available exams
              </h3>

              {isFetching && (
                <RefreshCw size={15} className="animate-spin text-gray-400" />
              )}
            </div>

            {exams.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center">
                <ClipboardList
                  size={30}
                  className="mx-auto mb-3 text-gray-300"
                />
                <p className="font-medium text-gray-700">No exams found</p>
                <p className="mt-1 text-sm text-gray-500">
                  Try selecting another class or clearing the filter.
                </p>
              </div>
            ) : (
              exams.map((exam) => (
                <div
                  key={exam.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="break-words font-semibold text-gray-900">
                        {exam.title}
                      </h4>

                      <p className="mt-1 text-xs text-gray-500">
                        {exam.academic_year || "Academic year not specified"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${getExamTypeClass(
                        exam.exam_type
                      )}`}
                    >
                      {exam.exam_type || "Exam"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap
                        size={15}
                        className="shrink-0 text-gray-400"
                      />
                      <span>{exam.class_name || "Class not specified"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen
                        size={15}
                        className="shrink-0 text-gray-400"
                      />
                      <span>
                        {exam.subject_name ||
                          exam.subjects
                            ?.map((subject) => subject.subject_name)
                            .join(", ") ||
                          "Multiple subjects"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarDays
                        size={15}
                        className="shrink-0 text-gray-400"
                      />
                      <span>{formatDate(exam.exam_date)}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                    <button
                      type="button"
                      onClick={() => handleEnterResults(exam.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                      <ClipboardEdit size={15} />
                      Enter Results
                    </button>

                    <button
                      type="button"
                      onClick={() => handleViewSummary(exam.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                    >
                      <BarChart3 size={15} />
                      Summary
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ExamPicker;