import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const TeamsPage = () => {
  const [teams, setTeams] = useState([])
  const [formData, setFormData] = useState({ name: '', description: ''})

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      const response = await api.get('/api/teams')
      setTeams(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/teams', formData)
      setFormData({ name: '', description: '' })
      loadTeams()
    } catch (error) {
      console.log(error)
    }
  }
  
  return (
   <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400">Teams</p>
            <h1 className="text-3xl font-bold text-white">Manage teams</h1>
          </div>

          <Link to="/dashboard" className="text-violet-400 hover:text-violet-300">
            Back to dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Create team</h2>

            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Team name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
              />

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
              />

              <button
                type="submit"
                className="rounded-xl bg-violet-600 px-4 py-3 font-medium text-white hover:bg-violet-500"
              >
                Save team
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Your teams</h2>

            <div className="space-y-3">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="rounded-xl border border-slate-700 bg-slate-800 p-4"
                >
                  <h3 className="font-semibold text-white">{team.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{team.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamsPage