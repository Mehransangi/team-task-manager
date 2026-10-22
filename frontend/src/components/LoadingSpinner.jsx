const LoadingSpinner = ({ size = 'sm', className = '', label = '' }) => {
  const sizeMap = {
    xs: 'h-3.5 w-3.5 border-[2px]',
    sm: 'h-4 w-4 border-[2px]',
    md: 'h-5 w-5 border-[2px]',
    lg: 'h-8 w-8 border-[3px]',
  };

  return (
    <span className={`inline-flex items-center justify-center gap-2 ${className}`}>
      <span
        className={`spinner ${sizeMap[size] || sizeMap.sm}`}
        aria-hidden="true"
      />
      {label ? <span className="text-sm text-slate-200">{label}</span> : null}
    </span>
  );
};

export default LoadingSpinner;
