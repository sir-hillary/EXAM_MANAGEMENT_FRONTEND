import { Link } from "react-router-dom";
import {
  School,
  GraduationCap,
  Users,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from "../../components/ui/StartCard";
import useAdminStats from "../../hooks/useDashboardStats";
import { useGenderStats } from "../../hooks/useStudents";

const examTypeBadge = {
  "Mid-term": "bg-amber-100 text-amber-700",
  "End-term": "bg-purple-100 text-purple-700",
};

const AdminDashboard = () => {
  const { counts, recentExams, isLoading } = useAdminStats();
  const { data: genderData } = useGenderStats();
  const gender = genderData?.data;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">System overview</p>
      </div>

      {/* Counts — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Classes"
          value={counts.classes}
          icon={School}
          to="/classes"
          color="brand"
        />
        <StatCard
          label="Teachers"
          value={counts.teachers}
          icon={GraduationCap}
          to="/teachers"
          color="purple"
        />
        <StatCard
          label="Students"
          value={counts.students}
          icon={Users}
          to="/students"
          color="green"
        />
        <StatCard
          label="Subjects"
          value={counts.subjects}
          icon={BookOpen}
          to="/subjects"
          color="amber"
        />
      </div>
      {gender && (
        <div className="mb-6">
          <SectionHeader title="Student gender breakdown" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Boys"
              value={gender.boys}
              icon={Users}
              color="brand"
            />
            <StatCard
              label="Girls"
              value={gender.girls}
              icon={Users}
              color="purple"
            />
            <StatCard
              label="Other"
              value={Number(gender.other) + Number(gender.unspecified)}
              icon={Users}
              color="amber"
            />
            <StatCard
              label="Total students"
              value={gender.total}
              icon={Users}
              color="green"
            />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="mb-6">
        <SectionHeader title="Quick actions" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            {
              label: "Manage assignments",
              to: "/assignments",
              description: "Qualify teachers, offer subjects to classes",
            },
            {
              label: "Schedule an exam",
              to: "/exams",
              description: "Create a new exam for any class",
            },
            {
              label: "Enter marks",
              to: "/results",
              description: "Submit results for a completed exam",
            },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="bg-white border border-gray-200 rounded-lg p-3.5 hover:border-brand-300 hover:bg-brand-50/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {action.description}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="text-gray-300 group-hover:text-brand-500 mt-0.5 shrink-0 transition-colors"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent exams */}
      <div>
        <SectionHeader title="Recent exams" linkTo="/exams" />
        {recentExams.length === 0 && !isLoading ? (
          <div className="bg-white border border-gray-200 rounded-lg py-8 text-center text-sm text-gray-400">
            No exams scheduled yet —{" "}
            <Link to="/exams" className="text-brand-600 hover:underline">
              create one
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-compact">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <td key={j}>
                              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : recentExams.map((exam) => (
                        <tr key={exam.id}>
                          <td className="font-medium">{exam.title}</td>
                          <td>{exam.class_name}</td>
                          <td>{exam.subject_name}</td>
                          <td>
                            <span
                              className={`badge ${examTypeBadge[exam.exam_type] || "bg-gray-100 text-gray-700"}`}
                            >
                              {exam.exam_type}
                            </span>
                          </td>
                          <td>
                            {new Date(exam.exam_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {/* Mobile — stacked cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {recentExams.map((exam) => (
                <div key={exam.id} className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {exam.title}
                    </p>
                    <span
                      className={`badge shrink-0 ${examTypeBadge[exam.exam_type] || "bg-gray-100 text-gray-700"}`}
                    >
                      {exam.exam_type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {exam.class_name} · {exam.subject_name} ·{" "}
                    {new Date(exam.exam_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
