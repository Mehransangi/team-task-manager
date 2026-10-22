import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 transition ${
    isActive ? 'bg-violet-500/15 text-white' : 'text-slate-300 hover:text-white'
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        <Link to="/dashboard" className="text-xl font-bold text-white">
          Team Task Manager
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
          <NavLink to="/teams" className={navLinkClass}>Teams</NavLink>
          <NavLink to="/tasks" className={navLinkClass}>Tasks</NavLink>

          <div className="ml-2 flex items-center gap-3">
            <span className="hidden text-slate-300 sm:inline">{user?.name || 'User'}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
