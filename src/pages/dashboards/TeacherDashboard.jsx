import { Link, useNavigate } from "react-router-dom";
import {
  Users, ClipboardList, BarChart3, FileBarChart,
  AlertTriangle, CheckCircle2, ChevronRight,
  Activity, Award, Clock, CalendarDays,
  BookOpen, TrendingUp, School,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { StudentAvatar } from "../../components/ui/StudentAvatar";
import { TeacherAvatar } from "../../components/ui/TeacherAvatar";
import { getDivision } from "../../utils/schoolDivisions";
import { useTeacherDashboard } from "../../hooks/useDashboardStats";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  navy:   "#1a2744",
  gold:   "#c9a84c",
  green:  "#1a3a2a",
  accent: "#0077FF",
};

// ── CBC grade config ──────────────────────────────────────────────────────────
const GRADE_CONFIG = {
  EE1: { color: "#16a34a", bg: "#dcfce7" },
  EE2: { color: "#22c55e", bg: "#f0fdf4" },
  ME1: { color: "#0369a1", bg: "#dbeafe" },
  ME2: { color: "#0ea5e9", bg: "#e0f2fe" },
  AE1: { color: "#d97706", bg: "#fef3c7" },
  AE2: { color: "#f59e0b", bg: "#fefce8" },
  BE1: { color: "#ea580c", bg: "#ffedd5" },
  BE2: { color: "#dc2626", bg: "#fee2e2" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const currentAcademicYear = () => {
  const y = new Date().getFullYear();
  return new Date().getMonth() >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
};

const currentTerm = () => {
  const m = new Date().getMonth();
  if (m >= 0 && m <= 3)  return "Term 1";
  if (m >= 4 && m <= 7)  return "Term 2";
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

// ── Small reusable pieces ─────────────────────────────────────────────────────
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
      {grade}
    </span>
  );
};

const SectionTitle = ({ children, action }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{children}</h2>
    {action}
  </div>
);

const ViewAll = ({ to, label = "View all" }) => (
  <Link
    to={to}
    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
  >
    {label} <ChevronRight size={13} />
  </Link>
);

// ── Circular progress ring ────────────────────────────────────────────────────
const ProgressRing = ({ value, max, size = 52, stroke = 5, color = T.gold }) => {
  const r      = (size - stroke * 2) / 2;
  const circ   = 2 * Math.PI * r;
  const filled = circ * (1 - pct(value, max) / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={filled}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        style={{ fontSize: "10px", fontWeight: 700, fill: T.navy }}>
        {pct(value, max)}%
      </text>
    </svg>
  );
};

// ── Horizontal progress bar with label ───────────────────────────────────────
const LabelledBar = ({ label, value, max, color = T.accent, trailing }) => {
  const p = pct(value, max);
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-gray-600 w-24 truncate shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${p}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-10 text-right shrink-0">
        {trailing ?? `${p}%`}
      </span>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const TeacherDashboard = () => {
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const { data, isLoading: L } = useTeacherDashboard();

  const cls           = data?.assignedClass;
  const division      = cls ? getDivision(cls.grade) : null;
  const academicYear  = currentAcademicYear();
  const term          = currentTerm();
  const totalStudents = Number(data?.studentCounts?.total) || 0;
  const boys          = Number(data?.studentCounts?.boys)  || 0;
  const girls         = Number(data?.studentCounts?.girls) || 0;

  const completedExams = Number(data?.examCompletion?.completed_exams) || 0;
  const totalExams     = Number(data?.examCompletion?.total_exams)     || 0;
  const completionPct  = pct(completedExams, totalExams);

  const totalGradeCount = (data?.gradeDistribution || [])
    .reduce((s, g) => s + Number(g.count), 0);

  // Teacher object reconstructed for the avatar
  const teacherObj = cls ? {
    first_name:       cls.teacher_name?.split(" ")[0] || "",
    last_name:        cls.teacher_name?.split(" ").slice(1).join(" ") || "",
    profile_photo_url: cls.profile_photo_url,
    designation:      cls.designation,
  } : null;

  return (
    <div className="space-y-6 pb-8">

      {/* ── Hero header ──────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${T.navy} 0%, #1e3a5f 100%)` }}
      >
        {/* Decorative shapes */}
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10"
          style={{ background: T.gold }} />
        <div className="absolute right-20 bottom-0 w-20 h-20 rounded-full opacity-5"
          style={{ background: T.gold }} />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

          {/* Left — greeting + teacher identity */}
          <div className="flex items-start gap-4">
            {teacherObj && (
              <div className="shrink-0">
                <TeacherAvatar
                  teacher={teacherObj}
                  size="lg"
                  showBadge={false}
                />
              </div>
            )}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-1"
                style={{ color: T.gold, opacity: 0.9 }}>
                Class Teacher
              </p>
              <h1 className="text-xl font-black leading-tight">
                {L ? "Loading..." : (cls?.teacher_name || user?.email?.split("@")[0])}
              </h1>
              {cls && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(201,168,76,0.25)", color: T.gold }}
                  >
                    {cls.name}
                  </span>
                  {division && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80">
                      {division.label}
                    </span>
                  )}
                  {cls.tsc_number && (
                    <span className="text-xs text-white/50">
                      TSC: {cls.tsc_number}
                    </span>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {[
                  { label: "Year", value: academicYear },
                  { label: "Term", value: term },
                ].map(({ label, value }) => (
                  <div key={label}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs"
                    style={{ background: "rgba(255,255,255,0.1)" }}>
                    <span style={{ color: T.gold }} className="font-semibold">{label}:</span>
                    <span className="font-bold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — completion ring + class stats */}
          <div className="flex items-center gap-4 bg-white/10 rounded-xl px-4 py-3 shrink-0 self-start">
            <ProgressRing
              value={completedExams}
              max={totalExams}
              color={T.gold}
            />
            <div>
              <p className="text-xs opacity-70 mb-0.5">Exam completion</p>
              <p className="text-base font-black leading-none">
                {L ? "—" : `${completedExams} / ${totalExams}`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: T.gold }}>
                {completionPct}% complete
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── No class assigned state ──────────────────────────────────── */}
      {!L && !cls && (
        <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-6 py-12 text-center">
          <School size={32} className="text-amber-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-amber-800 mb-1">No class assigned yet</h3>
          <p className="text-xs text-amber-600 max-w-xs mx-auto">
            You have not been assigned as a class teacher to any class.
            Contact the administrator to get assigned.
          </p>
        </div>
      )}

      {cls && (
        <>
          {/* ── Quick actions ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "My Students",      icon: Users,        to: "/students",    color: T.accent  },
              { label: "Class Exams",      icon: ClipboardList, to: "/exams",      color: "#FF6B35" },
              { label: "Enter Results",    icon: BarChart3,    to: "/results",     color: "#8b5cf6" },
              { label: "Class Report",     icon: FileBarChart, to: `/classes/${cls?.id}/performance`, color: T.gold },
            ].map(({ label, icon: Icon, to, color }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs font-semibold text-gray-700 hover:shadow-md hover:border-gray-300 transition-all group"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: `${color}15` }}
                >
                  <Icon size={16} style={{ color }} />
                </div>
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          {/* ── Class KPI strip ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Total Students", value: totalStudents,
                icon: Users, color: T.accent,
                sub: cls.capacity ? `${pct(totalStudents, cls.capacity)}% of capacity` : undefined,
              },
              {
                label: "Boys",  value: boys,
                icon: UserCheck, color: "#3b82f6",
                sub: `${pct(boys, totalStudents)}% of class`,
              },
              {
                label: "Girls", value: girls,
                icon: UserCheck, color: "#ec4899",
                sub: `${pct(girls, totalStudents)}% of class`,
              },
              {
                label: "Exams scheduled", value: totalExams,
                icon: ClipboardList, color: T.gold,
                sub: `${completedExams} completed`,
              },
            ].map(({ label, value, icon: Icon, color, sub }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}15` }}
                  >
                    <Icon size={16} style={{ color }} />
                  </div>
                </div>
                {L ? (
                  <>
                    <Skeleton className="h-7 w-12 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-black text-gray-900 leading-none mb-1">
                      {fmt(value)}
                    </p>
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* ── Row: Subject performance + Grade distribution ─────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Subject performance bars */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <SectionTitle
                action={
                  cls?.id && (
                    <ViewAll to={`/classes/${cls.id}/performance`} label="Full report" />
                  )
                }
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen size={13} /> Subject averages
                </span>
              </SectionTitle>

              {L ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
                </div>
              ) : (data?.subjectPerformance || []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No results recorded yet
                </p>
              ) : (
                <div className="space-y-2.5">
                  {(data.subjectPerformance || []).map((sub, i) => {
                    const p   = parseFloat(sub.avg_percentage) || 0;
                    const bar =
                      p >= 75 ? "#16a34a" :
                      p >= 60 ? "#0369a1" :
                      p >= 50 ? "#d97706" :
                      p >= 40 ? "#ea580c" : "#dc2626";
                    return (
                      <LabelledBar
                        key={sub.subject_code || i}
                        label={sub.subject_name}
                        value={p}
                        max={100}
                        color={bar}
                        trailing={`${p}%`}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* CBC grade distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <SectionTitle>
                <span className="flex items-center gap-1.5">
                  <TrendingUp size={13} /> Grade distribution
                </span>
              </SectionTitle>

              {L ? (
                <div className="space-y-2">
                  {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {(data?.gradeDistribution || []).map((g) => {
                    const cfg  = GRADE_CONFIG[g.grade] || { color: "#94a3b8", bg: "#f1f5f9" };
                    const barP = pct(g.count, totalGradeCount);
                    return (
                      <div key={g.grade} className="flex items-center gap-3">
                        <span
                          className="w-10 shrink-0 text-center text-xs font-bold rounded px-1 py-0.5"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          {g.grade}
                        </span>
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full flex items-center justify-end pr-1.5 transition-all duration-500"
                            style={{
                              width:      `${Math.max(barP, 4)}%`,
                              background: cfg.color,
                            }}
                          >
                            {barP > 14 && (
                              <span className="text-white text-xs font-bold">{barP}%</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right shrink-0">
                          {fmt(g.count)}
                        </span>
                      </div>
                    );
                  })}
                  {(!data?.gradeDistribution || data.gradeDistribution.length === 0) && (
                    <p className="text-sm text-gray-400 text-center py-6">
                      No results recorded yet
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Row: Top students + Requires attention ─────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Top 5 students */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <SectionTitle action={<ViewAll to="/students" />}>
                <span className="flex items-center gap-1.5">
                  <Award size={13} /> Top performers
                </span>
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
                      <Skeleton className="h-5 w-10" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1 divide-y divide-gray-50">
                  {(data?.topStudents || []).map((s, i) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 py-2.5 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0
                          ${i === 0 ? "text-amber-700 bg-amber-100" :
                            i === 1 ? "text-gray-600 bg-gray-100" :
                            i === 2 ? "text-orange-700 bg-orange-100" :
                            "text-gray-500 bg-gray-50"}`}
                      >
                        {i + 1}
                      </div>
                      <StudentAvatar student={s} size="xs" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {s.first_name} {s.last_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {s.student_number} · {s.exams_taken} exam{s.exams_taken !== 1 ? "s" : ""}
                        </p>
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
                  <AlertTriangle size={13} className="text-amber-500" /> Requires attention
                </span>
              </SectionTitle>

              {L ? (
                <div className="space-y-2">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : (data?.pendingExams || []).length === 0 ? (
                <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-green-50 border border-green-200">
                  <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">All caught up!</p>
                    <p className="text-xs text-green-600">No exams with missing results</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {(data.pendingExams || []).map((exam) => {
                    const donePct = pct(exam.submitted, exam.expected);
                    const isLow   = donePct < 50;
                    return (
                      <Link
                        key={exam.id}
                        to="/results"
                        className="flex items-start gap-3 px-3 py-3 rounded-xl border hover:shadow-sm transition-all group"
                        style={{
                          borderColor: isLow ? "#fecaca" : "#fed7aa",
                          background:  isLow ? "#fef2f2" : "#fff7ed",
                        }}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isLow
                            ? <AlertTriangle size={14} className="text-red-500" />
                            : <Clock size={14} className="text-amber-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{exam.title}</p>
                          <p className="text-xs text-gray-500">
                            {exam.exam_type} ·{" "}
                            {new Date(exam.exam_date).toLocaleDateString(undefined, {
                              day: "numeric", month: "short",
                            })}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1.5 bg-white/70 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width:      `${donePct}%`,
                                  background: isLow ? "#ef4444" : "#f97316",
                                }}
                              />
                            </div>
                            <span
                              className="text-xs font-bold shrink-0"
                              style={{ color: isLow ? "#dc2626" : "#c2410c" }}
                            >
                              {exam.submitted}/{exam.expected}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500 mt-0.5 shrink-0 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Recent exams table ────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <CalendarDays size={13} className="text-gray-400" /> Class exams
              </h2>
              <ViewAll to="/exams" />
            </div>

            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    {["Exam", "Subjects", "Type", "Date", "Term", "Completion"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {L
                    ? Array(5).fill(0).map((_, i) => (
                        <tr key={i}>
                          {Array(6).fill(0).map((_, j) => (
                            <td key={j} className="px-4 py-3">
                              <Skeleton className={`h-4 ${j === 0 ? "w-40" : "w-20"}`} />
                            </td>
                          ))}
                        </tr>
                      ))
                    : (data?.exams || []).map((exam) => {
                        const done     = pct(exam.results_count, exam.class_size);
                        const barColor =
                          done >= 80 ? "#22c55e" :
                          done >= 40 ? "#f59e0b" : "#ef4444";
                        const subjects = Array.isArray(exam.subject_names)
                          ? exam.subject_names.filter(Boolean).join(", ")
                          : "—";
                        return (
                          <tr key={exam.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-900 max-w-[180px] truncate">
                              {exam.title}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate">
                              {subjects}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                {exam.exam_type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                              {new Date(exam.exam_date).toLocaleDateString(undefined, {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              T{exam.term_number} · {exam.academic_year}
                            </td>
                            <td className="px-4 py-3 w-32">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${done}%`, background: barColor }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 shrink-0 whitespace-nowrap">
                                  {exam.results_count}/{exam.class_size}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
              {!L && (!data?.exams || data.exams.length === 0) && (
                <div className="text-center py-10 text-sm text-gray-400">
                  No exams scheduled —{" "}
                  <Link to="/exams" className="text-blue-600 font-semibold hover:underline">
                    create one
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {(data?.exams || []).map((exam) => {
                const done     = pct(exam.results_count, exam.class_size);
                const barColor = done >= 80 ? "#22c55e" : done >= 40 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={exam.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{exam.title}</p>
                      <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {exam.exam_type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      T{exam.term_number} ·{" "}
                      {new Date(exam.exam_date).toLocaleDateString(undefined, {
                        day: "numeric", month: "short",
                      })}
                    </p>
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

          {/* ── Recent activity feed ──────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <SectionTitle action={<ViewAll to="/results" />}>
              <span className="flex items-center gap-1.5">
                <Activity size={13} className="text-gray-400" /> Recent result entries
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
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2.5 hover:bg-gray-50/50 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                      style={{ background: GRADE_CONFIG[item.grade]?.color || "#94a3b8" }}
                    >
                      {item.grade?.slice(0, 2) || "—"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {item.student_name}
                        <span className="font-normal text-gray-400 mx-1">in</span>
                        <span className="text-gray-700">{item.exam_title}</span>
                      </p>
                      <p className="text-xs text-gray-400">{timeAgo(item.created_at)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <GradeBadge grade={item.grade} />
                      <p className="text-xs text-gray-400 mt-0.5">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
                {(!data?.recentActivity || data.recentActivity.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-6">
                    No results recorded yet
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherDashboard;