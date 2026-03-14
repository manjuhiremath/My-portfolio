import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

export default function AdminMetricCard({ label, value, hint, trend, icon: Icon, color = 'text-indigo-600' }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-1.5 rounded-lg bg-slate-50 ${color}`}>
          {Icon && <Icon className="h-4 w-4" />}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-[10px] font-black uppercase ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend >= 0 ? <FiArrowUp className="h-2 w-2" /> : <FiArrowDown className="h-2 w-2" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-lg font-black text-slate-900 tracking-tighter">{value}</h3>
          {hint && (
            <p className="text-[9px] font-bold text-slate-400 truncate">{hint}</p>
          )}
        </div>
      </div>
    </article>
  );
}
