import { Link } from 'react-router-dom';

const TeamCard = ({ team }) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-400">Team</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{team.name}</h3>
        </div>

        <Link
          to={`/teams/${team.id}`}
          className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-300 hover:bg-violet-500/20"
        >
          Open
        </Link>
      </div>

      <p className="mt-4 text-sm text-slate-400">
        {team.description || 'No description provided for this team.'}
      </p>
    </div>
  );
};

export default TeamCard;