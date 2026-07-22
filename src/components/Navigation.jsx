export default function Navigation({ activePage, onPageChange }) {
  const navItem = (page, label) => {
    const active = activePage === page;

    return (
      <button
        type="button"
        onClick={() => onPageChange(page)}
        className={`
          rounded-xl px-4 py-2 text-sm font-medium
          transition-all duration-200
          ${
            active
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
          }
        `}
      >
        {label}
      </button>
    );
  };

  return (
    <nav className="flex items-center gap-1">
      {navItem("requirements", "Requirements")}
      {navItem("bugs", "Bug Analyzer")}
      {navItem("about", "About")}
    </nav>
  );
}