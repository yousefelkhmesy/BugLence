import Navigation from "./Navigation";

export default function Header({
  theme,
  onToggleTheme,
  activePage,
  onPageChange,
}) {
  const isDark = theme === "dark";

  return (
    <header className="rounded-3xl border border-white/60 bg-white/80 px-6 py-4 shadow-card backdrop-blur-xl transition duration-300 dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* Brand */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-brand-700 to-indigo-500 font-bold text-white shadow-card dark:from-brand-500 dark:via-brand-600 dark:to-sky-500">
            QA
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                BugLens
              </h1>

            </div>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              AI-powered workspace for software quality.            
              </p>
          </div>
        </div>

        {/* Navigation */}
        <Navigation
          activePage={activePage}
          onPageChange={onPageChange}
        />

        {/* Theme */}
        <button
        type="button"
        onClick={onToggleTheme}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-100 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? "☀" : "☾"}
</button>

      </div>
    </header>
  );
}