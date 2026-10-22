import LoadingSpinner from './LoadingSpinner';

const AuthForm = ({
  title,
  subtitle,
  onSubmit,
  loading = false,
  submitLabel,
  footer,
  children,
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-violet-500/20 bg-slate-900 p-8 shadow-2xl shadow-violet-950/40">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
            {subtitle}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white">{title}</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {children}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <LoadingSpinner size="xs" /> : null}
            {loading ? `${submitLabel}...` : submitLabel}
          </button>
        </form>

        {footer ? <div className="mt-5 text-center text-sm text-slate-400">{footer}</div> : null}
      </div>
    </div>
  );
};

export default AuthForm;