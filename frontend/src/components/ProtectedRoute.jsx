import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-lg text-slate-300">Loading...</p>
      </div>
    );
  }

  if(!user) { return <Navigate to={'/login'} replace />}

  return children
}

export default ProtectedRoute