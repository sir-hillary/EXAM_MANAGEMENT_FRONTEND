import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useExam } from "../../hooks/useExams";
import { useExamSummary, useResultsByExam } from "../../hooks/useResults";
import DataTable from "../../components/ui/DataTable";
import {gradeBadge} from "../../utils/gradeColors";
import TableSkeleton from "../../components/ui/TableSkeleton";

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-3.5">
    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    <p className="text-xl font-semibold text-gray-900 mt-1">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const GRADES = ["EE1", "EE2", "ME1", "ME2", "AE1", "AE2", "BE1", "BE2"];

const ExamSummary = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const { data: examData, isLoading: examLoading } = useExam(examId);
  const { data: summaryData, isLoading: summaryLoading } =
    useExamSummary(examId);
  const { data: resultsData, isLoading: resultsLoading } =
    useResultsByExam(examId);

  const exam = examData?.data;
  const summary = summaryData?.data;
  const results = resultsData?.data || [];

  const maxGradeCount = summary
    ? Math.max(
        ...GRADES.map((g) => Number(summary[`grade_${g.toLowerCase()}`] || 0)),
        1,
      )
    : 1;

  const columns = [
    {
      key: "name",
      header: "Student",
      render: (row) => `${row.first_name} ${row.last_name}`,
    },
    { key: "student_number", header: "Student #" },
    { key: "marks_obtained", header: "Marks" },
    {
      key: "grade",
      header: "Grade",
      render: (row) => (
        <span className={`badge ${gradeBadge(row.grade)}`}>{row.grade}</span>
      ),
    },
  ];

  if (examLoading || summaryLoading || resultsLoading) {
    return <TableSkeleton rows={8} cols={4} />
  }

  if (!exam) return <p className="text-sm text-red-600">Exam not found</p>;

  return (
    <div>
      <button
        onClick={() => navigate("/results")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
      >
        <ArrowLeft size={14} /> Back to exams
      </button>

      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-900">{exam.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {exam.class_name} · {exam.subject_name}
        </p>
      </div>

      {!summary || Number(summary.total_students) === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg py-10 text-center text-sm text-gray-500">
          No results recorded for this exam yet
        </div>
      ) : (
        <>
          {/* Stat cards — 2 cols mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatCard label="Students" value={summary.total_students} />
            <StatCard
              label="Average"
              value={`${summary.average_marks}`}
              sub={`/ ${exam.total_marks}`}
            />
            <StatCard label="Highest" value={summary.highest_marks} />
            <StatCard label="Lowest" value={summary.lowest_marks} />
          </div>

          {/* Grade distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Grade distribution
            </h3>
            <div className="space-y-2">
              {GRADES.map((g) => {
                const count = Number(summary[`grade_${g.toLowerCase()}`] || 0);
                const widthPct = (count / maxGradeCount) * 100;
                return (
                  <div key={g} className="flex items-center gap-3">
                    <span
                      className={`badge ${gradeBadge(g)} w-7 justify-center shrink-0`}
                    >
                      {g}
                    </span>
                    <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded transition-all"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-6 text-right shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full results table */}
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            All results
          </h3>
          <DataTable columns={columns} data={results} />
        </>
      )}
    </div>
  );
};

export default ExamSummary;
