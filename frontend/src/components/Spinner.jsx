export const Spinner = ({ className = 'h-5 w-5' }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
    <path
      d="M22 12a10 10 0 0 0-10-10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export const LoadingState = ({ label = 'Cargando…', className = 'py-12' }) => (
  <div className={`flex flex-col items-center justify-center gap-3 text-slate-400 ${className}`}>
    <Spinner className="h-6 w-6 text-accent" />
    <p className="text-sm">{label}</p>
  </div>
);

export default Spinner;
