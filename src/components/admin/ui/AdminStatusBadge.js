export default function AdminStatusBadge({ value, variant = 'default' }) {
  const classes = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    info: 'bg-blue-100 text-blue-700',
    violet: 'bg-violet-100 text-violet-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <span className={`inline-flex h-5 items-center rounded px-1.5 text-[11px] font-medium ${classes[variant] || classes.default}`}>
      {value}
    </span>
  );
}

