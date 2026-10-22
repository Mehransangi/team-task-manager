import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Team Task Manager"
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Login"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-violet-400 hover:text-violet-300">
            Register
          </Link>
        </>
      }
    >
      <div>
        <label className="mb-2 block text-sm text-slate-300">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </AuthForm>
  );
};

export default LoginPage;