import { useMemo, useRef, useState } from "react";
import {
  CalendarDays, Download, FileText, Loader2,
  UserRound, Building2, Award, BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useStudents, useStudentTermReportCard } from "../../hooks/useStudents";
import { useClasses } from "../../hooks/useClasses";
import PageHeader from "../../components/ui/PageHeader";
import SelectField from "../../components/ui/SelectField";
import ReportCardDocument from "./ReportCardDocument";
import { downloadReportCard } from "../../utils/downloadReportCard";
import Spinner from "../../components/ui/spinner";

// ── CBC grade config — matches grading.js ────────────────────────────────────
const GRADE_COLORS = {
  EE1: "#16a34a", EE2: "#22c55e",
  ME1: "#0369a1", ME2: "#0ea5e9",
  AE1: "#d97706", AE2: "#f59e0b",
  BE1: "#ea580c", BE2: "#dc2626",
};
const GRADE_BG = {
  EE1: "#dcfce7", EE2: "#f0fdf4",
  ME1: "#dbeafe", ME2: "#e0f2fe",
  AE1: "#fef3c7", AE2: "#fefce8",
  BE1: "#ffedd5", BE2: "#fee2e2",
};

const TERMS = [
  { value: "1", label: "Term 1" },
  { value: "2", label: "Term 2" },
  { value: "3", label: "Term 3" },
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

// Small grade badge
const GradeBadge = ({ grade }) => {
  const color = GRADE_COLORS[grade] || "#64748b";
  const bg    = GRADE_BG[grade]    || "#f1f5f9";
  if (!grade) return <span className="text-xs text-gray-400">—</span>;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold"
      style={{ background: bg, color }}>
      {grade}
    </span>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const TermReportCard = () => {
  const { role, user } = useAuth();
  const isStudent       = role === "student";
  const academicYears   = useMemo(() => getAcademicYears(), []);

  // ── Filter state ───────────────────────────────────────────────────────
  const [selectedClassId,   setSelectedClassId]   = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(
    isStudent ? String(user?.student_id ?? "") : ""
  );
  const [termNumber,    setTermNumber]    = useState("1");
  const [academicYear,  setAcademicYear]  = useState(getCurrentAcademicYear);
  const [downloading,   setDownloading]   = useState(false);

  // ── Dates printed on the report (not from API) ─────────────────────────
  const [closingDate, setClosingDate] = useState("");
  const [openingDate, setOpeningDate] = useState("");

  const documentRef = useRef(null);

  // ── Data ──────────────────────────────────────────────────────────────
  const { data: classesData } = useClasses({ limit: 100 }, { enabled: !isStudent });

  const { data: studentsData, isLoading: studentsLoading } = useStudents(
    { limit: 200, class_id: selectedClassId || undefined },
    { enabled: !isStudent }
  );

  // Fix 1: correct hook signature — pass params as an object
  const {
    data:       reportData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useStudentTermReportCard(selectedStudentId, {
    term_number:   termNumber,
    academic_year: academicYear,
  });

  const report = reportData?.data;

  const errorStatus  = error?.response?.status ?? error?.status;
  const errorMessage = error?.response?.data?.error || error?.message || "Failed to load the report card.";

  // ── Class change clears student ────────────────────────────────────────
  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
    setSelectedStudentId("");
  };

  // ── Download ───────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!report || downloading) return;
    setDownloading(true);
    try {
      const firstName = report.student?.first_name ?? "Student";
      const lastName  = report.student?.last_name  ?? "";
      const filename  = [
        lastName,
        firstName,
        `Term-${report.term?.term_number ?? termNumber}`,
        (report.term?.academic_year ?? academicYear).replace("/", "-"),
        "Full-Term-Report.pdf",
      ].filter(Boolean).join("_");

      await downloadReportCard(documentRef, filename);
      toast.success("Term report card downloaded");
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("PDF generation failed — please try again");
    } finally {
      setDownloading(false);
    }
  };

  const hasSelection = Boolean(selectedStudentId);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        title="Term Report Card"
        description={
          isStudent
            ? "View your complete academic performance for the selected term."
            : "Generate a learner's full-term report showing all exam types."
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
                <><Loader2 size={15} className="animate-spin" /> Generating PDF...</>
              ) : (
                <><Download size={15} /> Download PDF</>
              )}
            </button>
          ) : null
        }
      />

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <CalendarDays size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Report period</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Select the learner and academic period. All exam types for the term are included automatically.
            </p>
          </div>
        </div>

        {/* Fix 5: class filter before student picker */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {!isStudent && (
            <>
              <SelectField
                label="Class"
                value={selectedClassId}
                onChange={handleClassChange}
              >
                <option value="">All classes</option>
                {classesData?.data?.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
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
                    ? "Loading..."
                    : selectedClassId
                    ? "Select student..."
                    : "Select a class first"}
                </option>
                {studentsData?.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                    {s.student_number ? ` (${s.student_number})` : ""}
                  </option>
                ))}
              </SelectField>
            </>
          )}

          <SelectField
            label="Academic year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            {academicYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </SelectField>

          <SelectField
            label="Term"
            value={termNumber}
            onChange={(e) => setTermNumber(e.target.value)}
          >
            {TERMS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </SelectField>
        </div>

        {/* Fix 7: closing/opening date inputs */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-gray-100 pt-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              School closing date
              <span className="ml-1 text-gray-400 font-normal">(printed on report)</span>
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
              <span className="ml-1 text-gray-400 font-normal">(printed on report)</span>
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

        {/* Selection summary strip */}
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
                {classesData?.data?.find((c) => String(c.id) === selectedClassId)?.name}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} /> {academicYear}
            </span>
            <span>Term {termNumber}</span>
            <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 font-semibold text-xs">
              All exam types
            </span>
            {isFetching && (
              <span className="inline-flex items-center gap-1.5 text-blue-600">
                <Loader2 size={12} className="animate-spin" /> Updating...
              </span>
            )}
          </div>
        )}
      </section>

      {/* ── States ──────────────────────────────────────────────────── */}
      {!hasSelection ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <FileText size={22} />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            {isStudent ? "Student profile not linked" : !selectedClassId ? "Select a class first" : "Select a student"}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            {isStudent
              ? "Your account is not linked to a student profile. Contact the administrator."
              : !selectedClassId
              ? "Choose a class then select a learner to generate their term report."
              : "Choose a learner to generate their full-term report card."}
          </p>
        </div>
      ) : isLoading ? (
        <section className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500">Loading term results...</p>
          </div>
        </section>
      ) : isError ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <FileText size={28} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            No term report card available
          </h3>
          <p className="mx-auto max-w-md text-sm text-gray-500">
            {errorStatus === 404
              ? `No results were found for Term ${termNumber} (${academicYear}).`
              : errorMessage}
          </p>
          <p className="mt-2 text-xs text-gray-400">Try a different term or academic year.</p>
        </div>
      ) : report ? (
        <>
          {/* ── Mobile notice ──────────────────────────────────────── */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 sm:hidden">
            <FileText size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-xs leading-5 text-amber-800">
              The report card uses an A4 layout. Scroll horizontally to preview, or download the PDF.
            </p>
          </div>

          {/* ── Fix 4: Exam type summary cards ────────────────────── */}
          {/* Shows grouped breakdown by exam type before the document */}
          {(report.exam_type_summaries?.length ?? 0) > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.exam_type_summaries.map((group) => (
                <div key={group.exam_type}
                  className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={15} className="text-gray-400" />
                      <p className="text-sm font-bold text-gray-900">{group.exam_type}</p>
                    </div>
                    <GradeBadge grade={group.mean_grade} />
                  </div>

                  <div className="space-y-2">
                    {/* Average percentage */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Average</span>
                      <span className="font-bold text-gray-900">
                        {group.total_percentage != null ? `${group.total_percentage}%` : "—"}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(group.total_percentage ?? 0, 100)}%`,
                          background: GRADE_COLORS[group.mean_grade] || "#94a3b8",
                        }}
                      />
                    </div>

                    {/* Exams count */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Exams sat</span>
                      <span className="font-semibold text-gray-700">{group.exam_count}</span>
                    </div>

                    {/* Points — junior only */}
                    {group.total_points != null && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Points</span>
                        <span className="font-semibold text-gray-700">
                          {group.total_points} / {group.max_points}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Overall term card */}
              <div
                className="rounded-xl border-2 p-4 shadow-sm"
                style={{
                  borderColor: GRADE_COLORS[report.summary?.mean_grade] || "#e2e8f0",
                  background:  GRADE_BG[report.summary?.mean_grade]    || "#f8fafc",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award size={15} style={{ color: GRADE_COLORS[report.summary?.mean_grade] || "#64748b" }} />
                    <p className="text-sm font-black" style={{ color: GRADE_COLORS[report.summary?.mean_grade] || "#1a2744" }}>
                      Term Average
                    </p>
                  </div>
                  <GradeBadge grade={report.summary?.mean_grade} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Overall %</span>
                    <span className="text-lg font-black" style={{ color: GRADE_COLORS[report.summary?.mean_grade] || "#1a2744" }}>
                      {report.summary?.average_percentage != null
                        ? `${report.summary.average_percentage}%`
                        : "—"}
                    </span>
                  </div>

                  <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width:      `${Math.min(report.summary?.average_percentage ?? 0, 100)}%`,
                        background: GRADE_COLORS[report.summary?.mean_grade] || "#94a3b8",
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Class position</span>
                    <span className="font-bold" style={{ color: GRADE_COLORS[report.summary?.mean_grade] || "#1a2744" }}>
                      {report.summary?.position
                        ? `${report.summary.position} of ${report.summary.class_size}`
                        : "—"}
                    </span>
                  </div>

                  {report.summary?.total_points != null && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Total points</span>
                      <span className="font-bold" style={{ color: GRADE_COLORS[report.summary?.mean_grade] || "#1a2744" }}>
                        {report.summary.total_points} / {report.summary.max_points}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Report preview header ──────────────────────────────── */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  {report.student?.first_name} {report.student?.last_name} — Full Term Report
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  {report.class?.name && `${report.class.name} · `}
                  Term {report.term?.term_number} · {report.term?.academic_year}
                  {" · "}All exam types
                </p>
              </div>
              {isFetching && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <Loader2 size={13} className="animate-spin" /> Updating
                </span>
              )}
            </div>

            <div className="overflow-x-auto p-3 sm:p-5">
              {/* Fix 3: correct isolation wrapper — no all:"initial" */}
              <div
                ref={documentRef}
                style={{
                  isolation:   "isolate",
                  colorScheme: "light",
                  display:     "block",
                  width:       "794px",
                  background:  "#ffffff",
                }}
              >
                {/* Fix 7: pass closing/opening dates to document */}
                <ReportCardDocument
                  report={report}
                  examType={`Term ${report.term?.term_number ?? termNumber} — Full Term`}
                  closingDate={closingDate || null}
                  openingDate={openingDate || null}
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