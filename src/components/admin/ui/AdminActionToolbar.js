export default function AdminActionToolbar({ children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white px-2 py-2 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </section>
  );
}

