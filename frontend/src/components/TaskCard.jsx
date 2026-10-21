const TaskCard = ({ task }) => {
  const statusColors = {
    todo: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    in_progress: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
    done: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Task</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{task.title}</h3>
        </div>

        <span
          className={`rounded-full border px-2 py-1 text-xs font-medium ${statusColors[task.status] || 'border-slate-600 bg-slate-800 text-slate-300'}`}
        >
          {task.status}
        </span>
      </div>

      <p className="mt-4 text-sm text-slate-400">
        {task.description || 'No description added yet.'}
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
        {task.priority && <span>Priority: {task.priority}</span>}
        {task.due_date && <span>Due: {task.due_date}</span>}
      </div>
    </div>
  );
};

export default TaskCard;