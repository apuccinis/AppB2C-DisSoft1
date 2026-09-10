import Logo from './Logo.jsx';

// Marco compartido por /login y /register.
export const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-900 px-4 py-10">
    {/* Fondo decorativo */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 right-0 h-[320px] w-[420px] rounded-full bg-violet-600/10 blur-[120px]"
    />

    <div className="relative w-full max-w-md">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>

      <div className="card p-6 sm:p-8">
        <header className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-white">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </header>

        {children}
      </div>

      {footer ? <p className="mt-6 text-center text-sm text-slate-400">{footer}</p> : null}
    </div>
  </div>
);

export default AuthLayout;
