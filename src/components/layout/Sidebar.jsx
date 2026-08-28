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
  Award,
  Download,
  ImageIcon,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

// ── Navigation structure ──────────────────────────────────────────────────────

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
      {
        to: "/banners",
        label: "Login Banners",
        icon: ImageIcon,
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
        label: "Term Report Card",
        icon: Award,
        roles: ["admin", "teacher", "student"],
      },
      {
        to: "/bulk-report-cards",
        label: "Bulk Download",
        icon: Download,
        roles: ["admin", "teacher"],
      },
    ],
  },
];

// ── Role display names ────────────────────────────────────────────────────────

const roleLabel = {
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
};

// ── Generate initials from email ──────────────────────────────────────────────

const initials = (email = "") => {
  const parts = email.split("@")[0].split(/[._-]/);

  return (
    parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "??"
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────

const Sidebar = ({ open, onClose }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* ── Mobile backdrop ──────────────────────────────────────────────── */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: "rgba(0,0,0,0.48)" }}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed md:sticky top-0 left-0
          h-screen w-[248px] shrink-0
          flex flex-col z-30
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        style={{
          background: "#1a3a2a",
          boxShadow: "8px 0 30px rgba(0,0,0,0.08)",
        }}
      >

        {/* ── Header / School identity ──────────────────────────────────── */}
        <div
          className="px-4 pt-5 pb-4"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3 min-w-0">

              {/* School logo */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg,#c9a84c,#e8cc85)",
                  color: "#1a3a2a",
                  boxShadow:
                    "0 5px 16px rgba(201,168,76,0.22)",
                }}
              >
                <GraduationCap
                  size={21}
                  strokeWidth={2.5}
                />
              </div>

              {/* School name */}
              <div className="min-w-0">
                <p
                  className="font-bold leading-tight truncate"
                  style={{
                    color: "#f1f8f3",
                    fontSize: "12px",
                  }}
                >
                  Mukuru Outreach Academy
                </p>

                <p
                  className="mt-1 truncate"
                  style={{
                    color: "rgba(200,220,205,0.48)",
                    fontSize: "9px",
                    letterSpacing: "0.7px",
                  }}
                >
                  EXAM MANAGEMENT SYSTEM
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="md:hidden ml-2 shrink-0 hover:text-white transition-colors"
              style={{
                color: "rgba(200,220,205,0.5)",
              }}
              aria-label="Close menu"
            >
              <X size={17} />
            </button>
          </div>

          {/* Portal indicator */}
          <div
            className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.045)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: "#c9a84c" }}
            />

            <span
              className="text-[10px] font-medium"
              style={{
                color: "rgba(225,240,228,0.58)",
              }}
            >
              Academic Administration Portal
            </span>
          </div>
        </div>

        {/* ── Navigation ─────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">

          {navSections.map((section, sectionIndex) => {
            const visibleItems = section.items.filter((item) =>
              item.roles.includes(role)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div
                key={section.label}
                className={sectionIndex > 0 ? "mt-6" : ""}
              >

                {/* Section heading */}
                <div className="flex items-center gap-2 px-3 mb-2">

                  <span
                    className="font-bold uppercase"
                    style={{
                      color: "rgba(200,220,205,0.34)",
                      fontSize: "9px",
                      letterSpacing: "1.4px",
                    }}
                  >
                    {section.label}
                  </span>

                  <div
                    className="flex-1 h-px"
                    style={{
                      background: "rgba(255,255,255,0.045)",
                    }}
                  />
                </div>

                {/* Navigation items */}
                <div className="space-y-1">

                  {visibleItems.map(
                    ({ to, label, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={onClose}
                        className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                        style={({ isActive }) =>
                          isActive
                            ? {
                                background:
                                  "linear-gradient(90deg, rgba(201,168,76,0.17), rgba(201,168,76,0.07))",
                                color: "#e8cc85",
                                boxShadow:
                                  "inset 0 0 0 1px rgba(201,168,76,0.08)",
                              }
                            : {
                                color:
                                  "rgba(220,240,225,0.64)",
                              }
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Active indicator */}
                            {isActive && (
                              <span
                                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                                style={{
                                  width: "3px",
                                  height: "22px",
                                  background: "#c9a84c",
                                  boxShadow:
                                    "0 0 8px rgba(201,168,76,0.45)",
                                }}
                              />
                            )}

                            {/* Icon container */}
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                              style={{
                                background: isActive
                                  ? "rgba(201,168,76,0.13)"
                                  : "rgba(255,255,255,0.025)",
                              }}
                            >
                              <Icon
                                size={16}
                                strokeWidth={isActive ? 2.2 : 1.8}
                                style={{
                                  color: isActive
                                    ? "#c9a84c"
                                    : "rgba(200,225,210,0.48)",
                                }}
                              />
                            </div>

                            {/* Label */}
                            <span
                              className="flex-1 truncate"
                              style={{
                                fontSize: "13px",
                                fontWeight: isActive ? 600 : 450,
                              }}
                            >
                              {label}
                            </span>

                            {/* Active arrow */}
                            {isActive && (
                              <ChevronRight
                                size={14}
                                style={{
                                  color: "#c9a84c",
                                  opacity: 0.8,
                                }}
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    )
                  )}

                </div>
              </div>
            );
          })}
        </nav>

        {/* ── User footer ────────────────────────────────────────────────── */}
        <div
          className="px-3 pt-3 pb-4"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >

          <div
            className="rounded-xl p-2.5"
            style={{
              background: "rgba(255,255,255,0.045)",
              border: "1px solid rgba(255,255,255,0.055)",
            }}
          >
            <div className="flex items-center gap-2.5">

              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                style={{
                  background:
                    "linear-gradient(135deg,#2d5a3e,#244b34)",
                  border: "1px solid rgba(201,168,76,0.38)",
                  color: "#e8cc85",
                }}
              >
                {initials(user?.email)}
              </div>

              {/* User details */}
              <div className="flex-1 min-w-0">
                <p
                  className="truncate font-semibold"
                  style={{
                    color: "#e8f5e9",
                    fontSize: "11px",
                  }}
                  title={user?.email}
                >
                  {user?.email}
                </p>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#c9a84c" }}
                  />

                  <p
                    className="truncate"
                    style={{
                      color: "rgba(200,220,205,0.48)",
                      fontSize: "9px",
                    }}
                  >
                    {roleLabel[role] ?? role}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors hover:bg-red-500/10"
                style={{
                  color: "rgba(200,220,205,0.4)",
                }}
                aria-label="Log out"
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>

          {/* Small footer label */}
          <p
            className="text-center mt-3"
            style={{
              color: "rgba(200,220,205,0.22)",
              fontSize: "8px",
              letterSpacing: "0.5px",
            }}
          >
            MUKURU OUTREACH ACADEMY
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;