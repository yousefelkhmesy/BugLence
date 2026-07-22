export default function Navigation({ activePage, onPageChange }) {
  const navItem = (page, label) => {
    const active = activePage === page;

    return (
      <button
        type="button"
        onClick={() => onPageChange(page)}
        className={`
          relative rounded-xl px-5 py-2.5 text-sm font-semibold
          transition-all duration-300 ease-out
          ${
            active
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 -translate-y-0.5"
              : "text-slate-600 hover:-translate-y-0.5 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
          }
        `}
      >
        {label}

        {active && (
          <span className="absolute -bottom-1 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-indigo-400" />
        )}
      </button>
    );
  };

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 p-1.5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      {navItem("requirements", "Requirement Analyzer")}
      {navItem("bugs", "Bug Analyzer")}
      {navItem("test-cases", "Test Cases")}
      {navItem("test-data", "Test Data")}
      {navItem("about", "About")}
    </nav>
  );
}