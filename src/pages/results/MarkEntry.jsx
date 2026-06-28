import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useExam } from "../../hooks/useExams";
import { useClassStudents } from "../../hooks/useClasses";
import { useResultsByExam, useBulkCreateResults } from "../../hooks/useResults";
import { gradeBadge } from "../../utils/gradeColors";
import TableSkeleton from "../../components/ui/TableSkeleton";

const previewGrade = (marks, total) => {
  if (marks === "" || marks === null || marks === undefined) return null;
  const rounded = Math.round(Number(marks));
  const pct = (rounded / total) * 100;
  if (pct >= 90) return "EE1";
  if (pct >= 75) return "EE2";
  if (pct >= 58) return "ME1";
  if (pct >= 41) return "ME2";
  if (pct >= 31) return "AE1";
  if (pct >= 21) return "AE2";
  if (pct >= 11) return "BE1";
  if (pct >= 1) return "BE2";
  return "F";
};

const MarkEntry = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const { data: examData, isLoading: examLoading } = useExam(examId);
  const exam = examData?.data;

  const { data: studentsData, isLoading: studentsLoading } = useClassStudents(
    exam?.class_id,
  );
  const { data: existingResultsData } = useResultsByExam(examId);
  const bulkCreate = useBulkCreateResults();

  const [marks, setMarks] = useState({}); // { [student_id]: string }
  const [mobileIndex, setMobileIndex] = useState(0);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const students = studentsData?.data || [];

  // Pre-fill existing marks once both students and results have loaded
  useEffect(() => {
    if (existingResultsData?.data) {
      const prefilled = {};
      existingResultsData.data.forEach((r) => {
        prefilled[r.student_id] = String(r.marks_obtained);
      });
      setMarks((prev) => ({ ...prefilled, ...prev }));
    }
  }, [existingResultsData]);

  const handleMarkChange = (studentId, value) => {
    setSubmitSuccess(false);
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setMarks((prev) => ({ ...prev, [studentId]: value }));
    }
  };

  const enteredCount = useMemo(
    () =>
      students.filter((s) => marks[s.id] !== undefined && marks[s.id] !== "")
        .length,
    [students, marks],
  );

  const isOverLimit = (studentId) => {
    const val = marks[studentId];
    return val !== undefined && val !== "" && Number(val) > exam.total_marks;
  };

  const hasErrors = students.some((s) => isOverLimit(s.id));

  const handleSubmit = () => {
    setSubmitError(null);
    setSubmitSuccess(false);

    const results = students
      .filter((s) => marks[s.id] !== undefined && marks[s.id] !== "")
      .map((s) => ({ student_id: s.id, marks_obtained: Number(marks[s.id]) }));

    if (results.length === 0) {
      setSubmitError("Enter at least one mark before saving");
      return;
    }

    bulkCreate.mutate(
      { exam_id: Number(examId), results },
      {
        onSuccess: () => setSubmitSuccess(true),
        onError: (err) => setSubmitError(err.message),
      },
    );
  };

  if (examLoading || studentsLoading) {
    return <TableSkeleton rows={8} cols={4} />;
  }

  if (!exam) {
    return <p className="text-sm text-red-600">Exam not found</p>;
  }

  const currentStudent = students[mobileIndex];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-900">{exam.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {exam.class_name} · {exam.subject_name} · Out of {exam.total_marks}{" "}
          marks
        </p>
      </div>

      {exam.subject_name?.includes("Paper") ||
      exam.subject_name?.includes("Karatasi") ? (
        <div className="mb-4 px-3 py-2 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-700">
          This is a paper exam (max {exam.total_marks} marks). Marks from both
          papers combine for the full subject total on the report card.
        </div>
      ) : null}
      {submitError && (
        <div className="mb-4 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
          {submitError}
        </div>
      )}
      {submitSuccess && (
        <div className="mb-4 px-3 py-2 rounded-md bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-1.5">
          <Check size={14} /> Marks saved successfully
        </div>
      )}
      {/* Progress bar — visible on all breakpoints */}
      <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
        <span>
          {enteredCount} of {students.length} marked
        </span>
        <span>
          {Math.round((enteredCount / Math.max(students.length, 1)) * 100)}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-brand-600 transition-all"
          style={{
            width: `${(enteredCount / Math.max(students.length, 1)) * 100}%`,
          }}
        />
      </div>
      {/* ── Desktop / tablet: full grid ───────────────────────────────────── */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-compact">
            <thead>
              <tr>
                <th>Student #</th>
                <th>Name</th>
                <th className="w-32">Marks</th>
                <th className="w-20">Grade</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const grade = previewGrade(marks[s.id], exam.total_marks);
                const overLimit = isOverLimit(s.id);
                return (
                  <tr key={s.id}>
                    <td>{s.student_number}</td>
                    <td>
                      {s.first_name} {s.last_name}
                    </td>
                    <td>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={marks[s.id] ?? ""}
                        onChange={(e) => handleMarkChange(s.id, e.target.value)}
                        className={`input-field text-center ${overLimit ? "border-red-400 focus:ring-red-400" : ""}`}
                        placeholder="—"
                      />
                      {overLimit && (
                        <p className="text-xs text-red-600 mt-0.5">
                          Max {exam.total_marks}
                        </p>
                      )}
                    </td>
                    <td>
                      {grade && (
                        <span className={`badge ${gradeBadge(grade)}`}>
                          {grade}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* ── Mobile: one student at a time ─────────────────────────────────── */}
      {students.length > 0 && (
        <div className="md:hidden bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setMobileIndex((i) => Math.max(0, i - 1))}
              disabled={mobileIndex === 0}
              className="text-gray-400 disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs text-gray-500">
              Student {mobileIndex + 1} of {students.length}
            </span>
            <button
              onClick={() =>
                setMobileIndex((i) => Math.min(students.length - 1, i + 1))
              }
              disabled={mobileIndex === students.length - 1}
              className="text-gray-400 disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="text-center mb-4">
            <p className="text-sm font-medium text-gray-900">
              {currentStudent.first_name} {currentStudent.last_name}
            </p>
            <p className="text-xs text-gray-500">
              {currentStudent.student_number}
            </p>
          </div>

          <input
            type="text"
            inputMode="decimal"
            value={marks[currentStudent.id] ?? ""}
            onChange={(e) =>
              handleMarkChange(currentStudent.id, e.target.value)
            }
            className={`input-field text-center text-2xl py-3 ${isOverLimit(currentStudent.id) ? "border-red-400 focus:ring-red-400" : ""}`}
            placeholder="0"
            autoFocus
          />
          <p className="text-center text-xs text-gray-400 mt-1.5">
            out of {exam.total_marks}
          </p>

          {isOverLimit(currentStudent.id) && (
            <p className="text-center text-xs text-red-600 mt-1">
              Cannot exceed {exam.total_marks} marks
            </p>
          )}

          {previewGrade(marks[currentStudent.id], exam.total_marks) && (
            <div className="flex justify-center mt-3">
              <span
                className={`badge ${gradeBadge(previewGrade(marks[currentStudent.id], exam.total_marks))}`}
              >
                Grade {previewGrade(marks[currentStudent.id], exam.total_marks)}
              </span>
            </div>
          )}

          <button
            onClick={() =>
              setMobileIndex((i) => Math.min(students.length - 1, i + 1))
            }
            disabled={mobileIndex === students.length - 1}
            className="btn-secondary w-full justify-center mt-5"
          >
            Next student <ChevronRight size={14} />
          </button>
        </div>
      )}
      {/* Sticky save bar */}
      <div className="sticky bottom-0 mt-5 -mx-3 md:mx-0 px-3 md:px-0 py-3 bg-gray-50/95 backdrop-blur border-t border-gray-200 md:border-t-0 md:bg-transparent">
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            onClick={() => navigate("/results")}
            className="btn-secondary w-full sm:w-auto justify-center"
          >
            Back to exams
          </button>
          <button
            onClick={handleSubmit}
            disabled={bulkCreate.isPending || hasErrors}
            className="btn-primary w-full sm:w-auto justify-center"
          >
            <Save size={16} />{" "}
            {bulkCreate.isPending ? "Saving..." : "Save all marks"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkEntry;
