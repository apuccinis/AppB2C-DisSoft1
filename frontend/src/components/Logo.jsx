export const Logo = ({ compact = false }) => (
  <div className="flex items-center gap-2.5">
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-violet-500 text-lg font-bold text-white shadow-lg">
      ₡
    </span>
    <div className="leading-tight">
      <p className="text-base font-bold tracking-tight text-white">CryptoFX</p>
      {!compact ? (
        <p className="text-[11px] uppercase tracking-wider text-slate-500">Trading prototype</p>
      ) : null}
    </div>
  </div>
);

export default Logo;
