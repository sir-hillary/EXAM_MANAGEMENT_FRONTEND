import { useMemo, useRef, useState } from "react";

import {
  CalendarDays,
  Download,
  FileText,
  Loader2,
  UserRound,
} from "lucide-react";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { useStudents, useStudentReportCard } from "../../hooks/useStudents";

import PageHeader from "../../components/ui/PageHeader";
import SelectField from "../../components/ui/SelectField";
import Spinner from "../../components/ui/spinner";

import ReportCardDocument from "./ReportCardDocument";

import { downloadReportCard } from "../../utils/downloadReportCard";

const EXAM_TYPES = [
  { value: "", label: "All exam types" },
  { value: "Mid-term", label: "Mid-term only" },
  { value: "End-term", label: "End-term only" },
];

const TERMS = [
  { value: "1", label: "Term 1" },
  { value: "2", label: "Term 2" },
  { value: "3", label: "Term 3" },
];

const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();

  // School academic year assumed to begin in January.
  return `${year}/${year + 1}`;
};

const getAcademicYears = () => {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: 5 }, (_, index) => {
    const year = currentYear - index;

    return `${year}/${year + 1}`;
  });
};

const TermReportCard = () => {
  const { role, user } = useAuth();

  const isStudent = role === "student";

  const [selectedStudentId, setSelectedStudentId] = useState(
    isStudent ? String(user?.student_id ?? "") : "",
  );

  const [termNumber, setTermNumber] = useState("1");

  const [academicYear, setAcademicYear] = useState(
    getCurrentAcademicYear(),
  );

  const [examTypeFilter, setExamTypeFilter] = useState("");

  const [downloading, setDownloading] = useState(false);

  const documentRef = useRef(null);

  const academicYears = useMemo(
    () => getAcademicYears(),
    [],
  );

  /*
   * Students are only needed by admin/teacher accounts.
   * Student accounts use the student_id attached to their auth profile.
   */
  const {
    data: studentsData,
    isLoading: studentsLoading,
  } = useStudents(
    { limit: 200 },
    {
      enabled: !isStudent,
    },
  );

  /*
   * Report-card request uses the existing report-card API contract:
   *
   * GET /students/:id/report-card
   *
   * Query parameters:
   * - term_number
   * - academic_year
   * - exam_type (optional)
   */
  const {
    data: reportData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useStudentReportCard(selectedStudentId, {
    termNumber,
    academicYear,
    examType: examTypeFilter,
  });

  const report = reportData?.data;

  const errorStatus =
    error?.response?.status ??
    error?.status ??
    error?.response?.data?.status;

  const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load the term report card. Please try again.";

  const selectedExamLabel =
    EXAM_TYPES.find((type) => type.value === examTypeFilter)?.label ??
    "All exam types";

  const handleStudentChange = (event) => {
    setSelectedStudentId(event.target.value);
  };

  const handleTermChange = (event) => {
    setTermNumber(event.target.value);
  };

  const handleAcademicYearChange = (event) => {
    setAcademicYear(event.target.value);
  };

  const handleExamTypeChange = (event) => {
    setExamTypeFilter(event.target.value);
  };

  const handleDownload = async () => {
    if (!report || downloading) return;

    setDownloading(true);

    try {
      const firstName = report.student?.first_name ?? "Student";
      const lastName = report.student?.last_name ?? "";

      const filename = [
        lastName,
        firstName,
        `Term-${report.term?.term_number ?? termNumber}`,
        (report.term?.academic_year ?? academicYear).replace(
          "/",
          "-",
        ),
        examTypeFilter || "All-Exams",
        "Report.pdf",
      ]
        .filter(Boolean)
        .join("_");

      await downloadReportCard(documentRef, filename);

      toast.success("Term report card downloaded");
    } catch (downloadError) {
      console.error(
        "Term report card download failed:",
        downloadError,
      );

      toast.error("PDF generation failed — please try again");
    } finally {
      setDownloading(false);
    }
  };

  const hasStudentSelection = Boolean(selectedStudentId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Term Report Card"
        description={
          isStudent
            ? "View your academic performance for the selected term."
            : "Generate and download a learner's complete term report card."
        }
        action={
          report ? (
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary w-full justify-center sm:w-auto"
            >
              {downloading ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={15} />
                  Download PDF
                </>
              )}
            </button>
          ) : null
        }
      />

      {/* ─────────────────────────────────────────────
          FILTERS
      ───────────────────────────────────────────── */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <CalendarDays size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Report period
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Select the learner and academic period you want to
              view.
            </p>
          </div>
        </div>

        <div
          className={`grid grid-cols-1 gap-4 ${
            isStudent
              ? "sm:grid-cols-3"
              : "sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {/* Student */}
          {!isStudent && (
            <SelectField
              label="Student"
              value={selectedStudentId}
              onChange={handleStudentChange}
              disabled={studentsLoading}
            >
              <option value="">
                {studentsLoading
                  ? "Loading students..."
                  : "Select student..."}
              </option>

              {studentsData?.data?.map((student) => (
                <option
                  key={student.id}
                  value={student.id}
                >
                  {student.first_name} {student.last_name}
                  {student.student_number
                    ? ` (${student.student_number})`
                    : ""}
                </option>
              ))}
            </SelectField>
          )}

          {/* Academic year */}
          <SelectField
            label="Academic year"
            value={academicYear}
            onChange={handleAcademicYearChange}
          >
            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </SelectField>

          {/* Term */}
          <SelectField
            label="Term"
            value={termNumber}
            onChange={handleTermChange}
          >
            {TERMS.map((term) => (
              <option
                key={term.value}
                value={term.value}
              >
                {term.label}
              </option>
            ))}
          </SelectField>

          {/* Exam type */}
          <SelectField
            label="Exam scope"
            value={examTypeFilter}
            onChange={handleExamTypeChange}
          >
            {EXAM_TYPES.map((examType) => (
              <option
                key={examType.value || "all"}
                value={examType.value}
              >
                {examType.label}
              </option>
            ))}
          </SelectField>
        </div>

        {/* Current selection */}
        {hasStudentSelection && (
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-4">
            {!isStudent && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                <UserRound size={13} />
                Learner selected
              </span>
            )}

            <span className="text-xs font-medium text-gray-700">
              {academicYear}
            </span>

            <span className="text-xs text-gray-500">
              Term {termNumber}
            </span>

            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
              {selectedExamLabel}
            </span>

            {isFetching && (
              <span className="inline-flex items-center gap-1.5 text-xs text-brand-600">
                <Loader2
                  size={12}
                  className="animate-spin"
                />
                Updating report...
              </span>
            )}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────
          EMPTY STATE
      ───────────────────────────────────────────── */}
      {!hasStudentSelection ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <FileText size={22} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            {isStudent
              ? "Student profile not linked"
              : "Select a student"}
          </h3>

          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
            {isStudent
              ? "Your account is not currently linked to a student profile. Please contact the school administrator."
              : "Select a learner above to generate their term report card."}
          </p>
        </div>
      ) : isLoading ? (
        /* ─────────────────────────────────────────────
           LOADING STATE
        ───────────────────────────────────────────── */
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="h-4 w-44 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-64 animate-pulse rounded bg-gray-100" />
          </div>

          <div className="p-5">
            <div className="flex justify-center py-10">
              <Spinner size="lg" />
            </div>
          </div>
        </section>
      ) : isError ? (
        /* ─────────────────────────────────────────────
           ERROR STATE
        ───────────────────────────────────────────── */
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <FileText size={22} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            No report card available
          </h3>

          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
            {errorStatus === 404
              ? `No results were found for Term ${termNumber} (${academicYear})${
                  examTypeFilter
                    ? ` — ${examTypeFilter}`
                    : ""
                }.`
              : errorMessage}
          </p>

          <p className="mt-3 text-xs text-gray-400">
            Try another academic year, term or exam scope.
          </p>
        </div>
      ) : report ? (
        <>
          {/* ─────────────────────────────────────────
              MOBILE NOTICE
          ───────────────────────────────────────── */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 sm:hidden">
            <FileText
              size={16}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <p className="text-xs leading-5 text-amber-800">
              The report card uses an A4-style layout. Scroll
              horizontally to preview it or download the PDF for
              printing and sharing.
            </p>
          </div>

          {/* ─────────────────────────────────────────
              REPORT META
          ───────────────────────────────────────── */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <FileText size={19} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {report.student?.first_name}{" "}
                    {report.student?.last_name}
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {report.class?.name
                      ? `${report.class.name} · `
                      : ""}
                    {report.term?.academic_year ??
                      academicYear}
                    {" · "}
                    Term{" "}
                    {report.term?.term_number ??
                      termNumber}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700">
                  Term{" "}
                  {report.term?.term_number ??
                    termNumber}
                </span>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
                  {selectedExamLabel}
                </span>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────
              REPORT DOCUMENT
          ───────────────────────────────────────── */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Report card preview
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Official term performance report
                </p>
              </div>

              {isFetching && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                  Updating
                </span>
              )}
            </div>

            <div className="overflow-x-auto p-3 sm:p-5">
              <div
                ref={documentRef}
                style={{
                  isolation: "isolate",
                  all: "initial",
                  display: "block",
                  colorScheme: "light",
                }}
              >
                <ReportCardDocument
                  report={report}
                  examType={
                    examTypeFilter ||
                    `Term ${report.term?.term_number ?? termNumber} — ${
                      report.term?.academic_year ??
                      academicYear
                    }`
                  }
                />
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
};

export default TermReportCard;