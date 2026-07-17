import { useState } from "react";
import ActionButton from "./ActionButton";

const iconPaths = {
  title: "M4 6.5h16M4 12h10M4 17.5h12",
  environment: "M12 21s7-4.35 7-10A7 7 0 1 0 5 11c0 5.65 7 10 7 10ZM9.5 11a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z",
  severity: "M12 3 2.8 19h18.4L12 3ZM12 8v5M12 16.5h.01",
  priority: "M6 19V5l12 7-12 7Z",
  preconditions: "M9 11l2 2 4-4M5 5h14v14H5V5Z",
  steps: "M7 6h10M7 12h10M7 18h10M4 6h.01M4 12h.01M4 18h.01",
  expected: "M20 7 9 18l-5-5",
  actual: "M12 9v4M12 17h.01M4.9 19h14.2L12 4 4.9 19Z",
  analysis: "M9 18h6M10 22h4M8.5 14.5a6 6 0 1 1 7 0c-.9.7-1.5 1.8-1.5 3h-4c0-1.2-.6-2.3-1.5-3Z",
  copy: "M8 8h10v12H8V8ZM6 16H4V4h10v2",
  export: "M12 3v12M8 11l4 4 4-4M5 21h14",
  refresh: "M20 12a8 8 0 1 1-2.35-5.65M20 5v5h-5",
  testCases: "M5 4h14v16H5V4ZM8 8h8M8 12h8M8 16h5",
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
      <path d={iconPaths[name] ?? iconPaths.title} />
    </svg>
  );
}

function Badge({ label, tone }) {
  const tones = {
    red: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300",
    orange: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-300",
    yellow: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-500/25 dark:bg-yellow-500/10 dark:text-yellow-200",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300",
    neutral: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  };

  if (!label) {
    return null;
  }

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone] ?? tones.neutral}`}>
      {label}
    </span>
  );
}

function severityTone(value) {
  const normalized = value.toLowerCase();

  if (normalized.includes("critical")) return "red";
  if (normalized.includes("high")) return "orange";
  if (normalized.includes("medium")) return "yellow";
  if (normalized.includes("low")) return "green";
  return "neutral";
}

function priorityTone(value) {
  const normalized = value.toLowerCase();

  if (normalized.includes("high")) return "red";
  if (normalized.includes("medium")) return "orange";
  if (normalized.includes("low")) return "green";
  return "neutral";
}

function SkeletonLine({ className = "" }) {
  return <div className={`h-3 rounded-full bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

function LoadingState({ progressMessage }) {
  return (
    <div className="space-y-3" aria-live="polite" aria-busy="true">
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-sm font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 dark:border-indigo-500/20 dark:border-t-indigo-200" />
          {progressMessage}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
            <div className="animate-pulse space-y-3">
              <SkeletonLine className="w-1/3" />
              <SkeletonLine className="w-full" />
              <SkeletonLine className="w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-base font-bold text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-300">
        QA
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-white">
          No report generated yet
        </h3>
        <p className="max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
          Add a clear issue description and generate a structured report ready for Jira or Azure DevOps.
        </p>
      </div>
    </div>
  );
}

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === "string" && value.trim().length > 0;
}

function ValueBlock({ value }) {
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-1.5">
        {value.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true">-</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return <p>{value}</p>;
}

function AccordionSection({ id, title, icon, count, open, onToggle, children }) {
  return (
    <section className="animate-fade-in rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:shadow-card dark:border-slate-800 dark:bg-slate-950/50">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition duration-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 dark:hover:bg-slate-900 dark:focus-visible:ring-indigo-500/20"
        aria-expanded={open}
        aria-controls={`${id}-content`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Icon name={icon} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              {title}
            </span>
            {typeof count === "number" ? (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{count} item{count === 1 ? "" : "s"}</span>
            ) : null}
          </span>
        </span>
        <Icon name="chevron" className={`h-4 w-4 shrink-0 text-slate-500 transition duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div id={`${id}-content`} className="animate-fade-in border-t border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="max-h-56 overflow-y-auto pr-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
            {children}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function AnalysisAccordion({ report, open, onToggle }) {
  const items = [
    { title: "Possible Root Cause", value: report?.possibleRootCause },
    { title: "Suggested Fix", value: report?.suggestedFix },
    { title: "Impacted Modules", value: report?.impactedModules },
    { title: "Suggested Regression Areas", value: report?.suggestedRegressionAreas },
    { title: "Suggested Test Cases", value: report?.suggestedTestCases },
  ].filter((item) => hasValue(item.value));

  if (!items.length) {
    return null;
  }

  return (
    <AccordionSection id="ai-analysis" title="AI Analysis" icon="analysis" count={items.length} open={open} onToggle={onToggle}>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.title} className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            <h4 className="mb-1.5 text-sm font-semibold text-slate-900 dark:text-white">
              {item.title}
            </h4>
            <ValueBlock value={item.value} />
          </div>
        ))}
      </div>
    </AccordionSection>
  );
}

export default function OutputCard({
  report,
  onCopy,
  onRegenerate,
  onExportJson,
  onExportMarkdown,
  onCopyJira,
  onCopyAzure,
  onGenerateTestCases,
  copied,
  canCopy,
  canRegenerate,
  canGenerateTestCases,
  loading,
  testCasesLoading,
  progressMessage,
}) {
  const [openSections, setOpenSections] = useState({
    preconditions: true,
    steps: true,
    expected: true,
    actual: true,
    analysis: true,
  });
  const title = report?.title || "---";
  const environment = report?.environment ?? {};
  const preconditions = Array.isArray(report?.preconditions) ? report.preconditions : ["---"];
  const steps = Array.isArray(report?.steps) ? report.steps : [];
  const expected = report?.expected || "---";
  const actual = report?.actual || "---";
  const severity = report?.severity || "Medium";
  const priority = report?.priority || "Medium";
  const hasReport = title !== "---";

  const toggleSection = (section) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  return (
<section className="w-full rounded-2xl border border-white/70 bg-white p-4 shadow-soft transition duration-300 hover:shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-5">      <header className="mb-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white shadow-sm">
              3
            </span>
            <h2 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-white">
              Your Bug Report
            </h2>
          </div>
          <p className="text-sm leading-5 text-slate-600 dark:text-slate-300">
            Structured output with reproducible steps and triage metadata.
          </p>
        </div>
      </header>
      
      
      <div className="min-h-0 flex-1">
            {loading ? (
          <LoadingState progressMessage={progressMessage} />
        ) : !hasReport ? (
        <div className="flex min-h-[420px] items-center justify-center">
          <EmptyState />
          </div>
          ) : (
          <div className="w-full space-y-3">
            <section className="animate-fade-in rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <Icon name="title" />
                </span>
                Title
              </h3>
              <p className="text-base font-semibold leading-6 text-slate-950 dark:text-white">
                {title}
              </p>
            </section>

            <section className="animate-fade-in rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <Icon name="environment" />
                </span>
                Context
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Platform</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">{environment.platform || "-"}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">OS</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">{environment.os || "-"}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60 sm:col-span-2 xl:col-span-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Browser</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">{environment.browser || "-"}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Severity</p>
                  <div className="mt-1"><Badge label={severity} tone={severityTone(severity)} /></div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Priority</p>
                  <div className="mt-1"><Badge label={priority} tone={priorityTone(priority)} /></div>
                </div>
              </div>
            </section>

            <AccordionSection
              id="preconditions"
              title="Preconditions"
              icon="preconditions"
              count={preconditions.length}
              open={openSections.preconditions}
              onToggle={() => toggleSection("preconditions")}
            >
              <ul className="space-y-1.5">
                {preconditions.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </AccordionSection>

            <AccordionSection
              id="steps"
              title="Steps to Reproduce"
              icon="steps"
              count={steps.length}
              open={openSections.steps}
              onToggle={() => toggleSection("steps")}
            >
              {steps.length ? (
                <ol className="space-y-1.5">
                  {steps.map((step, index) => (
                    <li key={`${index + 1}-${step}`} className="flex gap-2">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-300">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>---</p>
              )}
            </AccordionSection>

            <div className="grid gap-3 sm:grid-cols-2">
              <AccordionSection
                id="expected"
                title="Expected Result"
                icon="expected"
                open={openSections.expected}
                onToggle={() => toggleSection("expected")}
              >
                <p>{expected}</p>
              </AccordionSection>

              <AccordionSection
                id="actual"
                title="Actual Result"
                icon="actual"
                open={openSections.actual}
                onToggle={() => toggleSection("actual")}
              >
                <p>{actual}</p>
              </AccordionSection>
            </div>

            <AnalysisAccordion report={report} open={openSections.analysis} onToggle={() => toggleSection("analysis")} />
          </div>
        )}
      </div>

      <footer className="mt-4 w-full border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <ActionButton onClick={onCopy} disabled={!canCopy} className="w-full">
            <Icon name="copy" />
            {copied ? "Copied" : "Copy"}
          </ActionButton>
          <ActionButton onClick={onCopyJira} disabled={!canCopy} className="w-full">
            <Icon name="copy" />
            Copy for Jira
          </ActionButton>
          <ActionButton onClick={onCopyAzure} disabled={!canCopy} className="w-full">
            <Icon name="copy" />
            Copy for Azure DevOps
          </ActionButton>
          <ActionButton onClick={onExportJson} disabled={!canCopy} className="w-full">
            <Icon name="export" />
            Export JSON
          </ActionButton>
          <ActionButton onClick={onExportMarkdown} disabled={!canCopy} className="w-full">
            <Icon name="export" />
            Export Markdown
          </ActionButton>
          <ActionButton onClick={onGenerateTestCases} disabled={!canGenerateTestCases} variant="primary" className="w-full">
            {testCasesLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Icon name="testCases" />}
            {testCasesLoading ? "Generating Cases..." : "Generate Test Cases"}
          </ActionButton>
          <ActionButton onClick={onRegenerate} disabled={!canRegenerate} variant="primary" className="w-full">
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Icon name="refresh" />}
            {loading ? "Generating..." : "Regenerate"}
          </ActionButton>
        </div>
      </footer>
    </section>
  );
}
