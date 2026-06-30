import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Loader2,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { useClassPerformance } from "../../hooks/useClasses";
import  SelectField  from "../../components/ui/SelectField";
import { gradeBadge } from "../../utils/gradeColors";
import { getDivision } from "../../utils/schoolDivisions";
import { downloadReportCard } from "../../utils/downloadReportCard";
import TableSkeleton from "../../components/ui/TableSkeleton";
import PageHeader from "../../components/ui/PageHeader";
import ClassPerformancePDF from "./ClassPerformancePDF";

const EXAM_TYPES = ["CAT", "Mid-term", "End-term", "Mock", "Assignment"];

const positionSuffix = (n) => {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
};
const ClassPerformance = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [examType, setExamType] = useState("End-term");
  const { data, isLoading, isError, error } = useClassPerformance(
    classId,
    examType,
  );

  const pdfRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const report = data?.data;
  const division = report ? getDivision(report.class.grade) : null;
  const isPrimary = report?.division === "primary";

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const filename = `${report.class.name}_${examType.replace(/\s+/g, "-")}_Performance.pdf`;
      await downloadReportCard(pdfRef, filename);
      toast.success("Performance report downloaded");
    } catch {
      toast.error("PDF generation failed — try again");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate("/classes")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
      >
        <ArrowLeft size={14} /> Back to classes
      </button>

      <PageHeader
        title={
          report ? `${report.class.name} — Performance` : "Class Performance"
        }
        description={
          division
            ? `${division.label} · Grade ${report?.class.grade}`
            : "Class ranking by marks and points"
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
                  <Loader2 size={15} className="animate-spin" /> Generating...
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

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
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

      {isLoading ? (
        <div className="flex justify-center py-16">
          <TableSkeleton rows={8} cols={4} />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-600">{error.message}</p>
      ) : !report || report.students.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg py-10 text-center text-sm text-gray-500">
          No results recorded for this class under {examType} yet
        </div>
      ) : (
        <>
          {/* ── Rich metadata header — addresses Issue 3 ── */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-brand-50 p-2 rounded-md">
                  <Users size={16} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {report.meta.total_students}
                  </p>
                  <p className="text-xs text-gray-500">Sat the exam</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="bg-green-50 p-2 rounded-md">
                  <TrendingUp size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {report.meta.class_average}
                  </p>
                  <p className="text-xs text-gray-500">Class average</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="bg-amber-50 p-2 rounded-md">
                  <Award size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {report.meta.top_student
                      ? `${report.meta.top_student.first_name} ${report.meta.top_student.last_name}`
                      : "—"}
                  </p>
                  <p className="text-xs text-gray-500">Top student</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-base font-semibold text-blue-600">
                    {report.meta.boys}
                  </p>
                  <p className="text-xs text-gray-500">Boys</p>
                </div>
                <div>
                  <p className="text-base font-semibold text-pink-600">
                    {report.meta.girls}
                  </p>
                  <p className="text-xs text-gray-500">Girls</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop rankings table */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-compact">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Student</th>
                    <th>Adm. No.</th>
                    <th>Subjects</th>
                    <th>Total Marks</th>
                    {!isPrimary && <th>Total Points</th>}
                    <th>Mean Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {report.students.map((s) => (
                    <tr
                      key={s.student_id}
                      className={s.position <= 3 ? "bg-amber-50/40" : ""}
                    >
                      <td>
                        <span
                          className={`font-semibold ${
                            s.position === 1
                              ? "text-amber-600"
                              : s.position === 2
                                ? "text-gray-500"
                                : s.position === 3
                                  ? "text-orange-500"
                                  : "text-gray-700"
                          }`}
                        >
                          {positionSuffix(s.position)}
                        </span>
                      </td>
                      <td className="font-medium">
                        {s.first_name} {s.last_name}
                      </td>
                      <td className="text-gray-500">{s.student_number}</td>
                      <td>{s.subjects_count}</td>
                      <td className="font-semibold">{s.total_marks}</td>
                      {!isPrimary && <td>{s.total_points}</td>}
                      <td>
                        {s.mean_grade ? (
                          <span className={`badge ${gradeBadge(s.mean_grade)}`}>
                            {s.mean_grade}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile stacked cards */}
          <div className="md:hidden space-y-2.5">
            {report.students.map((s) => (
              <div
                key={s.student_id}
                className={`bg-white border rounded-lg p-3.5 ${s.position <= 3 ? "border-amber-200" : "border-gray-200"}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span
                      className={`text-sm font-bold mr-2 ${
                        s.position === 1
                          ? "text-amber-600"
                          : s.position === 2
                            ? "text-gray-500"
                            : s.position === 3
                              ? "text-orange-500"
                              : "text-gray-700"
                      }`}
                    >
                      {positionSuffix(s.position)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {s.first_name} {s.last_name}
                    </span>
                  </div>
                  {s.mean_grade && (
                    <span
                      className={`badge shrink-0 ${gradeBadge(s.mean_grade)}`}
                    >
                      {s.mean_grade}
                    </span>
                  )}
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>
                    Marks:{" "}
                    <strong className="text-gray-800">{s.total_marks}</strong>
                  </span>
                  {!isPrimary && (
                    <span>
                      Points:{" "}
                      <strong className="text-gray-800">
                        {s.total_points}
                      </strong>
                    </span>
                  )}
                  <span>Subjects: {s.subjects_count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Hidden PDF render target */}
          <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
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
