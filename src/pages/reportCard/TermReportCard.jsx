import { useState, useRef } from "react";
import { Download, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useStudents } from "../../hooks/useStudents";
import { studentsApi } from "../../api";
import { useAuth } from "../../context/AuthContext";

import PageHeader from "../../components/ui/PageHeader";
import SelectField from "../../components/ui/SelectField";
import Spinner from "../../components/ui/spinner";
import ReportCardDocument from "./ReportCardDocument";

import { downloadReportCard } from "../../utils/downloadReportCard";

const currentAcademicYear = () => {
const year = new Date().getFullYear();

return new Date().getMonth() >= 8
? `${year}/${year + 1}`
: `${year - 1}/${year}`;
};

export default function TermReportCard() {
const { role, user } = useAuth();

const isStudent = role === "student";

const [selectedStudentId, setSelectedStudentId] = useState(
isStudent ? String(user?.student_id ?? "") : ""
);

const [termNumber, setTermNumber] = useState("1");
const [academicYear, setAcademicYear] = useState(currentAcademicYear());
const [examTypeFilter, setExamTypeFilter] = useState("");

const [classTeacherName, setClassTeacherName] = useState("");
const [closingDate, setClosingDate] = useState("");
const [openingDate, setOpeningDate] = useState("");

const [downloading, setDownloading] = useState(false);

const documentRef = useRef(null);

// Fetch students for the student selector
const { data: studentsData } = useStudents();

// Fetch the report card using the selected filters
const {
data: reportData,
isLoading,
isError,
error,
} = useQuery({
queryKey: [
"report-card",
selectedStudentId,
termNumber,
academicYear,
examTypeFilter,
],


queryFn: () =>
  studentsApi.getReportCard(selectedStudentId, {
    term_number: termNumber,
    academic_year: academicYear,
    exam_type: examTypeFilter || undefined,
  }),

enabled:
  !!selectedStudentId &&
  !!termNumber &&
  !!academicYear,

retry: false,
});

// API response contains the report inside data
const report = reportData?.data;

// Safely extract the HTTP status from an Axios-style error
const errorStatus = error?.response?.status ?? error?.status;

const errorMessage =
error?.response?.data?.message ||
error?.message ||
"Failed to load report card. Please try again.";

// Download report card as PDF
const handleDownload = async () => {
if (!report) return;


setDownloading(true);

try {
  const name = [
    report.student?.last_name,
    report.student?.first_name,
    `Term${report.term_number}`,
    academicYear.replace("/", "-"),
    "Report.pdf",
  ]
    .filter(Boolean)
    .join("_");

  await downloadReportCard(documentRef, name);

  toast.success("Term report card downloaded");
} catch {
  toast.error("PDF generation failed — try again");
} finally {
  setDownloading(false);
}


};

// Display the selected exam scope
const examTypeLabel = examTypeFilter || "All exam types";

return ( <div>
<PageHeader
title="Term Report Card"
description={
isStudent
? "Your term academic report"
: "Generate a student's term report card"
}
action={
report && ( <button
           onClick={handleDownload}
           disabled={downloading}
           className="btn-primary w-full sm:w-auto justify-center"
         >
{downloading ? (
<> <Loader2 size={15} className="animate-spin" />
Generating PDF...
</>
) : (
<> <Download size={15} />
Download PDF
</>
)} </button>
)
}
/>

  {/* Report Card Filters */}
  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-6">
    {/* Student Selector — hidden for student accounts */}
    {!isStudent && (
      <div className="sm:w-72">
        <SelectField
          label="Student"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
        >
          <option value="">Select student...</option>

          {studentsData?.data?.map((student) => (
            <option key={student.id} value={student.id}>
              {student.first_name} {student.last_name} (
              {student.student_number})
            </option>
          ))}
        </SelectField>
      </div>
    )}

    {/* Term Selector */}
    <div className="sm:w-36">
      <SelectField
        label="Term"
        value={termNumber}
        onChange={(e) => setTermNumber(e.target.value)}
      >
        <option value="1">Term 1</option>
        <option value="2">Term 2</option>
        <option value="3">Term 3</option>
      </SelectField>
    </div>

    {/* Exam Type Filter */}
    <div className="sm:w-40">
      <SelectField
        label="Exam type"
        value={examTypeFilter}
        onChange={(e) => setExamTypeFilter(e.target.value)}
      >
        <option value="">All (Term average)</option>
        <option value="Mid-term">Mid-term only</option>
        <option value="End-term">End-term only</option>
      </SelectField>
    </div>

    {/* Academic Year */}
    <div className="sm:w-36">
      <label className="block text-xs font-medium text-gray-600 mb-1">
        Academic year
      </label>

      <input
        value={academicYear}
        onChange={(e) => setAcademicYear(e.target.value)}
        placeholder="2025/2026"
        className="input-field"
      />
    </div>

    {/* Class Teacher Name */}
    <div className="sm:w-48">
      <label className="block text-xs font-medium text-gray-600 mb-1">
        Class teacher name
      </label>

      <input
        value={classTeacherName}
        onChange={(e) => setClassTeacherName(e.target.value)}
        placeholder="e.g. Mrs. Wanjiku"
        className="input-field"
      />
    </div>

    {/* Closing Date */}
    <div className="sm:w-44">
      <label className="block text-xs font-medium text-gray-600 mb-1">
        Closing date
      </label>

      <input
        value={closingDate}
        onChange={(e) => setClosingDate(e.target.value)}
        placeholder="e.g. 14th November 2026"
        className="input-field"
      />
    </div>

    {/* Reopening Date */}
    <div className="sm:w-44">
      <label className="block text-xs font-medium text-gray-600 mb-1">
        Re-opening date
      </label>

      <input
        value={openingDate}
        onChange={(e) => setOpeningDate(e.target.value)}
        placeholder="e.g. 6th January 2027"
        className="input-field"
      />
    </div>
  </div>

  {/* Report Card States */}
  {!selectedStudentId ? (
    <div className="bg-white border border-gray-200 rounded-lg py-12 text-center text-sm text-gray-500">
      {isStudent
        ? "Your student account is not linked to a student profile."
        : "Select a student to generate their term report card."}
    </div>
  ) : isLoading ? (
    <div className="flex justify-center py-16">
      <Spinner size="lg" />
    </div>
  ) : isError ? (
    <div className="bg-white border border-gray-200 rounded-lg py-12 px-4 text-center text-sm text-gray-500">
      {errorStatus === 404
        ? `No results found for Term ${termNumber} (${academicYear})${
            examTypeFilter ? ` — ${examTypeFilter}` : ""
          }.`
        : errorMessage}
    </div>
  ) : report ? (
    <>
      {/* Mobile PDF Notice */}
      <div className="mb-3 sm:hidden bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs text-amber-700">
        Download the PDF for best results on mobile.
      </div>

      {/* Report Scope Badge */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="badge bg-brand-50 text-brand-700 text-xs">
          Term {report.term_number} · {report.academic_year}
        </span>

        <span className="badge bg-gray-100 text-gray-700 text-xs">
          {examTypeLabel}
        </span>

        <span className="text-xs text-gray-500">
          {examTypeFilter
            ? `Showing ${examTypeFilter} results`
            : "Showing results across all exam types"}
        </span>
      </div>

      {/* Report Card Document */}
      <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
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
            examType={`Term ${report.term_number} — ${report.academic_year}`}
            isTermReport={true}
            classTeacherName={classTeacherName || null}
            closingDate={closingDate || null}
            openingDate={openingDate || null}
          />
        </div>
      </div>
    </>
  ) : null}
</div>
);
}
