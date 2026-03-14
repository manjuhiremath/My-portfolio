"use client";

export default function ContactForm() {
  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
            Identifier
          </label>
          <input
            type="text"
            placeholder="Your Name"
            className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all dark:text-white font-medium shadow-inner"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
            Email Endpoint
          </label>
          <input
            type="email"
            placeholder="name@domain.com"
            className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all dark:text-white font-medium shadow-inner"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
          Payload
        </label>
        <textarea
          rows="5"
          placeholder="Transmission content..."
          className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl px-6 py-4 outline-none focus:border-primary transition-all dark:text-white font-medium shadow-inner resize-none"
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full py-5 text-[11px] font-black uppercase tracking-[0.4em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
      >
        Transmit Signal
      </button>
    </form>
  );
}

