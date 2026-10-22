import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
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
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Register"
      subtitle="Create account"
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Create account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-violet-400 hover:text-violet-300">
            Login
          </Link>
        </>
      }
    >
      <div>
        <label className="mb-2 block text-sm text-slate-300">Full name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
          placeholder="John Doe"
        />
      </div>

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
          autoComplete="new-password"
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

export default RegisterPage;