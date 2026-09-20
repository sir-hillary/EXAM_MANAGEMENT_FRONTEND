import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  ChevronLeft,
  ChevronRight,
  Check,
  ClipboardList,
  Users,
  CircleAlert,
  ArrowLeft,
  LoaderCircle,
  BookOpen,
} from "lucide-react";

import { useExam } from "../../hooks/useExams";
import { useClassStudents } from "../../hooks/useClasses";
import {
  useResultsByExam,
  useBulkCreateResults,
} from "../../hooks/useResults";

import TableSkeleton from "../../components/ui/TableSkeleton";

const MarkEntry = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const {
    data: examData,
    isLoading: examLoading,
    isError: examError,
  } = useExam(examId);

  const exam = examData?.data;

  const {
    data: studentsData,
    isLoading: studentsLoading,
    isError: studentsError,
  } = useClassStudents(exam?.class_id);

  const {
    data: existingResultsData,
    isLoading: resultsLoading,
  } = useResultsByExam(examId);

  const bulkCreate = useBulkCreateResults();

  const [answers, setAnswers] = useState({});
  const [mobileIndex, setMobileIndex] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const students = studentsData?.data || [];
  const existingResults = existingResultsData?.data || [];

  const totalQuestions = Number(exam?.total_questions) || 0;

  // Derive saved values during render instead of setting state in an effect.
  // Locally edited values take precedence over previously saved results.
  const displayedAnswers = useMemo(() => {
    const savedAnswers = {};

    existingResults.forEach((result) => {
      savedAnswers[result.student_id] = String(
        result.questions_correct ?? ""
      );
    });

    return { ...savedAnswers, ...answers };
  }, [existingResults, answers]);

  // ─── Input Handling ─────────────────────────────────────

  const handleAnswerChange = (studentId, value) => {
    setSubmitError("");
    setSubmitSuccess(false);

    // Allow only whole numbers.
    if (value !== "" && !/^\d+$/.test(value)) return;

    setAnswers((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const isOverLimit = (studentId) => {
    const value = displayedAnswers[studentId];

    return (
      value !== undefined &&
      value !== "" &&
      Number(value) > totalQuestions
    );
  };

  // ─── Progress & Validation ─────────────────────────────

  const enteredCount = useMemo(() => {
    return students.filter(
      (student) =>
        displayedAnswers[student.id] !== undefined &&
        displayedAnswers[student.id] !== ""
    ).length;
  }, [students, displayedAnswers]);

  const progress = students.length
    ? Math.round((enteredCount / students.length) * 100)
    : 0;

  const hasErrors = students.some((student) => {
    const value = displayedAnswers[student.id];

    if (value === undefined || value === "") return false;

    return (
      !Number.isInteger(Number(value)) ||
      Number(value) < 0 ||
      Number(value) > totalQuestions
    );
  });

  const currentStudent = students[mobileIndex];

  // ─── Submit Results ─────────────────────────────────────

  const handleSubmit = () => {
    setSubmitError("");
    setSubmitSuccess(false);

    if (!students.length) {
      setSubmitError("There are no students in this class.");
      return;
    }

    const results = students
      .filter(
        (student) =>
          displayedAnswers[student.id] !== undefined &&
          displayedAnswers[student.id] !== ""
      )
      .map((student) => ({
        student_id: Number(student.id),
        questions_correct: Number(displayedAnswers[student.id]),
      }));

    if (results.length === 0) {
      setSubmitError("Enter at least one score before saving.");
      return;
    }

    if (hasErrors) {
      setSubmitError(
        `Scores must be whole numbers between 0 and ${totalQuestions}.`
      );
      return;
    }

    bulkCreate.mutate(
      {
        exam_id: Number(examId),
        results,
      },
      {
        onSuccess: () => {
          setSubmitSuccess(true);
        },
        onError: (err) => {
          setSubmitError(
            err?.response?.data?.error ||
              err?.response?.data?.message ||
              err?.message ||
              "Failed to save results."
          );
        },
      }
    );
  };

  // ─── Loading & Error States ─────────────────────────────

  if (examLoading) {
    return <TableSkeleton rows={8} cols={4} />;
  }

  if (examError || !exam) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-2 text-red-700">
          <CircleAlert size={18} />
          <p className="text-sm font-medium">
            Unable to load this examination.
          </p>
        </div>

        <button
          onClick={() => navigate("/results")}
          className="mt-4 text-sm font-medium text-red-700 hover:underline"
        >
          Back to exams
        </button>
      </div>
    );
  }

  if (studentsLoading || resultsLoading) {
    return <TableSkeleton rows={8} cols={4} />;
  }

  if (studentsError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-medium text-red-700">
          Failed to load students for this class.
        </p>
      </div>
    );
  }

  // ─── Reusable Score Input ───────────────────────────────

  const renderScoreInput = (student, mobile = false) => {
    const value = displayedAnswers[student.id] ?? "";
    const overLimit = isOverLimit(student.id);

    return (
      <div>
        <input
          type="number"
          min="0"
          max={totalQuestions}
          step="1"
          inputMode="numeric"
          value={value}
          onChange={(e) =>
            handleAnswerChange(student.id, e.target.value)
          }
          aria-label={`Questions correct for ${student.first_name} ${student.last_name}`}
          className={`
            w-full rounded-lg border bg-white text-center font-semibold
            text-gray-900 outline-none transition
            placeholder:text-gray-300
            focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
            ${
              mobile
                ? "h-16 text-3xl"
                : "h-10 text-sm"
            }
            ${
              overLimit
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-200"
            }
          `}
          placeholder="—"
        />

        {overLimit && (
          <p className="mt-1 text-xs text-red-600">
            Max {totalQuestions}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-4">
      {/* ─── Page Header ─────────────────────────────────── */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/results")}
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
            aria-label="Back to exams"
          >
            <ArrowLeft size={17} />
          </button>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600">
              Examination Results
            </p>

            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Enter Scores
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Record the number of questions answered correctly by
              each learner.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600">
          <ClipboardList size={15} />
          Score Entry
        </div>
      </div>

      {/* ─── Exam Summary Card ───────────────────────────── */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                  {exam.exam_type || "Examination"}
                </span>

                {exam.term_number && (
                  <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    Term {exam.term_number}
                  </span>
                )}

                {exam.academic_year && (
                  <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {exam.academic_year}
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-gray-900">
                {exam.title}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Users size={15} />
                  {exam.class_name || "Class"}
                </span>

                <span className="flex items-center gap-1.5">
                  <BookOpen size={15} />
                  {exam.subject_name || "Multiple subjects"}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 px-4 py-3 sm:min-w-36">
              <p className="text-xs font-medium text-gray-500">
                Maximum score
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {totalQuestions}
                <span className="ml-1 text-sm font-medium text-gray-400">
                  questions
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Progress and statistics */}

        <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-3 sm:px-6">
          <div>
            <p className="text-xs font-medium text-gray-500">
              Class size
            </p>

            <p className="mt-1 text-xl font-bold text-gray-900">
              {students.length}
              <span className="ml-1 text-sm font-normal text-gray-400">
                learners
              </span>
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500">
              Scores entered
            </p>

            <p className="mt-1 text-xl font-bold text-gray-900">
              {enteredCount}
              <span className="ml-1 text-sm font-normal text-gray-400">
                / {students.length}
              </span>
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500">
                Entry progress
              </p>

              <p className="text-xs font-semibold text-brand-700">
                {progress}%
              </p>
            </div>

            <div
              className="h-2 overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Score entry progress"
            >
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Feedback Messages ───────────────────────────── */}

      {submitError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <CircleAlert size={17} className="mt-0.5 shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      {submitSuccess && (
        <div className="flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <Check size={17} className="shrink-0" />
          <p>
            Results saved successfully. You can continue editing
            and save again if needed.
          </p>
        </div>
      )}

      {/* ─── Empty Class State ───────────────────────────── */}

      {students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
          <Users size={28} className="mx-auto text-gray-400" />

          <h3 className="mt-3 text-sm font-semibold text-gray-900">
            No learners found
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            This class has no learners available for score entry.
          </p>

          <button
            onClick={() => navigate("/results")}
            className="btn-secondary mt-5 justify-center"
          >
            Back to exams
          </button>
        </div>
      ) : (
        <>
          {/* ─── Desktop / Tablet Score Table ────────────── */}

          <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Learner Scores
                </h3>

                <p className="mt-0.5 text-xs text-gray-500">
                  Enter correct answers for each learner.
                </p>
              </div>

              <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600">
                {enteredCount} / {students.length} entered
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-left">
                    <th className="w-16 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      #
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Learner
                    </th>

                    <th className="w-44 px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Questions Correct
                    </th>

                    <th className="w-32 px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {students.map((student, index) => {
                    const entered =
                      answers[student.id] !== undefined &&
                      answers[student.id] !== "";

                    const overLimit = isOverLimit(student.id);

                    return (
                      <tr
                        key={student.id}
                        className="transition hover:bg-gray-50/70"
                      >
                        <td className="px-5 py-3.5 text-sm text-gray-400">
                          {String(index + 1).padStart(2, "0")}
                        </td>

                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {student.student_number || "No admission number"}
                          </p>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="mx-auto max-w-28">
                            {renderScoreInput(student)}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          {overLimit ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                              <CircleAlert size={12} />
                              Invalid
                            </span>
                          ) : entered ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                              <Check size={12} />
                              Entered
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-3">
              <p className="text-xs text-gray-500">
                Scores must be whole numbers from 0 to{" "}
                <span className="font-semibold text-gray-700">
                  {totalQuestions}
                </span>
                .
              </p>
            </div>
          </div>

          {/* ─── Mobile Score Entry ──────────────────────── */}

          <div className="space-y-4 md:hidden">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Learner Score
                  </h3>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Enter correct answers
                  </p>
                </div>

                <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600">
                  {mobileIndex + 1} / {students.length}
                </span>
              </div>

              {currentStudent && (
                <div className="p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                      {currentStudent.first_name?.charAt(0)}
                      {currentStudent.last_name?.charAt(0)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {currentStudent.first_name}{" "}
                        {currentStudent.last_name}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-500">
                        {currentStudent.student_number ||
                          "No admission number"}
                      </p>
                    </div>
                  </div>

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Questions answered correctly
                  </label>

                  {renderScoreInput(currentStudent, true)}

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      Maximum: {totalQuestions}
                    </span>

                    {answers[currentStudent.id] !== undefined &&
                    answers[currentStudent.id] !== "" &&
                    !isOverLimit(currentStudent.id) ? (
                      <span className="flex items-center gap-1 font-medium text-green-600">
                        <Check size={12} />
                        Score entered
                      </span>
                    ) : null}
                  </div>

                  {isOverLimit(currentStudent.id) && (
                    <p className="mt-2 text-xs text-red-600">
                      Score cannot exceed {totalQuestions}.
                    </p>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileIndex((index) =>
                          Math.max(0, index - 1)
                        )
                      }
                      disabled={mobileIndex === 0}
                      className="btn-secondary w-full justify-center disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={15} />
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setMobileIndex((index) =>
                          Math.min(students.length - 1, index + 1)
                        )
                      }
                      disabled={mobileIndex === students.length - 1}
                      className="btn-secondary w-full justify-center disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile learner progress */}

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">
                  Class entry progress
                </p>

                <p className="text-xs text-gray-500">
                  {enteredCount} of {students.length}
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── Sticky Save Bar ─────────────────────────────── */}

      {students.length > 0 && (
        <div className="sticky bottom-0 z-10 -mx-3 border-t border-gray-200 bg-white/95 px-3 py-3 backdrop-blur-md sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="hidden text-xs text-gray-500 sm:block">
              {enteredCount === students.length
                ? "All learner scores have been entered."
                : `${students.length - enteredCount} learner(s) still pending.`}
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/results")}
                className="btn-secondary w-full justify-center sm:w-auto"
              >
                Back to exams
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  bulkCreate.isPending ||
                  hasErrors ||
                  enteredCount === 0
                }
                className="btn-primary w-full justify-center sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkCreate.isPending ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Saving results...
                  </>
                ) : submitSuccess ? (
                  <>
                    <Check size={16} />
                    Save Again
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Results ({enteredCount})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkEntry;