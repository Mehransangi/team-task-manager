import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/validators';

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
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
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
        <label htmlFor="register-name" className="mb-2 block text-sm text-slate-300">Full name</label>
        <input
          id="register-name"
          type="text"
          name="name"
          autoComplete="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label htmlFor="register-email" className="mb-2 block text-sm text-slate-300">Email</label>
        <input
          id="register-email"
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="register-password" className="mb-2 block text-sm text-slate-300">Password</label>
        <input
          id="register-password"
          type="password"
          name="password"
          minLength={8}
          maxLength={72}
          required
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