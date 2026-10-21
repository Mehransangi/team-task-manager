import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

const TeamDetailsPage = () => {
  const { teamId } = useParams()
  const [team, setTeam] = useState(null)
  const [members, setMembers] = useState([])
  const [task, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=> {
    const loadTeam =async () => { 
      try {
        const [teamRes, tasksRes] = await Promise.all([
          api.get(`/api/teams/${teamId}`),
          api.get(`/api/tasks?team_id=${teamId}`),
        ])

        setTeam(teamRes.data)
        setTasks(tasksRes.data)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
     }
     loadTeam()
  },[teamId])

  const addMember = async () => {
    try {
      const memberEmail = prompt('Enter member email to add: ')

      if(!memberEmail) return

      await api.post(`/api/teams/${teamId}/members`, {
        email: memberEmail
      })

      alert('Member added')
    } catch (error) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  }

   if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-lg text-slate-300">Loading team...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400">Team</p>
            <h1 className="text-3xl font-bold text-white">{team?.name || 'Team details'}</h1>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={addMember}
              className="rounded-lg border border-violet-600 bg-violet-600/10 px-4 py-2 text-sm font-medium text-violet-300 hover:bg-violet-600/20"
            >
              + Add member
            </button>

            <Link to="/dashboard" className="text-violet-400 hover:text-violet-300">
              Back
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>

            <p className="text-slate-300">
              {team?.description || 'No description provided.'}
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-slate-800 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Created by</p>
                <p className="mt-2 text-white">{team?.created_by || 'Unknown'}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Members</h2>

            <div className="space-y-3">
              {members.length === 0 ? (
                <p className="text-slate-400">No members yet.</p>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                    <p className="font-medium text-white">{member.name}</p>
                    <p className="text-sm text-slate-400">{member.email}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Tasks in this team</h2>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-slate-400">No tasks in this team yet.</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">{task.title}</h3>
                    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-xs text-violet-300">
                      {task.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">{task.description}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default TeamDetailsPage