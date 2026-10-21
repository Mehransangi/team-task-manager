import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div>
          <Link to="/dashboard" className="text-xl font-bold text-white">
            Team Task Manager
          </Link>
        </div>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/dashboard" className="text-slate-300 hover:text-white">
            Dashboard
          </Link>
          <Link to="/teams" className="text-slate-300 hover:text-white">
            Teams
          </Link>
          <Link to="/tasks" className="text-slate-300 hover:text-white">
            Tasks
          </Link>

          <div className="flex items-center gap-3 ml-4">
            <span className="text-slate-300">{user?.name || 'User'}</span>
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