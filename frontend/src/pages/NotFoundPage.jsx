import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-violet-400">404</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Page not found</h1>
        <p className="mt-3 text-slate-400">The page you are looking for does not exist.</p>

        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-3 font-medium text-white hover:bg-violet-500"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;