const VARIANTS = {
  error: 'border-bear/30 bg-bear/10 text-rose-200',
  success: 'border-bull/30 bg-bull/10 text-emerald-200',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  info: 'border-accent/30 bg-accent/10 text-slate-200',
};

const ICONS = {
  error: '!',
  success: '✓',
  warning: '!',
  info: 'i',
};

export const Alert = ({ variant = 'info', title, children, onClose }) => (
  <div
    role={variant === 'error' ? 'alert' : 'status'}
    className={`animate-fade-in flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${VARIANTS[variant]}`}
  >
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
      {ICONS[variant]}
    </span>
    <div className="min-w-0 flex-1">
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? 'mt-0.5 text-white/70' : ''}>{children}</div>
    </div>
    {onClose ? (
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar aviso"
        className="shrink-0 rounded p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
      >
        ✕
      </button>
    ) : null}
  </div>
);

export default Alert;
