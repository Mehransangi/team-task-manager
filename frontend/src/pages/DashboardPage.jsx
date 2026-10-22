import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import { useTasks } from '../hooks/useTasks';
import { useTeams } from '../hooks/useTeams';
import { describeDue, formatDate, daysUntil } from '../utils/formatters';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

const RECENT_TASK_LIMIT = 10;

const DashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { teams, loading: teamsLoading, error: teamsError } = useTeams();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const [filter, setFilter] = useState('all');
  const [remindersDismissed, setRemindersDismissed] = useState(false);
  const [reminders] = useState(() => location.state?.reminders ?? []);

  useEffect(() => {
    if (location.state?.reminders) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const filteredTasks = useMemo(() => {
    const list = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter);
    return list.slice(0, RECENT_TASK_LIMIT);
  }, [tasks, filter]);

  const dueSoonTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (task.status === 'done') return false;
        const days = daysUntil(task.due_date);
        return days !== null && days >= 0 && days <= 7;
      }),
    [tasks]
  );

  const summary = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((task) => task.status === 'todo').length,
      inProgress: tasks.filter((task) => task.status === 'in_progress').length,
      done: tasks.filter((task) => task.status === 'done').length,
    }),
    [tasks]
  );

  if (teamsLoading || tasksLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-slate-200">
          <LoadingSpinner size="md" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 space-y-3">
          <Alert type="error">{teamsError || tasksError}</Alert>

          {reminders.length > 0 && !remindersDismissed && (
            <Alert type="warning" onDismiss={() => setRemindersDismissed(true)}>
              <p className="font-semibold">
                {reminders.length === 1
                  ? '1 task assigned to you needs attention'
                  : `${reminders.length} tasks assigned to you need attention`}
              </p>
              <ul className="mt-2 space-y-1">
                {reminders.map((task) => (
                  <li key={task.id}>
                    {task.title}
                    <span className="text-amber-200/80">
                      {' '}
                      · {describeDue(task.due_date)} ({formatDate(task.due_date)})
                    </span>
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {dueSoonTasks.length > 0 && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
              <p className="text-sm font-semibold text-amber-300">Due in the next 7 days</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {dueSoonTasks.map((task) => (
                  <span
                    key={task.id}
                    className="rounded-full border border-amber-400/40 bg-slate-900/60 px-3 py-1 text-xs text-amber-100"
                  >
                    {task.title} · {formatDate(task.due_date)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400">Total</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-sky-300">To do</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.todo}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-yellow-300">In progress</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.inProgress}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-emerald-300">Done</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.done}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <Sidebar teams={teams} />

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-3">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-white">Recent tasks</h2>
              <div className="flex flex-wrap items-center gap-2">
                {STATUS_FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilter(option.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      filter === option.value
                        ? 'bg-violet-600 text-white'
                        : 'border border-slate-700 bg-slate-800 text-slate-300 hover:border-violet-500'
                    }`}
                  >
                    {option.label}
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

            <div className="mt-6 text-right">
              <Link to="/tasks" className="text-sm text-violet-400 hover:text-violet-300">
                Search and manage all tasks →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
