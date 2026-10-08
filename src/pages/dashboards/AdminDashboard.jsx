import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, GraduationCap, School, BookOpen,
  ClipboardList, BarChart3,
  AlertTriangle,  FileBarChart, CheckCircle2,
  Clock, Activity, ChevronRight, Award,
  ArrowUpRight,
} from "lucide-react";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { StudentAvatar } from "../../components/ui/StudentAvatar";

// ── Design tokens matching system branding ──────────────────────────────────
const T = {
  navy:   "#1a2744",
  gold:   "#c9a84c",
  green:  "#1a3a2a",
  accent: "#0077FF",
  teal:   "#00D2FF",
  orange: "#FF6B35",
  bg:     "#F8FAFC",
  dark:   "#0B0F17",
};

// ── Grade config ─────────────────────────────────────────────────────────────
const GRADE_CONFIG = {
  EE1: { label: "EE1", color: "#16a34a", bg: "#dcfce7", short: "Exc" },
  EE2: { label: "EE2", color: "#22c55e", bg: "#f0fdf4", short: "Exc" },
  ME1: { label: "ME1", color: "#0369a1", bg: "#dbeafe", short: "Met" },
  ME2: { label: "ME2", color: "#0ea5e9", bg: "#e0f2fe", short: "Met" },
  AE1: { label: "AE1", color: "#d97706", bg: "#fef3c7", short: "App" },
  AE2: { label: "AE2", color: "#f59e0b", bg: "#fefce8", short: "App" },
  BE1: { label: "BE1", color: "#ea580c", bg: "#ffedd5", short: "Bel" },
  BE2: { label: "BE2", color: "#dc2626", bg: "#fee2e2", short: "Bel" },
};

const currentAcademicYear = () => {
  const y = new Date().getFullYear();
  return new Date().getMonth() >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
};

const currentTerm = () => {
  const m = new Date().getMonth();
  if (m >= 0  && m <= 3)  return "Term 1";
  if (m >= 4  && m <= 7)  return "Term 2";
  return "Term 3";
};

const fmt = (n) =>
  n == null ? "—" : Number(n).toLocaleString();

const pct = (a, b) =>
  b && Number(b) > 0 ? Math.round((Number(a) / Number(b)) * 100) : 0;

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ── Sub-components ────────────────────────────────────────────────────────────

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const GradeBadge = ({ grade }) => {
  const cfg = GRADE_CONFIG[grade];
  if (!cfg) return <span className="text-xs text-gray-400">{grade || "—"}</span>;
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
};

const ProgressRing = ({ value, max, size = 56, stroke = 5, color = T.accent }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * (1 - pct(value, max) / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={filled}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        style={{ fontSize: "11px", fontWeight: 700, fill: T.navy }}>
        {pct(value, max)}%
      </text>
    </svg>
  );
};

const KPICard = ({ icon: Icon, label, value, sub, color, to, loading }) => {
  const content = (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {to && (
          <ArrowUpRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
        )}
      </div>
      {loading ? (
        <>
          <Skeleton className="h-7 w-16 mb-1" />
          <Skeleton className="h-3 w-20" />
        </>
      ) : (
        <>
          <p className="text-2xl font-black text-gray-900 leading-none mb-1">{fmt(value)}</p>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  );
  return to ? <Link to={to} className="block group">{content}</Link> : content;
};

const SectionTitle = ({ children, action }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{children}</h2>
    {action}
  </div>
);

const ViewAll = ({ to }) => (
  <Link to={to} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
    View all <ChevronRight size={13} />
  </Link>
);

// ── Main component ────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboardStats();
  const L = isLoading;

  const academicYear = currentAcademicYear();
  const term         = currentTerm();

  // Derived values
  const completionPct = data
    ? pct(data.completion?.completed_exams, data.completion?.total_exams)
    : 0;

  const boysPct  = data ? pct(data.gender?.boys,  data.gender?.total) : 0;
  const girlsPct = data ? pct(data.gender?.girls, data.gender?.total) : 0;

  const totalGradeCount = useMemo(() =>
    (data?.gradeDistribution || []).reduce((s, g) => s + Number(g.count), 0),
    [data?.gradeDistribution]
  );

  return (
    <div className="space-y-6 pb-8">

      {/* ── Welcome header ─────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${T.navy} 0%, #243355 100%)` }}
      >
        {/* Decorative circle */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10"
          style={{ background: T.gold }} />
        <div className="absolute right-16 bottom-0 w-24 h-24 rounded-full opacity-5"
          style={{ background: T.gold }} />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1"
              style={{ color: T.gold, opacity: 0.9 }}>
              Exam Management System
            </p>
            <h1 className="text-2xl font-black leading-tight">
              Mukuru Outreach Academy
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {[
                { label: "Academic Year", value: academicYear },
                { label: "Current Term",  value: term },
              ].map(({ label, value }) => (
                <div key={label}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs"
                  style={{ background: "rgba(255,255,255,0.1)" }}>
                  <span style={{ color: T.gold }} className="font-semibold">{label}:</span>
                  <span className="font-bold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Completion ring */}
          <div className="flex items-center gap-4 bg-white/10 rounded-xl px-5 py-3 shrink-0">
            <ProgressRing
              value={data?.completion?.completed_exams}
              max={data?.completion?.total_exams}
              color={T.gold}
            />
            <div>
              <p className="text-xs opacity-70 mb-0.5">Exams completed</p>
              <p className="text-lg font-black leading-none">
                {L ? "—" : `${data.completion?.completed_exams} / ${data.completion?.total_exams}`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: T.gold }}>
                {completionPct}% complete
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick actions ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Add Student",    icon: Users,        to: "/students",  color: T.accent,  action: () => navigate("/students") },
          { label: "Create Exam",    icon: ClipboardList, to: "/exams",    color: T.orange,  action: () => navigate("/exams") },
          { label: "Enter Results",  icon: BarChart3,    to: "/results",   color: "#8b5cf6", action: () => navigate("/results") },
          { label: "Report Cards",   icon: FileBarChart, to: "/report-card", color: T.gold,  action: () => navigate("/report-card") },
        ].map(({ label, icon: Icon, color, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:shadow-md hover:border-gray-300 transition-all group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
              style={{ background: `${color}15` }}
            >
              <Icon size={16} style={{ color }} />
            </div>
            <span className="truncate text-xs sm:text-sm">{label}</span>
          </button>
        ))}
      </div>

      {/* ── KPI cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard loading={L} icon={Users}        label="Students"  value={data?.counts?.students}  color={T.accent}  to="/students" />
        <KPICard loading={L} icon={GraduationCap} label="Teachers" value={data?.counts?.teachers}  color="#8b5cf6"   to="/teachers" />
        <KPICard loading={L} icon={School}        label="Classes"  value={data?.counts?.classes}   color={T.orange}  to="/classes"  />
        <KPICard loading={L} icon={BookOpen}      label="Subjects" value={data?.counts?.subjects}  color={T.teal}    to="/subjects" />
        <KPICard loading={L} icon={ClipboardList} label="Exams"    value={data?.counts?.exams}     color={T.gold}    to="/exams"    />
        <KPICard loading={L} icon={Activity}      label="Results"  value={data?.counts?.results}   color="#ec4899"   to="/results"  />
      </div>

      {/* ── Row 2: Gender + Grade distribution ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Gender breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionTitle>Student composition</SectionTitle>
          <div className="space-y-3">
            {/* Boys bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-gray-700">Boys</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600">{fmt(data?.gender?.boys)}</span>
                  <span className="text-xs text-gray-400">{boysPct}%</span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${boysPct}%`, background: "linear-gradient(90deg, #3b82f6, #60a5fa)" }}
                />
              </div>
            </div>

            {/* Girls bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <span className="text-xs font-medium text-gray-700">Girls</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-pink-600">{fmt(data?.gender?.girls)}</span>
                  <span className="text-xs text-gray-400">{girlsPct}%</span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${girlsPct}%`, background: "linear-gradient(90deg, #ec4899, #f472b6)" }}
                />
              </div>
            </div>

            {/* Division split */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-100">
              {[
                { label: "Primary (Gr 4–6)", color: "#22c55e", bg: "#f0fdf4" },
                { label: "Junior (Gr 7–8)",  color: "#3b82f6", bg: "#eff6ff" },
              ].map(({ label, color, bg }) => (
                <div key={label} className="rounded-lg p-3 text-center" style={{ background: bg }}>
                  <p className="text-xs font-semibold" style={{ color }}>{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Division</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grade distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionTitle>Grade distribution (all results)</SectionTitle>
          {L ? (
            <div className="space-y-2">
              {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {(data?.gradeDistribution || []).map((g) => {
                const cfg   = GRADE_CONFIG[g.grade] || { color: "#94a3b8", bg: "#f1f5f9", label: g.grade };
                const barPct = pct(g.count, totalGradeCount);
                return (
                  <div key={g.grade} className="flex items-center gap-3">
                    <span
                      className="w-10 shrink-0 text-center text-xs font-bold rounded px-1 py-0.5"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-1.5 transition-all duration-500"
                        style={{ width: `${Math.max(barPct, 4)}%`, background: cfg.color }}
                      >
                        {barPct > 12 && (
                          <span className="text-white text-xs font-bold">{barPct}%</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right shrink-0">
                      {fmt(g.count)}
                    </span>
                  </div>
                );
              })}
              {(!data?.gradeDistribution || data.gradeDistribution.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-6">No results recorded yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: Top students + Requires attention ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top 5 students */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionTitle action={<ViewAll to="/students" />}>
            <span className="flex items-center gap-1.5"><Award size={14} /> Top performers</span>
          </SectionTitle>
          {L ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {(data?.topStudents || []).map((s, i) => (
                <div key={s.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  {/* Position medal */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0
                    ${i === 0 ? "text-amber-700 bg-amber-100" :
                      i === 1 ? "text-gray-600 bg-gray-100" :
                      i === 2 ? "text-orange-700 bg-orange-100" :
                      "text-gray-500 bg-gray-50"}`}>
                    {i + 1}
                  </div>
                  <StudentAvatar student={s} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {s.first_name} {s.last_name}
                    </p>
                    <p className="text-xs text-gray-400">{s.class_name} · {s.exams_taken} exams</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black" style={{ color: T.accent }}>
                      {s.avg_percentage}%
                    </p>
                    <p className="text-xs text-gray-400">avg</p>
                  </div>
                </div>
              ))}
              {(!data?.topStudents || data.topStudents.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-6">
                  No results recorded yet
                </p>
              )}
            </div>
          )}
        </div>

        {/* Requires attention */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionTitle>
            <span className="flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-500" /> Requires attention
            </span>
          </SectionTitle>
          {L ? (
            <div className="space-y-2">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {(data?.pendingResults || []).length === 0 ? (
                <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-green-50 border border-green-200">
                  <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">All caught up!</p>
                    <p className="text-xs text-green-600">No exams with missing results</p>
                  </div>
                </div>
              ) : (
                (data?.pendingResults || []).map((exam) => {
                  const completedPct = pct(exam.submitted, exam.expected);
                  const isLow        = completedPct < 50;
                  return (
                    <Link key={exam.id} to="/results"
                      className="flex items-start gap-3 px-3 py-3 rounded-xl border hover:shadow-sm transition-all group"
                      style={{ borderColor: isLow ? "#fecaca" : "#fed7aa", background: isLow ? "#fef2f2" : "#fff7ed" }}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isLow
                          ? <AlertTriangle size={15} className="text-red-500" />
                          : <Clock size={15} className="text-amber-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{exam.title}</p>
                        <p className="text-xs text-gray-500">{exam.class_name} · {exam.exam_type}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 bg-white/70 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width:      `${completedPct}%`,
                                background: isLow ? "#ef4444" : "#f97316",
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold shrink-0"
                            style={{ color: isLow ? "#dc2626" : "#c2410c" }}>
                            {exam.submitted}/{exam.expected}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 mt-0.5 shrink-0 transition-colors" />
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: Recent exams table ───────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
            <ClipboardList size={14} className="text-gray-400" /> Recent exams
          </h2>
          <ViewAll to="/exams" />
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                {["Exam", "Class", "Type", "Date", "Completion", "Term"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {L ? Array(5).fill(0).map((_, i) => (
                <tr key={i}>
                  {Array(6).fill(0).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className={`h-4 ${j === 0 ? "w-40" : "w-20"}`} />
                    </td>
                  ))}
                </tr>
              )) : (data?.recentExams || []).map((exam) => {
                const done     = pct(exam.results_count, exam.class_size);
                const barColor = done >= 80 ? "#22c55e" : done >= 40 ? "#f59e0b" : "#ef4444";
                return (
                  <tr key={exam.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900 max-w-[200px] truncate">
                      {exam.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                        {exam.class_name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {exam.exam_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(exam.exam_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${done}%`, background: barColor }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 shrink-0">
                          {exam.results_count}/{exam.class_size}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      T{exam.term_number} · {exam.academic_year}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!L && (!data?.recentExams || data.recentExams.length === 0) && (
            <div className="text-center py-10 text-sm text-gray-400">
              No exams scheduled yet —{" "}
              <Link to="/exams" className="text-blue-600 font-semibold hover:underline">
                create one
              </Link>
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {(data?.recentExams || []).map((exam) => {
            const done     = pct(exam.results_count, exam.class_size);
            const barColor = done >= 80 ? "#22c55e" : done >= 40 ? "#f59e0b" : "#ef4444";
            return (
              <div key={exam.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{exam.title}</p>
                  <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {exam.exam_type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 flex-wrap">
                  <span>{exam.class_name}</span>
                  <span>·</span>
                  <span>T{exam.term_number}</span>
                  <span>·</span>
                  <span>{new Date(exam.exam_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${done}%`, background: barColor }} />
                  </div>
                  <span className="text-xs text-gray-500">{exam.results_count}/{exam.class_size}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Row 5: Recent activity feed ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <SectionTitle action={<ViewAll to="/results" />}>
          <span className="flex items-center gap-1.5">
            <Activity size={14} className="text-gray-400" /> Recent result activity
          </span>
        </SectionTitle>

        {L ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-2.5 w-28" />
                </div>
                <Skeleton className="h-5 w-10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-gray-50">
            {(data?.recentActivity || []).map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 hover:bg-gray-50/50 rounded-lg px-2 -mx-2 transition-colors">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                  style={{ background: GRADE_CONFIG[item.grade]?.color || "#94a3b8" }}
                >
                  {item.grade?.slice(0, 2) || "—"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {item.student_name}
                    <span className="font-normal text-gray-400 ml-1">in</span>
                    <span className="text-gray-700 ml-1">{item.exam_title}</span>
                  </p>
                  <p className="text-xs text-gray-400">{item.class_name} · {timeAgo(item.created_at)}</p>
                </div>
                <div className="text-right shrink-0">
                  <GradeBadge grade={item.grade} />
                  <p className="text-xs text-gray-400 mt-0.5">{item.percentage}%</p>
                </div>
              </div>
            ))}
            {(!data?.recentActivity || data.recentActivity.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-6">No results recorded yet</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;