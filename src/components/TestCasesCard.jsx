import { useState } from "react";
import ActionButton from "./ActionButton";

const categories = [
  {
    key: "positive",
    title: "Positive Test Cases",
    label: "Positive",
    icon: "positive",
  },
  {
    key: "negative",
    title: "Negative Test Cases",
    label: "Negative",
    icon: "negative",
  },
  {
    key: "edge",
    title: "Edge Cases",
    label: "Edge",
    icon: "edge",
  },
  {
    key: "regression",
    title: "Regression Test Cases",
    label: "Regression",
    icon: "regression",
  },
];

const iconPaths = {
  positive: "M20 7 9 18l-5-5M4 4h16v16H4V4Z",
  negative: "M7 7l10 10M17 7 7 17M4 4h16v16H4V4Z",
  edge: "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5",
  regression: "M20 12a8 8 0 1 1-2.35-5.65M20 5v5h-5",
  copy: "M8 8h10v12H8V8ZM6 16H4V4h10v2",
  export: "M12 3v12M8 11l4 4 4-4M5 21h14",
  cases: "M5 4h14v16H5V4ZM8 8h8M8 12h8M8 16h5",
  chevron: "M8 10l4 4 4-4",
};

function Icon({ name, className = "h-4 w-4" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={iconPaths[name] ?? iconPaths.cases} />
    </svg>
  );
}

function SkeletonLine({ className = "" }) {
  return <div className={`h-4 rounded-full bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

function TestCasesSkeleton({ message }) {
  return (
    <section className="animate-fade-in rounded-2xl border border-white/70 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:p-8" aria-live="polite" aria-busy="true">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-6 dark:border-slate-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
          <Icon name="cases" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800 dark:text-white">
            AI Generated Test Cases
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {message}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <div key={category.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
            <div className="animate-pulse space-y-4">
              <SkeletonLine className="w-1/2" />
              <SkeletonLine className="w-full" />
              <SkeletonLine className="w-11/12" />
              <SkeletonLine className="w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TestCasesCard({
  testCases,
  loading,
  loadingMessage,
  error,
  onCopy,
  onExportJson,
}) {
  console.log("TEST CASES =>", testCases);
  const [open, setOpen] = useState({
    positive: true,
    negative: true,
    edge: true,
    regression: true,
  });

  if (loading) {
    return <TestCasesSkeleton message={loadingMessage} />;
  }

  if (!testCases && !error) {
    return null;
  }

  const hasTestCases = Boolean(testCases);

  return (
    <section className="animate-fade-in rounded-2xl border border-white/70 bg-white p-5 shadow-soft transition duration-300 hover:shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:p-8">
      <header className="mb-6 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                <Icon name="cases" />
              </span>
              <h2 className="text-xl font-semibold tracking-tight text-slate-800 dark:text-white">
                AI Generated Test Cases
              </h2>
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Coverage grouped for positive, negative, edge, and regression planning.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
            <ActionButton onClick={onCopy} disabled={!hasTestCases} className="w-full">
              <Icon name="copy" />
              Copy Test Cases
            </ActionButton>
            <ActionButton onClick={onExportJson} disabled={!hasTestCases} className="w-full">
              <Icon name="export" />
              Export JSON
            </ActionButton>
          </div>
        </div>
      </header>

      {error ? (
        <p className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </p>
      ) : null}

      {
      hasTestCases ? (
      <div className="columns-1 md:columns-2 gap-4">          
      {categories.map((category, index) => {
            const items = Array.isArray(testCases?.[category.key]) ? testCases[category.key] : [];
            const isOpen = open[category.key];

            return (
              <article
              key={category.key}
              className={`break-inside-avoid mb-4 animate-fade-in rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-card dark:border-slate-800 dark:bg-slate-950/50 ${index === 1 ? "animation-delay-75" : ""} ${index === 2 ? "animation-delay-150" : ""} ${index === 3 ? "animation-delay-225" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setOpen((current) => ({ ...current, [category.key]: !current[category.key] }))}
                  className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left transition duration-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 dark:hover:bg-slate-900 dark:focus-visible:ring-indigo-500/20"
                  aria-expanded={isOpen}
                  aria-controls={`${category.key}-test-cases`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                      <Icon name={category.icon} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                        {category.title}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {category.label} ({items.length})
                      </span>
                    </span>
                  </span>
                  <Icon name="chevron" className={`h-4 w-4 shrink-0 text-slate-500 transition duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen ? (
                  <div id={`${category.key}-test-cases`} className="animate-fade-in border-t border-slate-200 px-5 py-4 dark:border-slate-800">
                    {items.length ? (
                      <div className="space-y-4">
  {items.map((item, index) => (
  <div
    key={index}
    className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-indigo-600">
        TC-{index + 1}
      </span>

      <span className="text-xs text-slate-500">
        Test Case
      </span>
    </div>

      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
        {item.title}
      </h4>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        {item.description}
      </p>

      <div className="mb-3">
        <p className="font-medium mb-2">Steps:</p>

        <ol className="list-decimal pl-5 space-y-1">
          {item.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
        <span className="font-medium">
          Expected Result:
        </span>

        <p className="mt-1">
          {item.expectedResult}
        </p>
      </div>
    </div>
  ))}
</div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No test cases returned for this category.</p>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}