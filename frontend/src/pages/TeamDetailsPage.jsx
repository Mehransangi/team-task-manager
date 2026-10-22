import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { teamApi } from '../services/teamApi';
import { taskApi } from '../services/taskApi';

const emptyTaskForm = {
  team_id: '',
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
};

const TeamDetailsPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberMessage, setMemberMessage] = useState('');
  const [memberError, setMemberError] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState(emptyTaskForm);
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const isOwner = team?.role === 'owner';

  const loadTeam = async () => {
    try {
      const [teamRes, tasksRes] = await Promise.all([
        teamApi.getById(teamId),
        taskApi.getAll(),
      ]);

      const loadedTeam = teamRes.data;
      setTeam(loadedTeam);
      setMembers(Array.isArray(loadedTeam.members) ? loadedTeam.members : []);

      const teamTasks = tasksRes.data.filter(
        (task) => String(task.team_id) === String(teamId)
      );

      setTasks(teamTasks);
    } catch (error) {
      console.error('Failed to load team details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, [teamId]);

  const addMember = async (e) => {
    e.preventDefault();

    const email = memberEmail.trim();

    if (!email) {
      setMemberError('Please enter a member email.');
      return;
    }

    if (!isOwner) {
      setMemberError('Only the team owner can add members.');
      return;
    }

    try {
      setMemberError('');
      setMemberMessage('');
      setIsAddingMember(true);
      const response = await teamApi.addMember(teamId, { email });
      setMemberEmail('');
      setMemberMessage(response.data?.message || 'Member added successfully.');
      if (!response.data?.pending) {
        await loadTeam();
      }
    } catch (error) {
      setMemberError(error.response?.data?.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const deleteTeam = async () => {
    const confirmed = window.confirm('Delete this team permanently?');
    if (!confirmed) return;

    try {
      await teamApi.delete(teamId);
      navigate('/teams');
    } catch (error) {
      window.alert(error.response?.data?.message || 'Failed to delete team');
    }
  };

  const openTaskModal = (task = null) => {
    setEditingTask(task);
    setTaskFormData({
      team_id: String(task?.team_id ?? teamId),
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'todo',
      priority: task?.priority || 'medium',
      due_date: task?.due_date ? task.due_date.slice(0, 10) : '',
    });
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setTaskFormData(emptyTaskForm);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsTaskSubmitting(true);
      const payload = {
        ...taskFormData,
        team_id: Number(taskFormData.team_id),
        title: taskFormData.title.trim(),
        description: taskFormData.description.trim(),
        due_date: taskFormData.due_date || null,
      };

      if (!payload.team_id || !payload.title) {
        window.alert('Please select a team and enter a task title.');
        return;
      }

      if (editingTask) {
        await taskApi.update(editingTask.id, payload);
      } else {
        await taskApi.create(payload);
      }

      closeTaskModal();
      await loadTeam();
    } catch (error) {
      console.error('Failed to save task', error);
      window.alert(error.response?.data?.message || 'Failed to save task');
    } finally {
      setIsTaskSubmitting(false);
    }
  };

  const handleTaskDelete = async (taskId) => {
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) return;

    try {
      setDeletingTaskId(taskId);
      await taskApi.delete(taskId);
      await loadTeam();
    } catch (error) {
      console.error('Failed to delete task', error);
      window.alert(error.response?.data?.message || 'Failed to delete task');
    } finally {
      setDeletingTaskId(null);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400">Team</p>
            <h1 className="text-3xl font-bold text-white">{team?.name || 'Team detail'}</h1>
          </div>

          <div className="flex items-center gap-3">
            {isOwner && (
              <button
                type="button"
                onClick={deleteTeam}
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-xl font-semibold text-white">Overview</h2>
            <p className="text-slate-300">
              {team?.description || 'No description provided for this team.'}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-xl font-semibold text-white">Members</h2>

            <div className="space-y-3">
              {isOwner && (
                <form onSubmit={addMember} className="space-y-3">
                  <div className="flex gap-2">
                    <input
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
                  </div>
                </form>
              )}

              {!isOwner && (
                <p className="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-400">
                  Only the team owner can add or manage members.
                </p>
              )}

              <div className="space-y-2">
                {members.length === 0 ? (
                  <p className="text-sm text-slate-400">No members yet.</p>
                ) : (
                  members.map((member) => (
                    <div
                      key={`${member.id}-${member.email}`}
                      className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.email}</p>
                      </div>
                      <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-wide text-violet-300">
                        {member.role || 'member'}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {memberError && (
                <p className="text-sm text-red-300">{memberError}</p>
              )}
              {memberMessage && (
                <p className="text-sm text-emerald-300">{memberMessage}</p>
              )}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Tasks in this team</h2>
            <button
              type="button"
              onClick={() => openTaskModal()}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
            >
              + New task
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="text-slate-400">No tasks in this team yet.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => openTaskModal(task)}
                  onDelete={deletingTaskId === task.id ? null : handleTaskDelete}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        onSubmit={handleTaskSubmit}
        formData={taskFormData}
        setFormData={setTaskFormData}
        teams={[{ id: Number(teamId), name: team?.name || 'Current team' }]}
        title={editingTask ? 'Edit task' : 'Create task'}
        submitLabel={editingTask ? 'Update task' : 'Save task'}
        isSubmitting={isTaskSubmitting}
      />
    </div>
  );
};

export default TeamDetailsPage;