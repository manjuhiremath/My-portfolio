import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

export default function AdminMetricCard({ label, value, hint, trend,  }) {

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend >= 0 ? <FiArrowUp className="h-3 w-3" /> : <FiArrowDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className='flex justify-between'>
        <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
        <div className="flex items-top gap-2">
          <h3 className="text-md font-bold text-slate-900 tracking-tight">{value}</h3>
          {hint && (
            <p className="mt-1 text-[10px] font-medium text-slate-400 uppercase tracking-wider">{hint}</p>
          )}
        </div>
      </div>
    </article>
  );
}

