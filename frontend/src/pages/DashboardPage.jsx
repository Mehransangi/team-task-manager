import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, teamsRes, tasksRes] = await Promise.all([
          api.get('/api/auth/me'),
          api.get('/api/teams'),
          api.get('/api/tasks'),
        ]);

        setUser(userRes.data.user);
        setTeams(teamsRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      navigate('/login');
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-lg text-slate-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400">Workspace</p>
            <h1 className="text-2xl font-bold text-white">Team Task Manager</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Teams</h2>
              <Link to="/teams" className="text-sm text-violet-400 hover:text-violet-300">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {teams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-left text-slate-200 hover:border-violet-500"
                >
                  {team.name}
                </button>
              ))}
            </div>
          </aside>

          <section className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Tasks</h2>
              <Link
                to="/tasks"
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
              >
                + New task
              </Link>
            </div>

            <div className="space-y-4">
              {tasks.length === 0 ? (
                <p className="text-slate-400">No tasks yet.</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-slate-700 bg-slate-800 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-medium text-white">{task.title}</h3>
                        <p className="text-sm text-slate-400">{task.team_name || 'No team'}</p>
                      </div>

                      <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-xs text-violet-300">
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;