import { useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Download,
  FileText,
  Loader2,
  UserRound,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useStudents } from "../../hooks/useStudents";
import { useStudentReportCard } from "../../hooks/useStudents";
import { useClasses } from "../../hooks/useClasses";
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
  const y = new Date().getFullYear();
  return `${y}/${y + 1}`;
};

const getAcademicYears = () => {
  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => {
    const y = current - i;
    return `${y}/${y + 1}`;
  });
};

const ReportCard = () => {
  const { role, user } = useAuth();
  const isStudent = role === "student";
  const academicYears = useMemo(() => getAcademicYears(), []);

  // ── Filters ──────────────────────────────────────────────────────
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(
    isStudent && user?.student_id ? String(user.student_id) : "",
  );
  const [termNumber, setTermNumber] = useState(1);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear);
  const [examType, setExamType] = useState("End-term");
  const [downloading, setDownloading] = useState(false);

  // ── New: closing/opening dates for the printed report card ───────
  const [closingDate, setClosingDate] = useState("");
  const [openingDate, setOpeningDate] = useState("");

  const documentRef = useRef(null);

  // ── Data ─────────────────────────────────────────────────────────
  // Classes for the class filter dropdown
  const { data: classesData } = useClasses(
    { limit: 100 },
    { enabled: !isStudent },
  );

  // Students filtered by selected class
  const { data: studentsData, isLoading: studentsLoading } = useStudents(
    {
      limit: 200,
      class_id: selectedClassId || undefined,
    },
    { enabled: !isStudent },
  );

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
    error?.status ?? error?.response?.status ?? error?.response?.data?.status;

  // When class changes, clear student selection
  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
    setSelectedStudentId("");
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

  const hasSelection = Boolean(selectedStudentId && termNumber && academicYear);
  const showLoading = reportLoading;
  const showFetching = reportFetching && !reportLoading && Boolean(report);

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
                  <Loader2 size={15} className="animate-spin" /> Generating
                  PDF...
                </>
              ) : (
                <>
                  <Download size={15} /> Download PDF
                </>
              )}
            </button>
          ) : null
        }
      />

      {/* ── Filters ────────────────────────────────────────────────── */}
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
              Choose the class, learner, academic year, term and examination
              type.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* ── FIX 4: Class filter first, then student within that class ── */}
          {!isStudent && (
            <>
              <SelectField
                label="Class"
                value={selectedClassId}
                onChange={handleClassChange}
              >
                <option value="">All classes</option>
                {classesData?.data?.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Student"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                disabled={studentsLoading}
              >
                <option value="">
                  {studentsLoading
                    ? "Loading students..."
                    : selectedClassId
                      ? "Select student..."
                      : "Select a class first"}
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
            </>
          )}

          {/* Academic year */}
          <SelectField
            label="Academic year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
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
            onChange={(e) => setTermNumber(Number(e.target.value))}
          >
            {TERMS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </SelectField>

          {/* Exam type */}
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
        </div>

        {/* ── FIX 3: Closing / opening dates ─────────────────────── */}
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              School closing date
              <span className="ml-1 text-gray-400 font-normal">
                (printed on report)
              </span>
            </label>
            <input
              type="text"
              value={closingDate}
              onChange={(e) => setClosingDate(e.target.value)}
              placeholder="e.g. 14th November 2025"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              School re-opening date
              <span className="ml-1 text-gray-400 font-normal">
                (printed on report)
              </span>
            </label>
            <input
              type="text"
              value={openingDate}
              onChange={(e) => setOpeningDate(e.target.value)}
              placeholder="e.g. 6th January 2026"
              className="input-field"
            />
          </div>
        </div>

        {/* Current selection summary */}
        {hasSelection && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
            {!isStudent && selectedStudentId && (
              <span className="inline-flex items-center gap-1.5">
                <UserRound size={13} /> Learner selected
              </span>
            )}
            {selectedClassId && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 size={13} />
                {
                  classesData?.data?.find(
                    (c) => String(c.id) === selectedClassId,
                  )?.name
                }
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} /> {academicYear}
            </span>
            <span>Term {termNumber}</span>
            <span>{examType}</span>
            {showFetching && (
              <span className="inline-flex items-center gap-1.5 text-blue-600">
                <Loader2 size={12} className="animate-spin" /> Updating...
              </span>
            )}
          </div>
        )}
      </section>

      {/* ── States ─────────────────────────────────────────────────── */}
      {!selectedStudentId ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <UserRound size={22} />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            {!isStudent && !selectedClassId
              ? "Select a class first"
              : "Select a student"}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
            {!isStudent && !selectedClassId
              ? "Choose a class from the filter above, then select a learner to view their report card."
              : `Choose a learner above to view their ${examType.toLowerCase()} report card.`}
          </p>
        </div>
      ) : showLoading ? (
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
        <>
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 sm:hidden">
            <FileText size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-xs leading-5 text-amber-800">
              The report card is designed for an A4-style layout. Scroll
              horizontally to preview or download the PDF.
            </p>
          </div>

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
                  <Loader2 size={13} className="animate-spin" /> Updating
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
                {/* Pass closing/opening dates to the document */}
                <ReportCardDocument
                  report={report}
                  examType={examType}
                  closingDate={closingDate || null}
                  openingDate={openingDate || null}
                />
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
          <FileText size={22} className="mx-auto text-gray-400" />
          <p className="mt-3 text-sm text-gray-500">
            No report card data is available.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportCard;
