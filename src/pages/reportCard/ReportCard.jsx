import { useState, useRef } from "react";
import { Download, Loader2 } from "lucide-react";
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

const ReportCard = () => {
  const { role, user } = useAuth();
  const isStudent = role === "student";

  const [selectedStudentId, setSelectedStudentId] = useState(
    isStudent ? user.student_id : "",
  );
  const [examType, setExamType] = useState("End-term");
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
  } = useStudentReportCard(selectedStudentId, examType);
  const report = reportData?.data;

  console.log(report)

  const handleDownload = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const filename = `${report.student.last_name}_${report.student.first_name}_${examType.replace(/\s+/g, "-")}_Report.pdf`;
      await downloadReportCard(documentRef, filename);
      toast.success("Report card downloaded");
    } catch {
      toast.error("PDF download failed — try again");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Report Card"
        description={
          isStudent
            ? "Your academic performance"
            : "View and download a student's report card"
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
        <div className="sm:w-48">
          <SelectField
            label="Exam type"
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
          >
            {EXAM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      {/* States */}
      {!selectedStudentId ? (
        <div className="bg-white border border-gray-200 rounded-lg py-12 text-center text-sm text-gray-500">
          Select a student to view their report card
        </div>
      ) : isLoading ? (
        <TableSkeleton rows={8} cols={4} />
      ) : isError ? (
        <div className="bg-white border border-gray-200 rounded-lg py-12 text-center text-sm text-gray-500">
          {error.status === 404
            ? `No "${examType}" results found for this student yet`
            : error.message}
        </div>
      ) : report ? (
        <>
          {/* Mobile warning */}
          <div className="mb-4 sm:hidden bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs text-amber-700">
            Report card is optimised for larger screens. Download the PDF for
            best results on mobile.
          </div>

          {/* Scrollable preview container */}
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
              <ReportCardDocument report={report} examType={examType} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ReportCard;
