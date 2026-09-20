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
import { useStudents } from "../../hooks/useStudents";
import { useStudentReportCard } from "../../hooks/useStudents";

import PageHeader from "../../components/ui/PageHeader";
import SelectField from "../../components/ui/SelectField";
import ReportCardDocument from "./ReportCardDocument";

import { downloadReportCard } from "../../utils/downloadReportCard";

import TableSkeleton from "../../components/ui/TableSkeleton";

const EXAM_TYPES = ["Mid-term", "End-term"];

const TERMS = [
  { value: 1, label: "Term 1" },
  { value: 2, label: "Term 2" },
  { value: 3, label: "Term 3" },
];

const getCurrentAcademicYear = () => {
  const year = new Date().getFullYear();
  return `${year}/${year + 1}`;
};

const getAcademicYears = () => {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: 5 }, (_, index) => {
    const year = currentYear - index;

    return `${year}/${year + 1}`;
  });
};

const ReportCard = () => {
  const { role, user } = useAuth();

  const isStudent = role === "student";

  const academicYears = useMemo(() => getAcademicYears(), []);

  const [selectedStudentId, setSelectedStudentId] = useState(
    isStudent && user?.student_id ? String(user.student_id) : "",
  );

  const [termNumber, setTermNumber] = useState(1);

  const [academicYear, setAcademicYear] = useState(
    getCurrentAcademicYear(),
  );

  const [examType, setExamType] = useState("End-term");

  const [downloading, setDownloading] = useState(false);

  const documentRef = useRef(null);

  /*
   * Load students only for admin/teacher users.
   * Students view their own report card.
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
   * Report-card request.
   *
   * This matches the backend contract:
   *
   * GET /students/:id/report-card
   * ?term_number=
   * &academic_year=
   * &exam_type=
   */
  const {
    data: reportData,
    isLoading: reportLoading,
    isFetching: reportFetching,
    isError,
    error,
  } = useStudentReportCard(selectedStudentId, {
    term_number: termNumber,
    academic_year: academicYear,
    exam_type: examType,
  });

  const report = reportData?.data;

  const errorStatus =
    error?.status ??
    error?.response?.status ??
    error?.response?.data?.status;

  const handleStudentChange = (event) => {
    setSelectedStudentId(event.target.value);
  };

  const handleTermChange = (event) => {
    setTermNumber(Number(event.target.value));
  };

  const handleAcademicYearChange = (event) => {
    setAcademicYear(event.target.value);
  };

  const handleExamTypeChange = (event) => {
    setExamType(event.target.value);
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
        academicYear.replace("/", "-"),
        `Term-${termNumber}`,
        examType.replace(/\s+/g, "-"),
        "Report",
      ]
        .filter(Boolean)
        .join("_");

      await downloadReportCard(documentRef, `${filename}.pdf`);

      toast.success("Report card downloaded successfully");
    } catch (err) {
      console.error("Report card download failed:", err);
      toast.error("PDF download failed — please try again");
    } finally {
      setDownloading(false);
    }
  };

  const hasSelection = Boolean(
    selectedStudentId && termNumber && academicYear,
  );

  const showLoading = reportLoading;

  const showFetching =
    reportFetching && !reportLoading && Boolean(report);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Card"
        description={
          isStudent
            ? "View your academic performance and download your report card."
            : "Select a learner and examination period to view their report card."
        }
        action={
          report ? (
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary w-full sm:w-auto justify-center"
            >
              {downloading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
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

      {/* Filters */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FileText size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Report card filters
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Choose the learner, academic year, term and examination type.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <option key={student.id} value={student.id}>
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
              <option key={term.value} value={term.value}>
                {term.label}
              </option>
            ))}
          </SelectField>

          {/* Exam type */}
          <SelectField
            label="Exam type"
            value={examType}
            onChange={handleExamTypeChange}
          >
            {EXAM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </SelectField>
        </div>

        {/* Current selection */}
        {hasSelection && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
            {!isStudent && selectedStudentId && (
              <span className="inline-flex items-center gap-1.5">
                <UserRound size={13} />
                Learner selected
              </span>
            )}

            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} />
              {academicYear}
            </span>

            <span>
              Term {termNumber}
            </span>

            <span>
              {examType}
            </span>

            {showFetching && (
              <span className="inline-flex items-center gap-1.5 text-blue-600">
                <Loader2 size={12} className="animate-spin" />
                Updating...
              </span>
            )}
          </div>
        )}
      </section>

      {/* No student selected */}
      {!selectedStudentId ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <UserRound size={22} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            Select a student
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
            Choose a learner above to view their {examType.toLowerCase()}{" "}
            report card.
          </p>
        </div>
      ) : showLoading ? (
        /* Loading */
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
            <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-72 animate-pulse rounded bg-gray-100" />
          </div>

          <div className="p-4 sm:p-6">
            <TableSkeleton rows={8} cols={4} />
          </div>
        </section>
      ) : isError ? (
        /* Error */
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <FileText size={22} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            No report card available
          </h3>

          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            {errorStatus === 404
              ? `No "${examType}" results were found for this student for Term ${termNumber} (${academicYear}).`
              : error?.message ||
                "Something went wrong while loading the report card."}
          </p>

          <p className="mt-3 text-xs text-gray-400">
            Try another term, academic year or examination type.
          </p>
        </div>
      ) : report ? (
        /* Report card */
        <>
          {/* Mobile notice */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 sm:hidden">
            <FileText
              size={16}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <p className="text-xs leading-5 text-amber-800">
              The report card is designed for an A4-style layout. You can
              scroll horizontally to preview it or download the PDF for
              printing and sharing.
            </p>
          </div>

          {/* Report preview */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Report card preview
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  {academicYear} · Term {termNumber} · {examType}
                </p>
              </div>

              {showFetching && (
                <div className="hidden items-center gap-2 text-xs text-gray-500 sm:flex">
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                  Updating
                </div>
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
                  examType={examType}
                />
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Fallback */
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
          <FileText
            size={22}
            className="mx-auto text-gray-400"
          />

          <p className="mt-3 text-sm text-gray-500">
            No report card data is available.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportCard;