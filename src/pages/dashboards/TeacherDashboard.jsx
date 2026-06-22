import { Link, useNavigate } from "react-router-dom";
import { ClipboardEdit, BarChart3, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTeacherDashboard } from "../../hooks/useDashboardStats";
import SectionHeader from "../../components/ui/SectionHeader";
import Spinner from "../../components/ui/Spinner";
import { useResultsByExam } from "../../hooks/useResults";

const examTypeBadge = {
  "Mid-term": "bg-amber-100 text-amber-700",
  "End-term": "bg-purple-100 text-purple-700",
};

// Small inline component — shows whether an exam has results entered
const ExamResultStatus = ({ examId }) => {
  const { data, isLoading } = useResultsByExam(examId);
  if (isLoading)
    return (
      <span className="inline-block h-4 w-14 bg-gray-100 rounded animate-pulse" />
    );
  const count = data?.data?.length ?? 0;
  return count > 0 ? (
    <span className="badge bg-green-100 text-green-700">{count} marked</span>
  ) : (
    <span className="badge bg-amber-100 text-amber-700">Pending</span>
  );
};

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { exams, isLoading } = useTeacherDashboard(user?.teacher_id);

  const upcoming = exams.filter((e) => new Date(e.exam_date) >= new Date());
  const past = exams.filter((e) => new Date(e.exam_date) < new Date());

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-900">
          Welcome back, {user?.email?.split("@")[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Your exams and marking workload
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg py-12 text-center">
          <p className="text-sm text-gray-500">No exams assigned to you yet</p>
          <Link to="/exams" className="btn-primary mt-3 inline-flex">
            Create an exam
          </Link>
        </div>
      ) : (
        <>
          {/* Upcoming exams */}
          {upcoming.length > 0 && (
            <div className="mb-6">
              <SectionHeader
                title={`Upcoming exams (${upcoming.length})`}
                linkTo="/exams"
              />
              <div className="space-y-2.5">
                {upcoming.map((exam) => (
                  <div
                    key={exam.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-brand-50 p-2 rounded-md shrink-0">
                          <Clock size={16} className="text-brand-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {exam.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {exam.class_name} · {exam.subject_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className={`badge ${examTypeBadge[exam.exam_type] || "bg-gray-100 text-gray-700"}`}
                            >
                              {exam.exam_type}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(exam.exam_date).toLocaleDateString(
                                undefined,
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => navigate(`/results/entry/${exam.id}`)}
                          className="btn-primary text-xs px-2.5 py-1.5 whitespace-nowrap"
                        >
                          <ClipboardEdit size={13} /> Enter marks
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past exams — compact table showing marking status */}
          {past.length > 0 && (
            <div>
              <SectionHeader
                title={`Past exams (${past.length})`}
                linkTo="/results"
              />
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Desktop */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full table-compact">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Class</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Results</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {past.map((exam) => (
                        <tr key={exam.id}>
                          <td className="font-medium">{exam.title}</td>
                          <td>{exam.class_name}</td>
                          <td>{exam.subject_name}</td>
                          <td>
                            {new Date(exam.exam_date).toLocaleDateString()}
                          </td>
                          <td>
                            <ExamResultStatus examId={exam.id} />
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/results/entry/${exam.id}`)
                                }
                                className="text-gray-400 hover:text-brand-600"
                                title="Enter/edit marks"
                              >
                                <ClipboardEdit size={15} />
                              </button>
                              <button
                                onClick={() =>
                                  navigate(`/results/summary/${exam.id}`)
                                }
                                className="text-gray-400 hover:text-brand-600"
                                title="View summary"
                              >
                                <BarChart3 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="sm:hidden divide-y divide-gray-100">
                  {past.map((exam) => (
                    <div key={exam.id} className="p-3.5">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-sm font-medium text-gray-900">
                          {exam.title}
                        </p>
                        <ExamResultStatus examId={exam.id} />
                      </div>
                      <p className="text-xs text-gray-500">
                        {exam.class_name} · {exam.subject_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(exam.exam_date).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => navigate(`/results/entry/${exam.id}`)}
                          className="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1"
                        >
                          <ClipboardEdit size={12} /> Marks
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/results/summary/${exam.id}`)
                          }
                          className="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1"
                        >
                          <BarChart3 size={12} /> Summary
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherDashboard;
