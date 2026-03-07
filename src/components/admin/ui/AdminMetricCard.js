export default function AdminMetricCard({ label, value, hint, tone = 'slate' }) {
  const toneClass = {
    slate: 'text-slate-600',
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    violet: 'text-violet-600',
    amber: 'text-amber-600',
  }[tone];

  return (
    <article className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold leading-tight text-slate-900">{value}</p>
      {hint ? <p className={`mt-0.5 text-[11px] ${toneClass || 'text-slate-500'}`}>{hint}</p> : null}
    </article>
  );
}

