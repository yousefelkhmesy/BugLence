import { useState } from "react";
import ActionButton from "./ActionButton";

const insightOptions = [
  ["severity", "Generate Severity Recommendation"],
  ["priority", "Generate Priority Recommendation"],
  ["rootCause", "Generate Root Cause Suggestions"],
  ["fix", "Generate Suggested Fixes"],
  ["regressionScope", "Generate Regression Scope"],
];

const iconPaths = {
  insights: "M9 18h6M10 22h4M8.5 14.5a6 6 0 1 1 7 0c-.9.7-1.5 1.8-1.5 3h-4c0-1.2-.6-2.3-1.5-3Z",
  severity: "M12 3 2.8 19h18.4L12 3ZM12 8v5M12 16.5h.01",
  priority: "M6 19V5l12 7-12 7Z",
  confidence: "M4 13a8 8 0 0 1 16 0M12 13l4-4M12 13h.01",
  reasoning: "M5 5h14v10H8l-3 3V5Z",
  rootCause: "M12 3v4M12 17v4M4.9 5.9l2.8 2.8M16.3 15.3l2.8 2.8M3 12h4M17 12h4M4.9 18.1l2.8-2.8M16.3 8.7l2.8-2.8",
  fix: "M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-3 3-3-3 3-3Z",
  regression: "M20 12a8 8 0 1 1-2.35-5.65M20 5v5h-5",
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
      <path d={iconPaths[name] ?? iconPaths.insights} />
    </svg>
  );
}

function Badge({ label, tone }) {
  const tones = {
    blocker: "border-red-300 bg-red-100 text-red-800 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-200",
    critical: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300",
    high: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-300",
    urgent: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300",
    medium: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-500/25 dark:bg-yellow-500/10 dark:text-yellow-200",
    low: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300",
  };

  if (!label) return null;

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[label.toLowerCase()] ?? tones.medium}`}>
      {label}
    </span>
  );
}

function SkeletonLine({ className = "" }) {
  return <div className={`h-3 rounded-full bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

function LoadingState({ message }) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-sm font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200" aria-live="polite" aria-busy="true">
      <div className="mb-3 flex items-center gap-3">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 dark:border-indigo-500/20 dark:border-t-indigo-200" />
        {message}
      </div>
      <div className="animate-pulse space-y-2">
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-5/6" />
        <SkeletonLine className="w-3/4" />
      </div>
    </div>
  );
}

function AccordionList({ id, title, icon, items }) {
  const [open, setOpen] = useState(true);

  if (!items.length) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition duration-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 dark:hover:bg-slate-900 dark:focus-visible:ring-indigo-500/20"
        aria-expanded={open}
        aria-controls={`${id}-content`}
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Icon name={icon} />
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{title}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{items.length} item{items.length === 1 ? "" : "s"}</span>
          </span>
        </span>
        <Icon name="chevron" className={`h-4 w-4 text-slate-500 transition duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div id={`${id}-content`} className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
          <ul className="max-h-44 space-y-1.5 overflow-y-auto pr-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
            {items.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true">-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export default function AiInsightsCard({
  insights,
  enabledInsights,
  onEnabledInsightsChange,
  onGenerate,
  loading,
  loadingMessage,
  error,
  canGenerate,
}) {
  const hasInsights = Boolean(insights);
  const selectedCount = Object.values(enabledInsights).filter(Boolean).length;

  return (
    <section className="animate-fade-in rounded-2xl border border-white/70 bg-white p-4 shadow-soft transition duration-300 hover:shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <header className="mb-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                <Icon name="insights" />
              </span>
              <h2 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-white">AI Insights</h2>
            </div>
            <p className="text-sm leading-5 text-slate-600 dark:text-slate-300">
              AI Recommendation + Human Validation. Use these suggestions for triage, not final decisions.
            </p>
          </div>
          <ActionButton onClick={onGenerate} disabled={!canGenerate || loading || selectedCount === 0} variant="primary" className="w-full lg:w-auto">
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Icon name="insights" />}
            {loading ? "Generating..." : "Generate AI Insights"}
          </ActionButton>
        </div>
      </header>

      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {insightOptions.map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200">
              <input
                type="checkbox"
                checked={enabledInsights[key]}
                onChange={(event) => onEnabledInsightsChange(key, event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        {loading ? <LoadingState message={loadingMessage} /> : null}

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </p>
        ) : null}

        {hasInsights ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              {insights.suggestedSeverity ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"><Icon name="severity" /> Severity</p>
                  <Badge label={insights.suggestedSeverity} />
                </div>
              ) : null}
              {insights.suggestedPriority ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"><Icon name="priority" /> Priority</p>
                  <Badge label={insights.suggestedPriority} />
                </div>
              ) : null}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"><Icon name="confidence" /> Confidence</p>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">{insights.confidence}%</p>
              </div>
            </div>

            {insights.reasoning ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"><Icon name="reasoning" /> Reasoning</h3>
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{insights.reasoning}</p>
              </div>
            ) : null}

            <div className="grid gap-3 lg:grid-cols-3">
              <AccordionList id="ai-root-cause" title="Suggested Root Causes" icon="rootCause" items={insights.suggestedRootCause ?? []} />
              <AccordionList id="ai-fix" title="Suggested Fixes" icon="fix" items={insights.suggestedFix ?? []} />
              <AccordionList id="ai-regression" title="Regression Scope" icon="regression" items={insights.regressionScope ?? []} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}