import Link from 'next/link';

export default function AdminPageHeader({ title, description, actions = [] }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="truncate text-[17px] font-semibold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => {
          const baseClass =
            action.variant === 'primary'
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : action.variant === 'ghost'
              ? 'bg-transparent text-slate-700 hover:bg-slate-100'
              : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50';

          const className = `inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${baseClass}`;

          if (action.href) {
            return (
              <Link key={action.label} href={action.href} className={className}>
                {action.icon}
                <span>{action.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={className}
              disabled={action.disabled}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}

