import { Link } from 'react-router-dom';
import { TrendingUp, BookOpen, Award, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentResults } from '../../hooks/useStudents';
import  SectionHeader  from '../../components/ui/SectionHeader';
import  Spinner  from '../../components/ui/spinner';
import { gradeBadge } from '../../utils/gradeColors';
import StatCard from '../../components/ui/StartCard';

const gradePoints = { EE1: 8, EE2: 7, ME1: 6, ME2: 5, AE1: 4, AE2: 3, BE1: 2, BE2: 1 };

const calculateMeanGrade = (grades) => {
  if (!grades.length) return null;
  const avg = grades.reduce((sum, g) => sum + (gradePoints[g] ?? 0), 0) / grades.length;
  const sorted = Object.entries(gradePoints).sort((a, b) => b[1] - a[1]);
  return sorted.find(([, pts]) => avg >= pts)?.[0] ?? 'F';
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading } = useStudentResults(user?.student_id);
  const results = data?.data ?? [];

  const totalExams = results.length;
  const grades = results.map((r) => r.grade).filter(Boolean);
  const meanGrade = calculateMeanGrade(grades);
  const recentResults = [...results].slice(0, 6);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-900">My Performance</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your academic summary</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            <StatCard label="Exams taken"  value={totalExams} icon={BookOpen}   color="brand" />
            <StatCard label="Mean grade"
              value={meanGrade
                ? <span className={`badge text-sm ${gradeBadge(meanGrade)}`}>{meanGrade}</span>
                : '—'}
              icon={Award}
              color="green"
            />
            <StatCard
              label="View report card"
              value="Full report →"
              to="/report-card"
              color="purple"
            />
          </div>

          {/* Recent results */}
          {results.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg py-12 text-center">
              <p className="text-sm text-gray-500">No results recorded for you yet</p>
            </div>
          ) : (
            <div>
              <SectionHeader title="Recent results" linkTo="/report-card" linkLabel="Full report →" />

              {/* Desktop */}
              <div className="hidden sm:block bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full table-compact">
                  <thead>
                    <tr>
                      <th>Exam</th>
                      <th>Subject</th>
                      <th>Type</th>
                      <th>Marks</th>
                      <th>Grade</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentResults.map((r) => (
                      <tr key={r.id}>
                        <td className="font-medium">{r.exam_title}</td>
                        <td>{r.subject_name}</td>
                        <td>
                          <span className="badge bg-gray-100 text-gray-600">{r.exam_type}</span>
                        </td>
                        <td>{r.marks_obtained} / {r.total_marks}</td>
                        <td>
                          <span className={`badge ${gradeBadge(r.grade)}`}>{r.grade}</span>
                        </td>
                        <td>{new Date(r.exam_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="sm:hidden space-y-2.5">
                {recentResults.map((r) => (
                  <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.exam_title}</p>
                        <p className="text-xs text-gray-500">{r.subject_name}</p>
                      </div>
                      <span className={`badge shrink-0 ${gradeBadge(r.grade)}`}>{r.grade}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{r.marks_obtained} / {r.total_marks}</span>
                      <span>·</span>
                      <span>{r.exam_type}</span>
                      <span>·</span>
                      <span>{new Date(r.exam_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {results.length > 6 && (
                <div className="mt-3 text-center">
                  <Link to="/report-card" className="btn-secondary inline-flex text-xs">
                    View all {results.length} results <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Grade breakdown */}
          {grades.length > 0 && (
            <div className="mt-6">
              <SectionHeader title="Grade breakdown" />
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex flex-wrap gap-2.5">
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((g) => {
                    const count = grades.filter((gr) => gr === g).length;
                    return (
                      <div key={g} className="flex items-center gap-1.5">
                        <span className={`badge ${gradeBadge(g)}`}>{g}</span>
                        <span className="text-sm font-medium text-gray-700">{count}</span>
                        <span className="text-xs text-gray-400">
                          ({grades.length ? Math.round((count / grades.length) * 100) : 0}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StudentDashboard