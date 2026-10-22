const styles = {
  error: 'border-red-500/30 bg-red-500/10 text-red-200',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
};

const Alert = ({ type = 'error', children, onDismiss }) => {
  if (!children) return null;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${styles[type]}`}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-lg leading-none opacity-70 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
