import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useTeams } from '../hooks/useTeams';
import { useTasks } from '../hooks/useTasks';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { teams, loading: teamsLoading } = useTeams();
  const { tasks, loading: tasksLoading } = useTasks();
  const [filter, setFilter] = useState('all');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [tasks, filter]);

  const dueSoonTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter((task) => {
      if (!task.due_date || task.status === 'done') return false;
      const dueDate = new Date(task.due_date);
      const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      return daysLeft >= 0 && daysLeft <= 7;
    });
  }, [tasks]);

  const summary = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((task) => task.status === 'todo').length,
    inProgress: tasks.filter((task) => task.status === 'in_progress').length,
    done: tasks.filter((task) => task.status === 'done').length,
  }), [tasks]);

  if (teamsLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-slate-200">
          <LoadingSpinner size="md" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {dueSoonTasks.length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Due soon</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {dueSoonTasks.map((task) => (
                <span key={task.id} className="rounded-full border border-amber-400/40 bg-slate-900/60 px-3 py-1 text-xs text-amber-100">
                  {task.title} · {new Date(task.due_date).toLocaleDateString()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Total</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-sky-300">Todo</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.todo}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-yellow-300">Active</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.inProgress}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Done</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.done}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <Sidebar teams={teams} />

          <section className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-white">Recent tasks</h2>
              <div className="flex items-center gap-2">
                {['all', 'todo', 'in_progress', 'done'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                      filter === option
                        ? 'bg-violet-600 text-white'
                        : 'border border-slate-700 bg-slate-800 text-slate-300 hover:border-violet-500'
                    }`}
                  >
                    {option === 'in_progress' ? 'in progress' : option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <p className="text-slate-400">No tasks yet.</p>
              ) : (
                filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;