import { PRIORITY_LABELS, STATUS_LABELS, describeDue, formatDate, isOverdue } from '../utils/formatters';

const statusColors = {
  todo: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  in_progress: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
  done: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
};

const priorityColors = {
  low: 'text-slate-400',
  medium: 'text-sky-300',
  high: 'text-rose-300',
};

const TaskCard = ({ task, onEdit, onDelete, showTeam = true }) => {
  const overdue = isOverdue(task);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {showTeam && task.team_name && (
            <p className="truncate text-xs text-violet-300">{task.team_name}</p>
          )}
          <h3 className="mt-1 break-words text-lg font-semibold text-white">{task.title}</h3>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2 py-1 text-xs font-medium ${
            statusColors[task.status] || 'border-slate-600 bg-slate-800 text-slate-300'
          }`}
        >
          {STATUS_LABELS[task.status] || task.status}
        </span>
      </div>

      <p className="mt-3 whitespace-pre-line break-words text-sm text-slate-400">
        {task.description || 'No description added yet.'}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
        <span className={priorityColors[task.priority]}>
          {PRIORITY_LABELS[task.priority] || task.priority} priority
        </span>
        <span>
          Assignee:{' '}
          <span className={task.assignee_name ? 'text-slate-200' : ''}>
            {task.assignee_name || 'Unassigned'}
          </span>
        </span>
        {task.due_date && (
          <span className={overdue ? 'font-medium text-rose-300' : ''}>
            Due {formatDate(task.due_date)}
            {task.status !== 'done' && ` · ${describeDue(task.due_date)}`}
          </span>
        )}
      </div>

      {((onEdit && task.can_edit) || (onDelete && task.can_delete)) && (
        <div className="mt-5 flex items-center gap-2">
          {onEdit && task.can_edit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-200 transition hover:bg-violet-500/20"
            >
              Edit
            </button>
          )}
          {onDelete && task.can_delete && (
            <button
              type="button"
              onClick={() => onDelete(task)}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-500/20"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
