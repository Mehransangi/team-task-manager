import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { useTaskEditor } from '../hooks/useTaskEditor';
import { useTasks } from '../hooks/useTasks';
import { teamApi } from '../services/teamApi';
import { getErrorMessage } from '../utils/validators';

const TeamDetailsPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [memberEmail, setMemberEmail] = useState('');
  const [memberMessage, setMemberMessage] = useState('');
  const [memberError, setMemberError] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  const [confirmingTeamDelete, setConfirmingTeamDelete] = useState(false);
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);
  const [teamDeleteError, setTeamDeleteError] = useState('');

  const isOwner = team?.role === 'owner';

  const loadTeam = useCallback(async () => {
    try {
      const response = await teamApi.getById(teamId);
      setTeam(response.data);
      setLoadError('');
    } catch (error) {
      setTeam(null);
      setLoadError(getErrorMessage(error, 'Failed to load the team.'));
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const taskFilters = useMemo(() => ({ team_id: teamId }), [teamId]);
  const { tasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useTasks(taskFilters);
  const editor = useTaskEditor({ defaultTeamId: teamId, onChanged: refetchTasks });

  const addMember = async (e) => {
    e.preventDefault();

    const email = memberEmail.trim();
    if (!email) {
      setMemberError('Please enter a member email.');
      return;
    }

    try {
      setMemberError('');
      setMemberMessage('');
      setIsAddingMember(true);

      const response = await teamApi.addMember(teamId, { email });
      setMemberEmail('');
      setMemberMessage(response.data?.message || 'Member added.');

      if (!response.data?.pending) {
        await loadTeam();
      }
    } catch (error) {
      setMemberError(getErrorMessage(error, 'Failed to add the member.'));
    } finally {
      setIsAddingMember(false);
    }
  };

  const deleteTeam = async () => {
    try {
      setIsDeletingTeam(true);
      await teamApi.delete(teamId);
      navigate('/teams', { replace: true });
    } catch (error) {
      setConfirmingTeamDelete(false);
      setTeamDeleteError(getErrorMessage(error, 'Failed to delete the team.'));
      setIsDeletingTeam(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-slate-200">
          <LoadingSpinner size="md" />
          <span>Loading team...</span>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <main className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6">
          <Alert type="error">{loadError || 'Team not found.'}</Alert>
          <Link to="/teams" className="text-violet-400 hover:text-violet-300">
            ← Back to teams
          </Link>
        </main>
      </div>
    );
  }

  const members = team.members ?? [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-violet-400">Team</p>
            <h1 className="break-words text-3xl font-bold text-white">{team.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            {isOwner && (
              <button
                type="button"
                onClick={() => {
                  setTeamDeleteError('');
                  setConfirmingTeamDelete(true);
                }}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 hover:bg-red-500/20"
              >
                Delete team
              </button>
            )}
            <Link to="/teams" className="text-violet-400 hover:text-violet-300">
              Back
            </Link>
          </div>
        </div>

        <div className="mb-4">
          <Alert type="error">{teamDeleteError}</Alert>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-xl font-semibold text-white">Overview</h2>
            <p className="whitespace-pre-line break-words text-slate-300">
              {team.description || 'No description provided for this team.'}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-xl font-semibold text-white">Members ({members.length})</h2>

            <div className="space-y-3">
              {isOwner ? (
                <form onSubmit={addMember} noValidate className="flex flex-col gap-2 sm:flex-row">
                  <label htmlFor="member-email" className="sr-only">Member email</label>
                  <input
                    id="member-email"
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="Add member by email"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
                  />
                  <button
                    type="submit"
                    disabled={isAddingMember}
                    className="rounded-lg border border-violet-600 bg-violet-500/10 px-4 py-2 text-sm text-violet-300 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAddingMember ? 'Adding...' : 'Add'}
                  </button>
                </form>
              ) : (
                <p className="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-400">
                  Only the team owner can add members.
                </p>
              )}

              <Alert type="error">{memberError}</Alert>
              <Alert type="success">{memberMessage}</Alert>

              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{member.name}</p>
                      <p className="truncate text-xs text-slate-400">{member.email}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[10px] text-violet-300">
                      {member.role || 'member'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Tasks in this team</h2>
            <button
              type="button"
              onClick={editor.openCreate}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
            >
              + New task
            </button>
          </div>

          <div className="mb-4">
            <Alert type="error">{tasksError || editor.actionError}</Alert>
          </div>

          {tasksLoading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <LoadingSpinner size="sm" />
              <span>Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-slate-400">No tasks in this team yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  showTeam={false}
                  onEdit={editor.openEdit}
                  onDelete={editor.requestDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <TaskModal {...editor.modalProps} teams={[team]} />
      <ConfirmDialog {...editor.confirmProps} />
      <ConfirmDialog
        isOpen={confirmingTeamDelete}
        title="Delete team?"
        message={`"${team.name}" and all of its tasks will be permanently deleted.`}
        isBusy={isDeletingTeam}
        onConfirm={deleteTeam}
        onCancel={() => setConfirmingTeamDelete(false)}
      />
    </div>
  );
};

export default TeamDetailsPage;
