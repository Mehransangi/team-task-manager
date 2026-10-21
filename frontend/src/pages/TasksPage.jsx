import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const TasksPage = () => {
  const [teams, setTeams] = useState([])
  const [tasks, setTasks] = useState([])
  const [formData, setFormData] = useState({
    team_id: '',
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
  })

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teamsRes, tasksRes] = await Promise.all([
        api.get('/api/teams'),
        api.get('/api/tasks')
      ])

      setTeams(teamsRes.data)
      setTasks(tasksRes.data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefualt()
    try {
      await api.post('/api/tasks', formData)
      setFormData({
        team_id: '',
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
      })
      loadData()
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400">Tasks</p>
            <h1 className="text-3xl font-bold text-white">Create task</h1>
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
            <div className="space-y-4">
              <select
                name="team_id"
                value={formData.team_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
              >
                <option value="">Select team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Task title"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
              />

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Task description"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
              />

              <div className="grid grid-cols-2 gap-4">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                >
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-violet-600 px-4 py-3 font-medium text-white hover:bg-violet-500"
              >
                Save task
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Task list</h2>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-slate-700 bg-slate-800 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white">{task.title}</h3>
                    <span className="text-xs text-violet-300">{task.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{task.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TasksPage