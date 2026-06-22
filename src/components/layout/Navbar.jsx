import { LogOut, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const roleBadgeColor = {
  admin: "bg-purple-100 text-purple-700",
  teacher: "bg-blue-100 text-blue-700",
  student: "bg-green-100 text-green-700",
};

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between md:justify-end px-4 md:px-5 sticky top-0 z-10">
      <button
        onClick={onMenuClick}
        className="md:hidden text-gray-500 hover:text-gray-700"
      >
        <Menu size={20} />
      </button>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
        >
          <span className="hidden sm:inline">{user?.email}</span>
          <span
            className={`badge ${roleBadgeColor[user?.role] || "bg-gray-100 text-gray-700"}`}
          >
            {user?.role}
          </span>
          <ChevronDown size={14} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-md py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <LogOut size={14} />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
