export default function Header({ theme, onToggleTheme }) {
  const isDark = theme === "dark";

  return (
    <header className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 px-5 py-5 shadow-card backdrop-blur-xl transition duration-300 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900/80 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-brand-700 to-indigo-500 text-lg font-bold text-white shadow-card dark:from-brand-500 dark:via-brand-600 dark:to-sky-500">
          QA
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200">
            SaaS-ready bug reporting
          </div>
          <div className="flex items-center gap-3">
            <img
            src="/favicon.png"
            alt="Bug Icon"
            className="h-10 w-10 object-contain"
            />
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              BugLens
              </h1>
              </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            Transform raw issues into developer-ready bug reports in seconds.
            </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleTheme}
        className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 active:translate-y-0 active:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:active:bg-slate-950 dark:focus-visible:ring-slate-700 sm:self-center"
        aria-label="Toggle color theme"
      >
        <span className="text-base" aria-hidden="true">
          {isDark ? "Light" : "Dark"}
        </span>
        <span>mode</span>
      </button>
    </header>
  );
}
