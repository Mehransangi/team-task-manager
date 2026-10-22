import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TeamCard from '../components/TeamCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { teamApi } from '../services/teamApi';

const emptyForm = {
  name: '',
  description: '',
};

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingTeam, setEditingTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState(null);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await teamApi.getAll();
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to load teams', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingTeam(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      if (editingTeam) {
        await teamApi.update(editingTeam.id, formData);
      } else {
        await teamApi.create(formData);
      }

      resetForm();
      loadTeams();
    } catch (error) {
      console.error('Failed to save team', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
    });
  };

  const handleDelete = async (teamId) => {
    const confirmed = window.confirm('Delete this team?');
    if (!confirmed) return;

    try {
      setDeletingTeamId(teamId);
      await teamApi.delete(teamId);
      if (editingTeam?.id === teamId) {
        resetForm();
      }
      loadTeams();
    } catch (error) {
      console.error('Failed to delete team', error);
    } finally {
      setDeletingTeamId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400">Teams</p>
            <h1 className="text-3xl font-bold text-white">Your teams</h1>
          </div>

          <Link to="/dashboard" className="text-violet-400 hover:text-violet-300">
            Back to dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingTeam ? 'Edit team' : 'Create team'}
              </h2>
              {editingTeam && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm text-violet-300 hover:text-violet-200"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Team name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
              />

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Team description"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
              />

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <LoadingSpinner size="xs" /> : null}
                {submitting ? (editingTeam ? 'Updating team...' : 'Saving team...') : editingTeam ? 'Update team' : 'Save team'}
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">All teams</h2>

            {loading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <LoadingSpinner size="sm" />
                <span>Loading teams...</span>
              </div>
            ) : teams.length === 0 ? (
              <p className="text-slate-400">No teams yet.</p>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    onEdit={handleEdit}
                    onDelete={deletingTeamId === team.id ? null : handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;