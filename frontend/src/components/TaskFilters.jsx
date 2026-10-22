const fieldClass =
  'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500';

const TaskFilters = ({ filters, onChange, teams, assignees, hasActiveFilters, onClear }) => {
  const update = (name) => (event) => onChange({ ...filters, [name]: event.target.value });
  const updateTeam = (event) => onChange({ ...filters, team_id: event.target.value, assignee_id: '' });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div className="sm:col-span-2 lg:col-span-1">
        <label htmlFor="filter-search" className="sr-only">Search tasks</label>
        <input
          id="filter-search"
          type="search"
          value={filters.search}
          onChange={update('search')}
          placeholder="Search tasks..."
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="filter-team" className="sr-only">Filter by team</label>
        <select
          id="filter-team"
          value={filters.team_id}
          onChange={updateTeam}
          className={`select-with-icon ${fieldClass}`}
        >
          <option value="">All teams</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-assignee" className="sr-only">Filter by assignee</label>
        <select
          id="filter-assignee"
          value={filters.assignee_id}
          onChange={update('assignee_id')}
          className={`select-with-icon ${fieldClass}`}
        >
          <option value="">All assignees</option>
          <option value="me">Assigned to me</option>
          <option value="unassigned">Unassigned</option>
          {assignees.map((member) => (
            <option key={member.id} value={member.id}>{member.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-status" className="sr-only">Filter by status</label>
        <select
          id="filter-status"
          value={filters.status}
          onChange={update('status')}
          className={`select-with-icon ${fieldClass}`}
        >
          <option value="">Any status</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div className="flex items-center">
        <button
          type="button"
          onClick={onClear}
          disabled={!hasActiveFilters}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 transition hover:border-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
};

export default TaskFilters;
