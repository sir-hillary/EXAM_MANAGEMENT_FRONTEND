import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { useClassPerformance } from "../../hooks/useClasses";
import { useClasses } from "../../hooks/useClasses";
import PageHeader from "../../components/ui/PageHeader";
import SelectField from "../../components/ui/SelectField";
import Spinner from "../../components/ui/Spinner";
import { gradeBadge } from "../../utils/gradeColors";
import { getDivision } from "../../utils/schoolDivisions";

const EXAM_TYPES = ["Mid-term", "End-term"];

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
  const { data: classesData } = useClasses({ limit: 100 });

  const report = data?.data;
  const division = report?.class ? getDivision(report.class.grade_level) : null;

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
            ? `${division.label} · Grade ${report?.class.grade_level}`
            : "Class ranking by marks and points"
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
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-600">{error.message}</p>
      ) : !report || report.students.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg py-10 text-center text-sm text-gray-500">
          No results recorded for this class under {examType} yet
        </div>
      ) : (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Students", value: report.meta.total_students },
              {
                label: "Top marks",
                value: report.students[0]?.total_marks ?? "—",
              },
              {
                label: "Top points",
                value: report.students[0]?.total_points ?? "—",
              },
              {
                label: "Mean grade",
                value: report.students[0]?.mean_grade ? (
                  <span
                    className={`badge ${gradeBadge(report.students[0].mean_grade)}`}
                  >
                    {report.students[0].mean_grade}
                  </span>
                ) : (
                  "—"
                ),
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-3.5"
              >
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {s.label}
                </p>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Rankings table */}
          {/* Desktop */}
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
                    <th>Total Points</th>
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
                      <td>{s.total_points}</td>
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
                  <span>
                    Points:{" "}
                    <strong className="text-gray-800">{s.total_points}</strong>
                  </span>
                  <span>Subjects: {s.subjects_count}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ClassPerformance;
