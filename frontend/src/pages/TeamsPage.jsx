import { useState } from 'react';
import Alert from '../components/Alert';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import TeamCard from '../components/TeamCard';
import { useTeams } from '../hooks/useTeams';
import { teamApi } from '../services/teamApi';
import { getErrorMessage, validateTeamForm } from '../utils/validators';

const emptyForm = {
  name: '',
  description: '',
};

const fieldClass =
  'w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500';

const TeamsPage = () => {
  const { teams, loading, error: loadError, refetch } = useTeams();
  const [formData, setFormData] = useState(emptyForm);
  const [editingTeam, setEditingTeam] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingTeam(null);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateTeamForm(formData);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const payload = { name: formData.name.trim(), description: formData.description.trim() };
      if (editingTeam) {
        await teamApi.update(editingTeam.id, payload);
      } else {
        await teamApi.create(payload);
      }

      resetForm();
      await refetch();
    } catch (error) {
      setFormError(getErrorMessage(error, 'Failed to save the team.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormError('');
    setFormData({
      name: team.name,
      description: team.description || '',
    });
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await teamApi.delete(teamToDelete.id);
      if (editingTeam?.id === teamToDelete.id) resetForm();
      setTeamToDelete(null);
      await refetch();
    } catch (error) {
      setTeamToDelete(null);
      setActionError(getErrorMessage(error, 'Failed to delete the team.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <p className="text-xs text-violet-400">Teams</p>
          <h1 className="text-3xl font-bold text-white">Your teams</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-6"
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
              <div>
                <label htmlFor="team-name" className="mb-1.5 block text-sm text-slate-300">Team name</label>
                <input
                  id="team-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Design team"
                  maxLength={100}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="team-description" className="mb-1.5 block text-sm text-slate-300">
                  Description
                </label>
                <textarea
                  id="team-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What does this team work on? (optional)"
                  rows={3}
                  maxLength={500}
                  className={fieldClass}
                />
              </div>

              <Alert type="error">{formError}</Alert>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <LoadingSpinner size="xs" /> : null}
                {submitting
                  ? editingTeam ? 'Updating team...' : 'Saving team...'
                  : editingTeam ? 'Update team' : 'Save team'}
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">All teams</h2>

            <div className="mb-4">
              <Alert type="error">{loadError || actionError}</Alert>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <LoadingSpinner size="sm" />
                <span>Loading teams...</span>
              </div>
            ) : teams.length === 0 ? (
              <p className="text-slate-400">No teams yet. Create your first team to get started.</p>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    onEdit={handleEdit}
                    onDelete={(target) => {
                      setActionError('');
                      setTeamToDelete(target);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <ConfirmDialog
        isOpen={Boolean(teamToDelete)}
        title="Delete team?"
        message={
          teamToDelete
            ? `"${teamToDelete.name}" and all of its tasks will be permanently deleted.`
            : ''
        }
        isBusy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setTeamToDelete(null)}
      />
    </div>
  );
};

export default TeamsPage;
