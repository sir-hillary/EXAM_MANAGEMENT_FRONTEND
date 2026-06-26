import { ChevronDown, Menu, Bell, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Map routes to readable breadcrumb labels
const routeLabels = {
  "/dashboard": "Dashboard",
  "/classes": "Classes",
  "/teachers": "Teachers",
  "/students": "Students",
  "/subjects": "Subjects",
  "/assignments": "Assignments",
  "/exams": "Exams",
  "/results": "Results",
  "/report-card": "Report Card",
};

const roleBadgeStyle = {
  admin: { background: "#1a3a2a", color: "#c9a84c" },
  teacher: { background: "#1e3a5f", color: "#7eb3e8" },
  student: { background: "#1a3a28", color: "#5cc98a" },
};

const initials = (email = "") => {
  const parts = email.split("@")[0].split(/[._-]/);
  return (
    parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "??"
  );
};

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const pathKey = "/" + location.pathname.split("/")[1];
  const pageLabel = routeLabels[pathKey] ?? "Page";

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-5 sticky top-0 z-10">
      {/* Left — hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb — hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500">
          <span className="text-gray-400 text-xs">Assessment manager</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">{pageLabel}</span>
        </div>

        {/* Mobile: just show the page name */}
        <span className="sm:hidden text-sm font-medium text-gray-900">
          {pageLabel}
        </span>
      </div>

      {/* Right — search hint, notification bell, user chip */}
      <div className="flex items-center gap-2">
        {/* Search hint — hidden on mobile */}
        <button
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-400 hover:border-gray-300 hover:bg-gray-100 transition-colors"
          style={{ minWidth: "160px" }}
          aria-label="Quick search"
        >
          <Search size={13} />
          <span>Quick search...</span>
          <kbd
            className="ml-auto text-gray-300 bg-white border border-gray-200 rounded px-1 py-0.5 text-xs"
            style={{ fontSize: "10px" }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Notification bell */}
        <button
          className="relative w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={16} />
          {/* Gold dot — remove when notifications are implemented */}
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: "#c9a84c" }}
          />
        </button>

        {/* User chip + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
            aria-label="User menu"
            aria-expanded={menuOpen}
          >
            {/* Avatar */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "#1a3a2a", color: "#c9a84c" }}
            >
              {initials(user?.email)}
            </div>

            {/* Email — hidden on small screens */}
            <span className="hidden md:inline text-sm text-gray-700 font-medium max-w-[140px] truncate">
              {user?.email?.split("@")[0]}
            </span>

            {/* Role badge */}
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded-md"
              style={
                roleBadgeStyle[user?.role] ?? {
                  background: "#f1f5f9",
                  color: "#475569",
                }
              }
            >
              {user?.role}
            </span>

            <ChevronDown
              size={13}
              className={`text-gray-400 transition-transform duration-150 ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 overflow-hidden">
              {/* User info header */}
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                  {user?.role}
                </p>
              </div>

              {/* Actions */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                    navigate("/login", { replace: true });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
