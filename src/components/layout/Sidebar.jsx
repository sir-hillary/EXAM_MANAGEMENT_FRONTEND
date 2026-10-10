import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  School,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileBarChart,
  Link2,
  BarChart3,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Award,
  Image,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// ── Nav structure — all routes including new ones ─────────────────────────────
const navSections = [
  {
    label: "Main",
    items: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "teacher", "student"],
      },
      {
        to: "/classes",
        label: "Classes",
        icon: School,
        roles: ["admin", "teacher"],
      },
      {
        to: "/students",
        label: "Students",
        icon: Users,
        roles: ["admin", "teacher"],
      },
      {
        to: "/teachers",
        label: "Teachers",
        icon: GraduationCap,
        roles: ["admin"],
      },
    ],
  },
  {
    label: "Academics",
    items: [
      {
        to: "/subjects",
        label: "Subjects",
        icon: BookOpen,
        roles: ["admin", "teacher"],
      },
      {
        to: "/assignments",
        label: "Assignments",
        icon: Link2,
        roles: ["admin"],
      },
      {
        to: "/exams",
        label: "Exams",
        icon: ClipboardList,
        roles: ["admin", "teacher"],
      },
      {
        to: "/results",
        label: "Results",
        icon: BarChart3,
        roles: ["admin", "teacher"],
      },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        to: "/report-card",
        label: "Report Card",
        icon: FileBarChart,
        roles: ["admin", "teacher", "student"],
      },
      {
        to: "/term-report-card",
        label: "Term Report",
        icon: Award,
        roles: ["admin", "teacher", "student"],
      },
      {
        to: "/bulk-report-cards",
        label: "Bulk Download",
        icon: FileDown,
        roles: ["admin", "teacher"],
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        to: "/banners",
        label: "Login Banners",
        icon: Image,
        roles: ["admin"],
      },
    ],
  },
];

// Role display labels
const ROLE_LABELS = {
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
};

// Initials from email or display_name
const initials = (user) => {
  if (user?.display_name) {
    const parts = user.display_name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  const local = user?.email?.split("@")[0] ?? "";
  const parts = local.split(/[._-]/);
  return (
    parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "??"
  );
};

const shortName = (user) => {
  if (user?.display_name) return user.display_name.split(" ")[0];
  return user?.email?.split("@")[0] ?? "";
};

// ── Tooltip wrapper — shown on collapsed icons ────────────────────────────────
const Tooltip = ({ label, children }) => (
  <div className="relative group/tip">
    {children}
    <div
      className="
      pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3
      px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap
      opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50
    "
      style={{ background: "#1a2744" }}
    >
      {label}
      {/* Arrow */}
      <div
        className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
        style={{ borderRightColor: "#1a2744" }}
      />
    </div>
  </div>
);

// ── Main Sidebar ──────────────────────────────────────────────────────────────
const Sidebar = ({ open, onClose, collapsed, onCollapsedChange }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onClose?.();
    logout();
    navigate("/login", { replace: true });
  };

  const userInitials = initials(user);
  const userName = shortName(user);
  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <>
      {/* ── Mobile backdrop ──────────────────────────────────────── */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
        />
      )}

      {/* ── Sidebar panel ────────────────────────────────────────── */}
      <aside
        style={{ background: "#1a3a2a" }}
        className={[
          "fixed md:sticky top-0 left-0 h-screen flex flex-col z-30",
          "transition-all duration-300 ease-in-out",
          // Mobile: slide in/out; Desktop: collapse via width
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          // Width: collapsed = icon-only on desktop
          collapsed ? "md:w-16" : "md:w-56",
          // Mobile always full width when open
          "w-56",
        ].join(" ")}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div
          className="flex items-center h-14 shrink-0 px-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* School initial badge — always visible */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
            style={{
              background: "linear-gradient(135deg,#c9a84c,#e8cc85)",
              color: "#1a2744",
            }}
          >
            M
          </div>

          {/* School name — hidden when collapsed */}
          <div
            className={[
              "ml-2.5 flex-1 min-w-0 transition-all duration-300",
              collapsed ? "md:hidden" : "",
            ].join(" ")}
          >
            <p className="text-xs font-black text-white leading-tight truncate">
              Mukuru Outreach
            </p>
            <p
              className="text-xs truncate"
              style={{
                color: "rgba(201,168,76,0.6)",
                fontSize: "9px",
                letterSpacing: "0.5px",
              }}
            >
              Exam Management
            </p>
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => onCollapsedChange?.(!collapsed)}
            className={[
              "hidden md:flex items-center justify-center w-6 h-6 rounded-lg shrink-0 transition-colors",
              "hover:bg-white/10",
              collapsed ? "ml-0" : "ml-1",
            ].join(" ")}
            style={{ color: "rgba(201,168,76,0.7)" }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden flex items-center justify-center w-6 h-6 rounded-lg ml-1 shrink-0 hover:bg-white/10 transition-colors"
            style={{ color: "rgba(200,220,205,0.6)" }}
            aria-label="Close sidebar"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Nav sections ─────────────────────────────────────────── */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden py-3"
          style={{ scrollbarWidth: "none" }}
        >
          {navSections.map((section) => {
            const visibleItems = section.items.filter((item) =>
              item.roles.includes(role),
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.label} className="mb-1">
                {/* Section label — hidden when collapsed */}
                <div
                  className={[
                    "transition-all duration-200 overflow-hidden",
                    collapsed ? "md:h-0 md:opacity-0" : "h-auto opacity-100",
                  ].join(" ")}
                >
                  <p
                    className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
                    style={{ color: "rgba(200,220,205,0.3)", fontSize: "9px" }}
                  >
                    {section.label}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-0.5 px-2">
                  {visibleItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={onClose}
                      className="block"
                    >
                      {({ isActive }) => {
                        const item = (
                          <div
                            className={[
                              "flex items-center rounded-xl transition-all duration-150",
                              collapsed
                                ? "md:justify-center md:px-0 md:py-2.5 px-3 py-2"
                                : "px-3 py-2 gap-2.5",
                              isActive ? "bg-white/10" : "hover:bg-white/6",
                            ].join(" ")}
                            style={
                              isActive
                                ? {
                                    boxShadow: "inset 3px 0 0 #c9a84c",
                                    background: "rgba(201,168,76,0.12)",
                                  }
                                : {}
                            }
                          >
                            {/* Icon */}
                            <Icon
                              size={16}
                              className="shrink-0"
                              style={{
                                color: isActive
                                  ? "#c9a84c"
                                  : "rgba(200,225,210,0.55)",
                              }}
                            />

                            {/* Label — hidden when collapsed on desktop */}
                            <span
                              className={[
                                "text-sm truncate transition-all duration-200",
                                "font-medium",
                                isActive ? "" : "",
                                collapsed ? "md:hidden" : "",
                              ].join(" ")}
                              style={{
                                color: isActive
                                  ? "#c9a84c"
                                  : "rgba(220,240,225,0.7)",
                              }}
                            >
                              {label}
                            </span>
                          </div>
                        );

                        // Wrap with tooltip only on desktop when collapsed
                        return collapsed ? (
                          <Tooltip label={label}>{item}</Tooltip>
                        ) : (
                          item
                        );
                      }}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* ── User footer ──────────────────────────────────────────── */}
        <div
          className="shrink-0 p-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Collapsed: just avatar + logout stacked */}
          {/* Expanded: full row */}
          <div
            className={[
              "flex items-center gap-2 rounded-xl px-2 py-2",
              "hover:bg-white/6 transition-colors",
              collapsed ? "md:flex-col md:gap-1.5 md:px-0" : "",
            ].join(" ")}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: "linear-gradient(135deg,#243355,#1a2744)",
                color: "#c9a84c",
                border: "1.5px solid rgba(201,168,76,0.3)",
              }}
            >
              {userInitials}
            </div>

            {/* Name + role — hidden when collapsed */}
            <div
              className={[
                "flex-1 min-w-0 transition-all duration-200",
                collapsed ? "md:hidden" : "",
              ].join(" ")}
            >
              <p
                className="text-xs font-semibold truncate"
                style={{ color: "#e8f5e9" }}
              >
                {userName}
              </p>
              <p
                className="truncate"
                style={{ color: "rgba(200,220,205,0.45)", fontSize: "10px" }}
              >
                {roleLabel}
              </p>
            </div>

            {/* Logout — always visible */}
            {collapsed ? (
              <Tooltip label="Sign out">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-red-500/20 transition-colors"
                  style={{ color: "rgba(200,220,205,0.4)" }}
                  aria-label="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </Tooltip>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-red-500/20 transition-colors shrink-0"
                style={{ color: "rgba(200,220,205,0.4)" }}
                aria-label="Sign out"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
