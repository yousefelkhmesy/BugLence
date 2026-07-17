export default function ActionButton({
  children,
  onClick,
  disabled = false,
  variant = "secondary",
  className = "",
  title,
}) {
  const variants = {
    primary:
      "border-transparent bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 text-white shadow-card hover:-translate-y-0.5 hover:shadow-soft active:translate-y-0 active:shadow-sm focus-visible:ring-brand-200 dark:focus-visible:ring-brand-500/30",
    secondary:
      "border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 active:translate-y-0 active:bg-slate-100 focus-visible:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:active:bg-slate-950 dark:focus-visible:ring-slate-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition duration-300 focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:shadow-sm ${variants[variant] ?? variants.secondary} ${className}`}
    >
      {children}
    </button>
  );
}
