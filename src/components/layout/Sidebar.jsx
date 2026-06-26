import { NavLink} from 'react-router-dom';
import {
  LayoutDashboard, School, Users, GraduationCap,
  BookOpen, ClipboardList, FileBarChart, Link2,
  BarChart3, X, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ── Nav structure — grouped by section ──────────────────────────────────────
const navSections = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
      { to: '/classes',   label: 'Classes',   icon: School,          roles: ['admin', 'teacher'] },
      { to: '/students',  label: 'Students',  icon: Users,           roles: ['admin', 'teacher'] },
      { to: '/teachers',  label: 'Teachers',  icon: GraduationCap,   roles: ['admin'] },
    ],
  },
  {
    label: 'Academics',
    roles: ['admin', 'teacher'],
    items: [
      { to: '/subjects',    label: 'Subjects',    icon: BookOpen,      roles: ['admin', 'teacher'] },
      { to: '/assignments', label: 'Assignments', icon: Link2,         roles: ['admin'] },
      { to: '/exams',       label: 'Exams',       icon: ClipboardList, roles: ['admin', 'teacher'] },
      { to: '/results',     label: 'Results',     icon: BarChart3,     roles: ['admin', 'teacher'] },
    ],
  },
  {
    label: 'Reports',
    items: [
      { to: '/report-card', label: 'Report Card', icon: FileBarChart, roles: ['admin', 'teacher', 'student'] },
    ],
  },
];

// Role display names for the footer
const roleLabel = { admin: 'Administrator', teacher: 'Teacher', student: 'Student' };

// Initials from email
const initials = (email = '') => {
  const parts = email.split('@')[0].split(/[._-]/);
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || '??';
};

const Sidebar = ({ open, onClose }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        />
      )}

      <aside
        style={{ background: '#1a3a2a', width: '224px' }}
        className={`
          fixed md:sticky top-0 left-0 h-screen shrink-0
          flex flex-col z-30 transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        {/* ── Header — school identity ── */}
        <div
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          className="flex items-center justify-between px-4 py-4"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* School initial badge */}
            <div
              style={{ background: '#c9a84c', color: '#1a3a2a', flexShrink: 0 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            >
              M
            </div>
            <div className="min-w-0">
              <p
                style={{ color: '#e8f5e9', fontSize: '11px', lineHeight: '1.3' }}
                className="font-semibold leading-tight truncate"
              >
                Mukuru Outreach Academy
              </p>
              <p style={{ color: 'rgba(200,220,205,0.45)', fontSize: '9px', letterSpacing: '0.3px' }}>
                Learning · Achieving · Together
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: 'rgba(200,220,205,0.5)' }}
            className="md:hidden hover:text-white transition-colors ml-2 shrink-0"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Nav sections ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(item => item.roles.includes(role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.label} className="mb-3">
                <p
                  style={{ color: 'rgba(200,220,205,0.35)', fontSize: '9px', letterSpacing: '1.2px' }}
                  className="uppercase font-semibold px-3 py-1.5"
                >
                  {section.label}
                </p>

                <div className="space-y-0.5">
                  {visibleItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={onClose}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors group"
                      style={({ isActive }) => isActive
                        ? { background: 'rgba(201,168,76,0.16)', color: '#c9a84c' }
                        : { color: 'rgba(220,240,225,0.65)' }
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={16}
                            style={{ color: isActive ? '#c9a84c' : 'rgba(200,225,210,0.45)', flexShrink: 0 }}
                          />
                          <span style={{ fontWeight: isActive ? 500 : 400 }}>{label}</span>
                          {isActive && (
                            <span
                              style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: '#c9a84c', flexShrink: 0 }}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* ── Footer — user identity + logout ── */}
        <div
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          className="px-2 py-3"
        >
          <div
            style={{ borderRadius: '10px' }}
            className="flex items-center gap-2.5 px-3 py-2 group"
          >
            {/* Avatar */}
            <div
              style={{ background: '#2d5a3e', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', flexShrink: 0 }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            >
              {initials(user?.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: '#e8f5e9', fontSize: '12px' }} className="font-medium truncate">
                {user?.email}
              </p>
              <p style={{ color: 'rgba(200,220,205,0.45)', fontSize: '10px' }}>
                {roleLabel[role] ?? role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{ color: 'rgba(200,220,205,0.4)' }}
              className="hover:text-red-400 transition-colors shrink-0"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;