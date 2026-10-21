import { Link } from 'react-router-dom';

const Sidebar = ({ teams = [] }) => {
  return (
    <aside className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Teams</h2>
        <Link to="/teams" className="text-sm text-violet-400 hover:text-violet-300">
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {teams.length === 0 ? (
          <p className="text-sm text-slate-400">No teams yet.</p>
        ) : (
          teams.map((team) => (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              className="block rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-left text-slate-200 hover:border-violet-500"
            >
              {team.name}
            </Link>
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;