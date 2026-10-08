import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu, ChevronDown, LogOut, KeyRound,
  GraduationCap, Shield, UserCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ChangePasswordModal } from "../ui/ChangePasswordModal";

// ── Route label map — covers all existing + new routes ───────────────────────
const ROUTE_LABELS = {
  "/dashboard":        "Dashboard",
  "/classes":          "Classes",
  "/teachers":         "Teachers",
  "/students":         "Students",
  "/subjects":         "Subjects",
  "/assignments":      "Assignments",
  "/exams":            "Exams",
  "/results":          "Results",
  "/report-card":      "Report Card",
  "/term-report-card": "Term Report Card",
  "/bulk-report-cards":"Bulk Download",
  "/banners":          "Login Banners",
  "/exam-fees":        "Exam Fees",
  "/timetable":        "Timetable",
  "/performance":      "Class Performance",
};

// Derive a readable page label from the current pathname
const getPageLabel = (pathname) => {
  // Exact match first
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];

  // Segment match — handles /classes/:id/timetable, /exam-fees/:id etc.
  const segments = pathname.split("/").filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    const key = `/${segments[i]}`;
    if (ROUTE_LABELS[key]) return ROUTE_LABELS[key];
  }

  // Fallback: capitalise the last meaningful path segment
  const last = segments[segments.length - 1];
  if (last && !/^\d+$/.test(last)) {
    return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return "Dashboard";
};

// ── Designation config — matches the teachers.designation values ──────────────
const DESIGNATION_CONFIG = {
  superadmin: {
    label: "Super Admin",
    bg:    "#f5f3ff",
    color: "#7c3aed",
  },
  headteacher: {
    label: "Head Teacher",
    bg:    "#fef3c7",
    color: "#b45309",
  },
  deputy_headteacher: {
    label: "Deputy HT",
    bg:    "#e0f2fe",
    color: "#0369a1",
  },
  admin: {
    label: "Administrator",
    bg:    "#fce7f3",
    color: "#9d174d",
  },
  teacher: {
    label: "Teacher",
    bg:    "#f0fdf4",
    color: "#15803d",
  },
  student: {
    label: "Student",
    bg:    "#eff6ff",
    color: "#1d4ed8",
  },
};

// Resolve which badge to show — designation wins over generic role
const resolveBadge = (user) => {
  const key = user?.designation || user?.role || "user";
  return (
    DESIGNATION_CONFIG[key] || {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      bg:    "#f1f5f9",
      color: "#475569",
    }
  );
};

// Initials from email or display_name
const initials = (user) => {
  if (user?.display_name) {
    const parts = user.display_name.trim().split(/\s+/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
  }
  const local = user?.email?.split("@")[0] ?? "";
  const parts = local.split(/[._-]/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "??";
};

// Short display name — first name or email local part
const shortName = (user) => {
  if (user?.display_name) return user.display_name.split(" ")[0];
  return user?.email?.split("@")[0] ?? "";
};

// ── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = ({ onMenuClick }) => {
  const { user, logout }     = useAuth();
  const navigate             = useNavigate();
  const location             = useLocation();

  const [dropdownLocationKey, setDropdownLocationKey] = useState(null);
  const [changePasswordOpen,  setChangePasswordOpen]  = useState(false);

  const dropdownRef = useRef(null);
  const pageLabel   = getPageLabel(location.pathname);
  const badge       = resolveBadge(user);
  const avatarInit  = initials(user);
  const name        = shortName(user);
  const dropdownOpen = dropdownLocationKey === location.key;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownLocationKey(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setDropdownLocationKey(null);
    logout();
    navigate("/login", { replace: true });
  };

  const handleChangePassword = () => {
    setDropdownLocationKey(null);
    setChangePasswordOpen(true);
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-gray-200 sticky top-0 z-10 flex items-center justify-between px-4 sm:px-5">

        {/* ── Left: hamburger (mobile) + breadcrumb ──────────────── */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>

          {/* Breadcrumb — hidden on very small screens */}
          <div className="hidden sm:flex items-center gap-1.5 min-w-0">
            <span className="text-xs text-gray-400 shrink-0">MOA</span>
            <span className="text-gray-300 text-xs shrink-0">/</span>
            <span className="text-sm font-semibold text-gray-900 truncate">
              {pageLabel}
            </span>
          </div>

          {/* Mobile: just the page name */}
          <span className="sm:hidden text-sm font-semibold text-gray-900 truncate">
            {pageLabel}
          </span>
        </div>

        {/* ── Right: user chip ────────────────────────────────────── */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownLocationKey(dropdownOpen ? null : location.key)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-colors"
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            {/* Avatar circle */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "#1a2744", color: "#c9a84c" }}
            >
              {avatarInit}
            </div>

            {/* Name — hidden on small screens */}
            <span className="hidden sm:inline text-sm font-semibold text-gray-800 max-w-[120px] truncate">
              {name}
            </span>

            {/* Role / designation badge */}
            <span
              className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: badge.bg, color: badge.color }}
            >
              {badge.label}
            </span>

            <ChevronDown
              size={13}
              className={`text-gray-400 transition-transform duration-150 shrink-0 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* ── Dropdown ──────────────────────────────────────────── */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50">

              {/* User info header */}
              <div
                className="px-4 py-3 border-b border-gray-100"
                style={{ background: "linear-gradient(135deg, #f8fafc, #fff)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: "#1a2744", color: "#c9a84c" }}
                  >
                    {avatarInit}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user?.display_name || name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Badge inside dropdown */}
                <div className="mt-2.5">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {/* Icon per role */}
                    {user?.role === "admin" || user?.designation === "superadmin" || user?.designation === "headteacher"
                      ? <Shield size={11} />
                      : user?.role === "teacher"
                      ? <GraduationCap size={11} />
                      : <UserCircle size={11} />
                    }
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="py-1.5">
                <button
                  onClick={handleChangePassword}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <KeyRound size={14} className="text-gray-400 shrink-0" />
                  Change password
                </button>
              </div>

              {/* Divider + logout */}
              <div className="border-t border-gray-100 py-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut size={14} className="shrink-0" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Change password modal — wired to existing endpoint */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </>
  );
};

export default Navbar;