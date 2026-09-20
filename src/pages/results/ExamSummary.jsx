import { useParams, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Users,
  TrendingUp,
  Award,
  ChartNoAxesColumn,
  ClipboardList,
  CircleAlert,
  BookOpen,
  CalendarDays,
} from "lucide-react";

import { useExam } from "../../hooks/useExams";
import {
  useExamSummary,
  useResultsByExam,
} from "../../hooks/useResults";

import DataTable from "../../components/ui/DataTable";
import TableSkeleton from "../../components/ui/TableSkeleton";
import { gradeBadge } from "../../utils/gradeColors";

// ─── Constants ────────────────────────────────────────────

const GRADES = [
  "EE1",
  "EE2",
  "ME1",
  "ME2",
  "AE1",
  "AE2",
  "BE1",
  "BE2",
];

// ─── Reusable Stat Card ───────────────────────────────────

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  iconClass = "bg-brand-50 text-brand-600",
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>

        <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          {value}
        </p>

        {sub && (
          <p className="mt-1 text-xs text-gray-400">{sub}</p>
        )}
      </div>

      {Icon && (
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} />
        </div>
      )}
    </div>
  </div>
);

// ─── Helpers ──────────────────────────────────────────────

const formatPercentage = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  return Number.isFinite(number) ? `${number.toFixed(2)}%` : "—";
};

const getGradeCount = (summary, grade) => {
  return Number(summary?.[`grade_${grade.toLowerCase()}`] || 0);
};

// ─── Exam Summary ─────────────────────────────────────────

const ExamSummary = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const {
    data: examData,
    isLoading: examLoading,
    isError: examError,
  } = useExam(examId);

  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useExamSummary(examId);

  const {
    data: resultsData,
    isLoading: resultsLoading,
    isError: resultsError,
  } = useResultsByExam(examId);

  const exam = examData?.data;
  const summary = summaryData?.data;
  const results = resultsData?.data || [];

  const totalStudents = Number(summary?.total_students || 0);

  const totalQuestions = Number(exam?.total_questions || 0);

  const hasResults = totalStudents > 0;

  // ─── Results Table Columns ──────────────────────────────

  const columns = [
    {
      key: "student",
      header: "Learner",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.first_name} {row.last_name}
          </p>

          <p className="mt-0.5 text-xs text-gray-400">
            {row.student_number || "No admission number"}
          </p>
        </div>
      ),
    },
    {
      key: "questions_correct",
      header: "Correct",
      render: (row) => (
        <span className="font-medium text-gray-700">
          {row.questions_correct ?? 0}
          <span className="mx-1 text-gray-300">/</span>
          {row.total_questions ?? totalQuestions}
        </span>
      ),
    },
    {
      key: "percentage",
      header: "Percentage",
      render: (row) => (
        <span className="font-semibold text-gray-900">
          {formatPercentage(row.percentage)}
        </span>
      ),
    },
    {
      key: "grade",
      header: "Grade",
      render: (row) =>
        row.grade ? (
          <span className={`badge ${gradeBadge(row.grade)}`}>
            {row.grade}
          </span>
        ) : (
          <span className="text-xs text-gray-400">Not graded</span>
        ),
    },
    {
      key: "remarks",
      header: "Remarks",
      render: (row) => (
        <span className="text-sm text-gray-500">
          {row.remarks || "—"}
        </span>
      ),
    },
  ];

  // ─── Loading State ──────────────────────────────────────

  if (examLoading || summaryLoading || resultsLoading) {
    return <TableSkeleton rows={8} cols={5} />;
  }

  // ─── Error States ──────────────────────────────────────

  if (examError || !exam) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-2 text-red-700">
          <CircleAlert size={18} />

          <p className="text-sm font-medium">
            Unable to load this examination.
          </p>
        </div>

        <button
          onClick={() => navigate("/results")}
          className="mt-4 text-sm font-medium text-red-700 hover:underline"
        >
          Back to exams
        </button>
      </div>
    );
  }

  if (summaryError || resultsError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-2 text-red-700">
          <CircleAlert size={18} />

          <p className="text-sm font-medium">
            Failed to load examination results.
          </p>
        </div>

        <p className="mt-1 text-sm text-red-600">
          Please refresh the page or try again later.
        </p>
      </div>
    );
  }

  // ─── Main UI ────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-5">
      {/* ─── Header ──────────────────────────────────────── */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/results")}
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
            aria-label="Back to exams"
          >
            <ArrowLeft size={17} />
          </button>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600">
              Examination Management
            </p>

            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Exam Summary
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Review learner performance and grade distribution.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/results/entry/${examId}`)}
          className="btn-primary w-full justify-center sm:w-auto"
        >
          <ClipboardList size={16} />
          Enter Scores
        </button>
      </div>

      {/* ─── Exam Overview ───────────────────────────────── */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {exam.exam_type && (
              <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                {exam.exam_type}
              </span>
            )}

            {exam.term_number && (
              <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                Term {exam.term_number}
              </span>
            )}

            {exam.academic_year && (
              <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                {exam.academic_year}
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
            {exam.title}
          </h2>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Users size={15} />
              {exam.class_name || "Class"}
            </span>

            <span className="flex items-center gap-1.5">
              <BookOpen size={15} />
              {exam.subject_name || "Multiple subjects"}
            </span>

            {exam.exam_date && (
              <span className="flex items-center gap-1.5">
                <CalendarDays size={15} />
                {new Date(exam.exam_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-gray-50/70 px-5 py-4 sm:grid-cols-3 sm:px-6">
          <div>
            <p className="text-xs font-medium text-gray-500">
              Maximum score
            </p>

            <p className="mt-1 text-lg font-bold text-gray-900">
              {totalQuestions}
              <span className="ml-1 text-xs font-normal text-gray-400">
                questions
              </span>
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500">
              Learners assessed
            </p>

            <p className="mt-1 text-lg font-bold text-gray-900">
              {totalStudents}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs font-medium text-gray-500">
              Assessment status
            </p>

            <p
              className={`mt-1 text-sm font-semibold ${
                hasResults ? "text-green-600" : "text-amber-600"
              }`}
            >
              {hasResults ? "Results available" : "Awaiting results"}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Empty State ─────────────────────────────────── */}

      {!hasResults ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <ClipboardList size={26} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            No results recorded yet
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
            Once learner scores are entered, the exam statistics,
            grade distribution, and results table will appear here.
          </p>

          <button
            onClick={() => navigate(`/results/entry/${examId}`)}
            className="btn-primary mt-5 justify-center"
          >
            <ClipboardList size={16} />
            Enter Learner Scores
          </button>
        </div>
      ) : (
        <>
          {/* ─── Performance Statistics ──────────────────── */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Learners Assessed"
              value={totalStudents}
              sub="Recorded results"
              icon={Users}
            />

            <StatCard
              label="Average Score"
              value={formatPercentage(summary?.average_percentage)}
              sub="Class average"
              icon={TrendingUp}
              iconClass="bg-blue-50 text-blue-600"
            />

            <StatCard
              label="Highest Score"
              value={formatPercentage(summary?.highest_percentage)}
              sub="Top percentage"
              icon={Award}
              iconClass="bg-green-50 text-green-600"
            />

            <StatCard
              label="Lowest Score"
              value={formatPercentage(summary?.lowest_percentage)}
              sub="Lowest percentage"
              icon={ChartNoAxesColumn}
              iconClass="bg-orange-50 text-orange-600"
            />
          </div>

          {/* ─── Grade Distribution ──────────────────────── */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Grade Distribution
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Number of learners achieving each grade.
                </p>
              </div>

              <span className="self-start rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600">
                {totalStudents} learners
              </span>
            </div>

            <div className="space-y-4">
              {GRADES.map((grade) => {
                const count = getGradeCount(summary, grade);

                const widthPct = totalStudents
                  ? (count / totalStudents) * 100
                  : 0;

                return (
                  <div
                    key={grade}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={`badge ${gradeBadge(
                        grade
                      )} w-12 shrink-0 justify-center`}
                    >
                      {grade}
                    </span>

                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>

                    <div className="flex w-16 shrink-0 items-center justify-end gap-1.5 text-right">
                      <span className="text-sm font-semibold text-gray-800">
                        {count}
                      </span>

                      <span className="text-xs text-gray-400">
                        ({Math.round(widthPct)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Results Table ───────────────────────────── */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Learner Results
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Individual scores and grades for this examination.
                </p>
              </div>

              <span className="self-start rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </span>
            </div>

            <DataTable columns={columns} data={results} />
          </div>
        </>
      )}
    </div>
  );
};

export default ExamSummary;