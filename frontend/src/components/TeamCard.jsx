import { Link } from 'react-router-dom';

const TeamCard = ({ team, onEdit, onDelete }) => {
  const canManage = team?.user_role === 'owner' || team?.role === 'owner';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-400">Team</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{team.name}</h3>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/teams/${team.id}`}
            className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-300 transition hover:bg-violet-500/20"
          >
            Open
          </Link>
          {canManage && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(team)}
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:border-violet-500"
            >
              Edit
            </button>
          )}
          {canManage && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(team.id)}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/20"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-400">
        {team.description || 'No description provided for this team.'}
      </p>
    </div>
  );
};

export default TeamCard;