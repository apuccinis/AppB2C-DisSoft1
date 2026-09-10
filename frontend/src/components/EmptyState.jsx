export const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-600 text-2xl">
      {icon}
    </div>
    <div>
      <p className="font-semibold text-slate-200">{title}</p>
      {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
    </div>
    {action}
  </div>
);

export default EmptyState;
