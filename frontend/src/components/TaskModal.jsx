import { useEffect } from 'react';
import Alert from './Alert';
import LoadingSpinner from './LoadingSpinner';

const fieldClass =
  'w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500 disabled:opacity-60';
const labelClass = 'mb-1.5 block text-sm text-slate-300';

const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  teams,
  isEditing = false,
  isSubmitting = false,
  error = '',
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedTeam = teams.find((team) => String(team.id) === String(formData.team_id));
  const members = selectedTeam?.members ?? [];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'team_id' ? { assignee_id: '' } : {}),
    }));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 px-4 py-6 sm:items-center"
    >
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id="task-modal-title" className="text-xl font-semibold text-white">
            {isEditing ? 'Edit task' : 'Create task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close task form"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="task-team" className={labelClass}>Team</label>
            <select
              id="task-team"
              name="team_id"
              value={formData.team_id}
              onChange={handleChange}
              disabled={isEditing}
              className={`select-with-icon ${fieldClass}`}
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-title" className={labelClass}>Title</label>
            <input
              id="task-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              maxLength={200}
              autoFocus
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="task-description" className={labelClass}>Description</label>
            <textarea
              id="task-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add more detail (optional)"
              rows={3}
              maxLength={2000}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="task-assignee" className={labelClass}>Assignee</label>
            <select
              id="task-assignee"
              name="assignee_id"
              value={formData.assignee_id}
              onChange={handleChange}
              disabled={!selectedTeam}
              className={`select-with-icon ${fieldClass}`}
            >
              <option value="">{selectedTeam ? 'Unassigned' : 'Select a team first'}</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="task-status" className={labelClass}>Status</label>
              <select
                id="task-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`select-with-icon ${fieldClass}`}
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className={labelClass}>Priority</label>
              <select
                id="task-priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={`select-with-icon ${fieldClass}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-due" className={labelClass}>Due date</label>
              <input
                id="task-due"
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className={`${fieldClass} [color-scheme:dark]`}
              />
            </div>
          </div>

          <Alert type="error">{error}</Alert>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition hover:border-slate-600"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <LoadingSpinner size="xs" />
                  Saving...
                </span>
              ) : isEditing ? (
                'Update task'
              ) : (
                'Save task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
