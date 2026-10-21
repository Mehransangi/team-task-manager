import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';
import { useTeams } from '../hooks/useTeams';
import { useTasks } from '../hooks/useTasks';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { teams, loading: teamsLoading } = useTeams();
  const { tasks, loading: tasksLoading } = useTasks();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (teamsLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-lg text-slate-300">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Sidebar teams={teams} />

          <section className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent tasks</h2>
              <button
                type="button"
                onClick={() => navigate('/tasks')}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
              >
                + New task
              </button>
            </div>

            <div className="space-y-4">
              {tasks.length === 0 ? (
                <p className="text-slate-400">No tasks yet.</p>
              ) : (
                tasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;