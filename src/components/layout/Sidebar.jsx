import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  School,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileBarChart,
  Link2,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
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
  { to: "/teachers", label: "Teachers", icon: GraduationCap, roles: ["admin"] },
  {
    to: "/students",
    label: "Students",
    icon: Users,
    roles: ["admin", "teacher"],
  },
  {
    to: "/subjects",
    label: "Subjects",
    icon: BookOpen,
    roles: ["admin", "teacher"],
  },
  { to: "/assignments", label: "Assignments", icon: Link2, roles: ["admin"] },
  {
    to: "/exams",
    label: "Exams",
    icon: ClipboardList,
    roles: ["admin", "teacher"],
  },
  {
    to: "/report-card",
    label: "Report Card",
    icon: FileBarChart,
    roles: ["student", "admin", "teacher"],
  },
  {
    to: "/results",
    label: "Results",
    icon: ClipboardList,
    roles: ["admin", "teacher"],
  },
];

const Sidebar = ({ open, onClose }) => {
  const { role } = useAuth();
  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Backdrop — mobile only, shown when drawer is open */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen w-56 shrink-0 bg-white border-r border-gray-200
          flex flex-col z-30 transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
          <span className="text-sm font-bold text-blue-900">
            MUKURU OUTREACH ACADEMY
          </span>
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
