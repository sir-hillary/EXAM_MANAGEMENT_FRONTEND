import { Link } from "react-router-dom";
import {
  School,
  GraduationCap,
  Users,
  BookOpen,
  ArrowRight,
  ClipboardList,
  Link2,
  BarChart3,
  TrendingUp,
  Calendar,
} from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import useAdminStats from "../../hooks/useDashboardStats";
import { useGenderStats } from "../../hooks/useStudents";

const examTypeBadge = {
  "Mid-term": "bg-amber-100 text-amber-700",
  "End-term": "bg-purple-100 text-purple-700",
  CAT: "bg-blue-100 text-blue-700",
  Mock: "bg-rose-100 text-rose-700",
};

// ── Inline stat card — more visual than the shared StatCard ──────────────────
const DashStatCard = ({ label, value, icon: Icon, to, iconColor, iconBg }) => {
  const inner = (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-3 hover:shadow-sm transition-all group">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className="text-2xl font-black text-gray-900">
          {value === null ? (
            <span className="inline-block h-7 w-14 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            value
          )}
        </p>
      </div>
      <div className={`${iconBg} p-2.5 rounded-xl shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>
  );
  return to ? (
    <Link to={to} className="block group">
      {inner}
    </Link>
  ) : (
    inner
  );
};

// ── Gender bar card ───────────────────────────────────────────────────────────
const GenderCard = ({ label, value, total, color, bg, textColor }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${bg} ${textColor}`}
        >
          {pct}%
        </span>
      </div>
      <p className="text-2xl font-black text-gray-900 mb-2">{value ?? "—"}</p>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

const quickActions = [
  {
    label: "Manage assignments",
    to: "/assignments",
    description: "Qualify teachers, offer subjects to classes",
    icon: Link2,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Schedule an exam",
    to: "/exams",
    description: "Create a new exam for any class",
    icon: ClipboardList,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    label: "Enter marks",
    to: "/results",
    description: "Submit results for a completed exam",
    icon: BarChart3,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
];

const AdminDashboard = () => {
  const { counts, recentExams, isLoading } = useAdminStats();
  const { data: genderData } = useGenderStats();
  const gender = genderData?.data;

  return (
    <div className="space-y-6">
      {/* ── Page title ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-black text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          System overview — Mukuru Outreach Academy
        </p>
      </div>

      {/* ── Core stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <DashStatCard
          label="Classes"
          value={counts.classes}
          icon={School}
          to="/classes"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <DashStatCard
          label="Teachers"
          value={counts.teachers}
          icon={GraduationCap}
          to="/teachers"
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <DashStatCard
          label="Students"
          value={counts.students}
          icon={Users}
          to="/students"
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <DashStatCard
          label="Subjects"
          value={counts.subjects}
          icon={BookOpen}
          to="/subjects"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* ── Gender breakdown ────────────────────────────────────────────── */}
      {gender && (
        <div>
          <SectionHeader title="Student breakdown" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <GenderCard
              label="Boys"
              value={Number(gender.boys)}
              total={Number(gender.total)}
              color="#3b82f6"
              bg="bg-blue-50"
              textColor="text-blue-700"
            />
            <GenderCard
              label="Girls"
              value={Number(gender.girls)}
              total={Number(gender.total)}
              color="#ec4899"
              bg="bg-pink-50"
              textColor="text-pink-700"
            />
            <GenderCard
              label="Other"
              value={Number(gender.other) + Number(gender.unspecified)}
              total={Number(gender.total)}
              color="#8b5cf6"
              bg="bg-violet-50"
              textColor="text-violet-700"
            />
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Total enrolled
              </p>
              <p className="text-2xl font-black text-gray-900">
                {Number(gender.total)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={12} className="text-green-500" />
                <p className="text-xs text-gray-400">All students</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick actions ───────────────────────────────────────────────── */}
      <div>
        <SectionHeader title="Quick actions" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className={`${action.iconBg} p-2.5 rounded-xl shrink-0`}>
                  <action.icon size={16} className={action.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {action.label}
                    </p>
                    <ArrowRight
                      size={13}
                      className="text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent exams ────────────────────────────────────────────────── */}
      <div>
        <SectionHeader
          title="Recent exams"
          linkTo="/exams"
          linkLabel="View all →"
        />

        {recentExams.length === 0 && !isLoading ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl py-10 text-center">
            <Calendar size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-1">No exams scheduled yet</p>
            <Link
              to="/exams"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Create the first exam →
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Title
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Class
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Subject
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <td key={j} className="px-4 py-3">
                              <div
                                className={`h-4 bg-gray-100 rounded animate-pulse ${j === 0 ? "w-2/3" : "w-1/2"}`}
                              />
                            </td>
                          ))}
                        </tr>
                      ))
                    : recentExams.map((exam) => (
                        <tr
                          key={exam.id}
                          className="hover:bg-gray-50/60 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {exam.title}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {exam.class_name}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {exam.subject_name}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${examTypeBadge[exam.exam_type] || "bg-gray-100 text-gray-700"}`}
                            >
                              {exam.exam_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {new Date(exam.exam_date).toLocaleDateString(
                              undefined,
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 space-y-2">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                    </div>
                  ))
                : recentExams.map((exam) => (
                    <div key={exam.id} className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                          {exam.title}
                        </p>
                        <span
                          className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${examTypeBadge[exam.exam_type] || "bg-gray-100 text-gray-700"}`}
                        >
                          {exam.exam_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-gray-500">
                          {exam.class_name}
                        </span>
                        <span className="text-gray-300 text-xs">·</span>
                        <span className="text-xs text-gray-500">
                          {exam.subject_name}
                        </span>
                        <span className="text-gray-300 text-xs">·</span>
                        <span className="text-xs text-gray-400">
                          {new Date(exam.exam_date).toLocaleDateString(
                            undefined,
                            { day: "numeric", month: "short" },
                          )}
                        </span>
                      </div>
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
