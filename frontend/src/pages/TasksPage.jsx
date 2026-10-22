import { useMemo, useState } from 'react';
import Alert from '../components/Alert';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';
import TaskModal from '../components/TaskModal';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useTaskEditor } from '../hooks/useTaskEditor';
import { useTasks } from '../hooks/useTasks';
import { useTeams } from '../hooks/useTeams';

const emptyFilters = { search: '', team_id: '', assignee_id: '', status: '' };

const TasksPage = () => {
  const [filters, setFilters] = useState(emptyFilters);
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const { teams, error: teamsError } = useTeams();

  const queryParams = useMemo(
    () =>
      Object.fromEntries(
        Object.entries({ ...filters, search: debouncedSearch }).filter(([, value]) => value !== '')
      ),
    [filters, debouncedSearch]
  );
  const { tasks, loading, error, refetch } = useTasks(queryParams);

  const editor = useTaskEditor({ defaultTeamId: filters.team_id, onChanged: refetch });

  const assignees = useMemo(() => {
    const scoped = filters.team_id
      ? teams.filter((team) => String(team.id) === String(filters.team_id))
      : teams;
    const unique = new Map();
    scoped.forEach((team) => team.members?.forEach((member) => unique.set(member.id, member)));
    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [teams, filters.team_id]);

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-violet-400">Tasks</p>
            <h1 className="text-3xl font-bold text-white">Task board</h1>
          </div>

          <button
            type="button"
            onClick={editor.openCreate}
            disabled={teams.length === 0}
            title={teams.length === 0 ? 'Create a team first' : undefined}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + New task
          </button>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
          <TaskFilters
            filters={filters}
            onChange={setFilters}
            teams={teams}
            assignees={assignees}
            hasActiveFilters={hasActiveFilters}
            onClear={() => setFilters(emptyFilters)}
          />

          <Alert type="error">{error || teamsError || editor.actionError}</Alert>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <LoadingSpinner size="sm" />
              <span>Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-slate-400">
              {hasActiveFilters ? 'No tasks match these filters.' : 'No tasks yet. Create one to get started.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={editor.openEdit} onDelete={editor.requestDelete} />
              ))}
            </div>
          )}
        </div>
      </main>

      <TaskModal {...editor.modalProps} teams={teams} />
      <ConfirmDialog {...editor.confirmProps} />
    </div>
  );
};

export default TasksPage;
