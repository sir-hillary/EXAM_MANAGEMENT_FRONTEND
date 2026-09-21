import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Loader2,
  Users,
  Award,
  TrendingUp,
  UserRound,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import { useClassPerformance } from "../../hooks/useClasses";
import SelectField from "../../components/ui/SelectField";
import { gradeBadge } from "../../utils/gradeColors";
import { getDivision } from "../../utils/schoolDivisions";
import { downloadReportCard } from "../../utils/downloadReportCard";
import PageHeader from "../../components/ui/PageHeader";
import ClassPerformancePDF from "./ClassPerformancePDF";
import Spinner from "../../components/ui/spinner";

const EXAM_TYPES = ["Mid-term", "End-term", "Prediction"];

const TERMS = [
  { value: "1", label: "Term 1" },
  { value: "2", label: "Term 2" },
  { value: "3", label: "Term 3" },
];

const positionSuffix = (position) => {
  if (!Number.isFinite(Number(position)) || Number(position) < 1) {
    return "—";
  }

  const n = Number(position);
  const remainder100 = n % 100;

  if (remainder100 >= 11 && remainder100 <= 13) return `${n}th`;

  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
};

const formatPercentage = (value) => {
  if (value === null || value === undefined || value === "") return "—";

  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(1)}%` : "—";
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "—";

  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString() : "—";
};

const getStudentName = (student) =>
  [student?.first_name, student?.last_name].filter(Boolean).join(" ") ||
  "Unnamed student";

const getPositionStyle = (position) => {
  switch (Number(position)) {
    case 1:
      return "bg-amber-100 text-amber-700 ring-amber-200";
    case 2:
      return "bg-slate-100 text-slate-600 ring-slate-200";
    case 3:
      return "bg-orange-100 text-orange-700 ring-orange-200";
    default:
      return "bg-gray-100 text-gray-600 ring-gray-200";
  }
};

const StatCard = ({ icon: Icon, label, value, description, iconClass }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="mt-2 truncate text-xl font-bold text-gray-900">
          {value ?? "—"}
        </p>
        {description && (
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        )}
      </div>

      <div className={`rounded-lg p-2.5 ${iconClass}`}>
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const ClassPerformance = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const pdfRef = useRef(null);

  const [termNumber, setTermNumber] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [examType, setExamType] = useState("End-term");
  const [downloading, setDownloading] = useState(false);

  const filtersReady = Boolean(termNumber && academicYear.trim());

  const { data, isLoading, isError, error, refetch, isFetching } =
    useClassPerformance(
      classId,
      filtersReady
        ? {
            term_number: termNumber,
            academic_year: academicYear.trim(),
            exam_type: examType,
          }
        : null,
    );

  const report = data?.data;
  const students = report?.students ?? [];
  const division = report?.class ? getDivision(report.class.grade) : null;

  const isPrimary = report?.division === "primary";

  const meta = report?.meta ?? {};
  const classAverage = meta.class_avg_percentage ?? meta.class_average ?? null;

  const handleDownload = async () => {
    if (!report || !students.length) {
      toast.error("There is no performance data to download");
      return;
    }

    setDownloading(true);

    try {
      const className = report.class?.name || "Class";
      const safeClassName = className.replace(/[^\w-]+/g, "_");

      const filename = `${safeClassName}_Term-${termNumber}_${academicYear}_${examType.replace(/\s+/g, "-")}_Performance.pdf`;

      await downloadReportCard(pdfRef, filename, "landscape");
      toast.success("Performance report downloaded");
    } catch (err) {
      console.error("Class performance PDF error:", err);
      toast.error("PDF generation failed — try again");
    } finally {
      setDownloading(false);
    }
  };

  const handleRetry = () => {
    if (filtersReady) refetch();
  };

  return (
    <div className="space-y-5 pb-8">
      <button
        type="button"
        onClick={() => navigate("/classes")}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to classes
      </button>

      <PageHeader
        title={
          report?.class?.name
            ? `${report.class.name} Performance`
            : "Class Performance"
        }
        description={
          report?.class
            ? `${division?.label ?? report.division ?? "School"} · Grade ${report.class.grade}`
            : "Review class results, learner rankings, and performance"
        }
        action={
          report && students.length > 0 ? (
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              {downloading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download PDF
                </>
              )}
            </button>
          ) : null
        }
      />

      {/* Report filters */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={18} className="text-brand-600" />
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Report filters
            </h2>
            <p className="text-xs text-gray-500">
              Select the academic period and exam to review.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField
            label="Academic term"
            value={termNumber}
            onChange={(e) => setTermNumber(e.target.value)}
          >
            <option value="">Select term</option>
            {TERMS.map((term) => (
              <option key={term.value} value={term.value}>
                {term.label}
              </option>
            ))}
          </SelectField>

          <div>
            <label
              htmlFor="academic-year"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Academic year
            </label>
            <input
              id="academic-year"
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g. 2025/2026"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <SelectField
            label="Exam type"
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
          >
            {EXAM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </SelectField>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleRetry}
              disabled={!filtersReady || isFetching}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={isFetching ? "animate-spin" : ""}
              />
              {isFetching ? "Refreshing..." : "Refresh report"}
            </button>
          </div>
        </div>

        {academicYear && !/^\d{4}\/\d{4}$/.test(academicYear.trim()) && (
          <p className="mt-2 text-xs text-amber-600">
            Enter the academic year in YYYY/YYYY format.
          </p>
        )}
      </section>

      {!filtersReady ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-12 text-center">
          <CalendarDays className="mx-auto mb-3 text-gray-400" size={28} />
          <h3 className="text-sm font-semibold text-gray-800">
            Select a term and academic year
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose the academic period to load the class performance report.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center rounded-xl border border-gray-200 bg-white py-16">
          <Spinner size="sm" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
          <p className="text-sm font-medium text-red-700">
            {error?.message || "Unable to load class performance."}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      ) : !report || students.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center">
          <Users className="mx-auto mb-3 text-gray-300" size={30} />
          <h3 className="text-sm font-semibold text-gray-800">
            No performance records found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No results were found for {examType}, Term {termNumber},{" "}
            {academicYear}. Try another filter or confirm that results have been
            recorded.
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Users}
              label="Learners assessed"
              value={formatNumber(meta.total_students ?? students.length)}
              description="Learners with recorded results"
              iconClass="bg-blue-50 text-blue-600"
            />

            <StatCard
              icon={TrendingUp}
              label="Class average"
              value={formatPercentage(classAverage)}
              description="Average performance"
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              icon={Award}
              label="Top learner"
              value={meta.top_student ? getStudentName(meta.top_student) : "—"}
              description={
                meta.top_student
                  ? formatPercentage(meta.top_student.avg_percentage)
                  : "No top learner available"
              }
              iconClass="bg-amber-50 text-amber-600"
            />

            <StatCard
              icon={UserRound}
              label="Learner distribution"
              value={`${formatNumber(meta.boys ?? 0)} boys · ${formatNumber(meta.girls ?? 0)} girls`}
              description="Class enrolment represented in report"
              iconClass="bg-violet-50 text-violet-600"
            />
          </section>

          {/* Report context */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-900">
            <span className="font-medium">
              {report.class?.name} · Term {termNumber} · {academicYear}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700">
              {examType}
            </span>
          </div>

          {/* Desktop table */}
          <section className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Learner performance
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Ranked by average percentage performance
                </p>
              </div>
              <span className="text-xs text-gray-500">
                {students.length} learner{students.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Learner</th>
                    <th className="px-4 py-3">Adm. No.</th>
                    <th className="px-4 py-3 text-right">Avg. %</th>
                    <th className="px-4 py-3 text-right">Correct</th>
                    <th className="px-4 py-3 text-right">Exams</th>
                    {!isPrimary && (
                      <>
                        <th className="px-4 py-3 text-right">Points</th>
                        <th className="px-4 py-3">Mean grade</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => (
                    <tr
                      key={student.student_id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex min-w-12 items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${getPositionStyle(student.position)}`}
                        >
                          {positionSuffix(student.position)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="font-medium text-gray-900">
                          {getStudentName(student)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                        {student.student_number || "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span className="font-semibold text-gray-900">
                          {formatPercentage(student.avg_percentage)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                        {formatNumber(student.total_correct)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                        {formatNumber(student.exams_count)}
                      </td>

                      {!isPrimary && (
                        <>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                            {formatNumber(student.total_points)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {student.mean_grade ? (
                              <span
                                className={`badge ${gradeBadge(student.mean_grade)}`}
                              >
                                {student.mean_grade}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mobile cards */}
          <section className="space-y-3 md:hidden">
            <div>
              <h2 className="font-semibold text-gray-900">
                Learner performance
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Ranked by average percentage
              </p>
            </div>

            {students.map((student) => (
              <article
                key={student.student_id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${getPositionStyle(student.position)}`}
                    >
                      {positionSuffix(student.position)}
                    </span>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-gray-900">
                        {getStudentName(student)}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Adm. No. {student.student_number || "—"}
                      </p>
                    </div>
                  </div>

                  {!isPrimary && student.mean_grade && (
                    <span
                      className={`badge shrink-0 ${gradeBadge(student.mean_grade)}`}
                    >
                      {student.mean_grade}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
                  <div>
                    <p className="text-xs text-gray-500">Average</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {formatPercentage(student.avg_percentage)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Correct answers</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {formatNumber(student.total_correct)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Exams taken</p>
                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {formatNumber(student.exams_count)}
                    </p>
                  </div>

                  {!isPrimary && (
                    <div>
                      <p className="text-xs text-gray-500">Total points</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {formatNumber(student.total_points)}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>

          {/* Hidden PDF render target */}
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              left: "-10000px",
              top: 0,
              width: "1100px",
              pointerEvents: "none",
            }}
          >
            <div ref={pdfRef}>
              <ClassPerformancePDF data={report} examType={examType} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClassPerformance;
