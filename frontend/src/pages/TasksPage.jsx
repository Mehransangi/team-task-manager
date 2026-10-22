import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { taskApi } from '../services/taskApi';
import { teamApi } from '../services/teamApi';

const emptyForm = {
  team_id: '',
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
};

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, teamsRes] = await Promise.all([
        taskApi.getAll(),
        teamApi.getAll(),
      ]);

      setTasks(tasksRes.data);
      setTeams(teamsRes.data);
    } catch (error) {
      console.error('Failed to load tasks or teams', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormData(emptyForm);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      team_id: task.team_id ?? '',
      title: task.title,
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      due_date: task.due_date ? task.due_date.slice(0, 10) : '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) return;

    try {
      setDeletingTaskId(taskId);
      await taskApi.delete(taskId);
      loadData();
    } catch (error) {
      console.error('Failed to delete task', error);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        team_id: Number(formData.team_id),
        title: formData.title?.trim(),
        description: formData.description?.trim() || '',
        due_date: formData.due_date || null,
      };

      if (!payload.team_id || !payload.title) {
        window.alert('Please select a team and a task title.');
        return;
      }

      if (editingTask) {
        await taskApi.update(editingTask.id, payload);
      } else {
        await taskApi.create(payload);
      }

      closeModal();
      loadData();
    } catch (error) {
      console.error('Failed to save task', error);
      window.alert(error.response?.data?.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400">Tasks</p>
            <h1 className="text-3xl font-bold text-white">Task board</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setFormData(emptyForm);
                setIsModalOpen(true);
              }}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
            >
              + New task
            </button>

            <Link to="/dashboard" className="text-violet-400 hover:text-violet-300">
              Back to dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <LoadingSpinner size="sm" />
              <span>Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-slate-400">No tasks available.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={deletingTaskId === task.id ? null : handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        teams={teams}
        title={editingTask ? 'Edit task' : 'Create task'}
        submitLabel={editingTask ? 'Update task' : 'Save task'}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default TasksPage;