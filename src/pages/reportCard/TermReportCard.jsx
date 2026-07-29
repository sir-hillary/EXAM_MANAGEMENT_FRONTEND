import { useState, useRef } from "react";
import { Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useStudents, useStudentTermReportCard } from "../../hooks/useStudents";
import PageHeader from "../../components/ui/PageHeader";
import SelectField from "../../components/ui/SelectField";
import Spinner from "../../components/ui/spinner";
import ReportCardDocument from "./ReportCardDocument";
import { downloadReportCard } from "../../utils/downloadReportCard";
import { useAuth } from "../../context/AuthContext";

const currentAcademicYear = () => {
  const y = new Date().getFullYear();
  return new Date().getMonth() >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
};

export default function TermReportCard() {
  const { role, user } = useAuth();
  const isStudent = role === "student";

  const [selectedStudentId, setSelectedStudentId] = useState(
    isStudent ? user.student_id : "",
  );
  const [closingDate, setClosingDate] = useState("");
  const [openingDate, setOpeningDate] = useState("");
  const [classTeacherName, setClassTeacherName] = useState("");
  const [termNumber, setTermNumber] = useState("1");
  const [academicYear, setAcademicYear] = useState(currentAcademicYear);
  const [downloading, setDownloading] = useState(false);
  const documentRef = useRef(null);

  const { data: studentsData } = useStudents(
    { limit: 200 },
    { enabled: !isStudent },
  );
  const {
    data: reportData,
    isLoading,
    isError,
    error,
  } = useStudentTermReportCard(selectedStudentId, termNumber, academicYear);

  const report = reportData?.data;

  const handleDownload = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const name = [
        report.student.last_name,
        report.student.first_name,
        `Term${report.term_number}`,
        academicYear.replace("/", "-"),
        "Report.pdf",
      ].join("_");
      await downloadReportCard(documentRef, name);
      toast.success("Term report card downloaded");
    } catch {
      toast.error("PDF generation failed — try again");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Term Report Card"
        description={
          isStudent
            ? "Your term academic report"
            : "Generate a student's term report card"
        }
        action={
          report && (
            <button
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
          )
        }
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {!isStudent && (
          <div className="sm:w-72">
            <SelectField
              label="Student"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">Select student...</option>
              {studentsData?.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} ({s.student_number})
                </option>
              ))}
            </SelectField>
          </div>
        )}

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

        <div className="sm:w-36">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Academic year
          </label>
          <input
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="2024/2025"
            className="input-field"
          />
        </div>
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

        <div className="sm:w-44">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Closing date
          </label>
          <input
            value={closingDate}
            onChange={(e) => setClosingDate(e.target.value)}
            placeholder="e.g. 14th November 2025"
            className="input-field"
          />
        </div>

        <div className="sm:w-44">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Re-opening date
          </label>
          <input
            value={openingDate}
            onChange={(e) => setOpeningDate(e.target.value)}
            placeholder="e.g. 6th January 2026"
            className="input-field"
          />
        </div>
      </div>

      {/* States */}
      {!selectedStudentId ? (
        <div className="bg-white border border-gray-200 rounded-lg py-12 text-center text-sm text-gray-500">
          {isStudent
            ? "Loading your report..."
            : "Select a student to generate their term report card"}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="bg-white border border-gray-200 rounded-lg py-12 text-center text-sm text-gray-500">
          {error.status === 404
            ? `No results found for Term ${termNumber} (${academicYear})`
            : error.message}
        </div>
      ) : report ? (
        <>
          <div className="mb-3 sm:hidden bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs text-amber-700">
            Download the PDF for best results on mobile.
          </div>

          {/* Term badge above the document */}
          <div className="flex items-center gap-2 mb-3">
            <span className="badge bg-brand-50 text-brand-700 text-xs">
              Term {report.term_number} · {report.academic_year}
            </span>
            <span className="text-xs text-gray-500">
              Shows averages of Midterm + Endterm per subject
            </span>
          </div>

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
