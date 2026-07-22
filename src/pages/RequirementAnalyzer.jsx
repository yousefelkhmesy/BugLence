import { useEffect, useState } from "react";

const apiUrl = "/api/analyze-requirement";

const analysisOptionsConfig = [
  ["ambiguities", "Identify ambiguities"],
  ["missingInfo", "Identify missing information"],
  ["risks", "Identify risks"],
  ["testScenarios", "Suggest test scenarios"],
  ["edgeCases", "Suggest edge cases"],
];

const resultSections = [
  ["ambiguities", "Ambiguities"],
  ["missingInfo", "Missing Information"],
  ["risks", "Risks"],
  ["testScenarios", "Suggested Test Scenarios"],
  ["edgeCases", "Edge Cases"],
];

const progressMessages = [
  "Analyzing requirement...",
  "Checking for ambiguities and missing information...",
  "Identifying potential risks...",
  "Preparing QA suggestions...",
  "Finalizing analysis...",
];

export default function RequirementAnalyzer() {
  const [requirement, setRequirement] = useState("");

  const [analysisOptions, setAnalysisOptions] = useState({
    ambiguities: false,
    missingInfo: false,
    risks: false,
    testScenarios: false,
    edgeCases: false,
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [openSections, setOpenSections] = useState({});
  const [copiedSection, setCopiedSection] = useState("");
  const [progressIndex, setProgressIndex] = useState(0);

  useEffect(() => {
    if (!loading) {
      setProgressIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setProgressIndex((current) =>
        current < progressMessages.length - 1 ? current + 1 : current
      );
    }, 1800);

    return () => window.clearInterval(interval);
  }, [loading]);

  const toggleOption = (option) => {
    setAnalysisOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const hasSelectedOption = Object.values(analysisOptions).some(Boolean);

  const canAnalyze =
    requirement.trim().length >= 10 &&
    hasSelectedOption &&
    !loading;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;

    setLoading(true);
    setProgressIndex(0);
    setError("");
    setResults(null);
    setOpenSections({});
    setCopiedSection("");

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requirement: requirement.trim(),
          analysisOptions,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "Requirement analysis failed."
        );
      }

      if (!data) {
        throw new Error("The server returned an invalid response.");
      }

      setResults(data);

      const firstSection = resultSections.find(
        ([key]) => Array.isArray(data[key]) && data[key].length > 0
      );

      if (firstSection) {
        setOpenSections({
          [firstSection[0]]: true,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Requirement analysis failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopySection = async (key, title, items) => {
    const text = [
      title,
      "",
      ...items.map((item, index) => `${index + 1}. ${item}`),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);

      setCopiedSection(key);

      window.setTimeout(() => {
        setCopiedSection("");
      }, 1500);
    } catch {
      setError("Unable to copy results to the clipboard.");
    }
  };

  const visibleResultSections = results
    ? resultSections.filter(
        ([key]) => Array.isArray(results[key]) && results[key].length > 0
      )
    : [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <header className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
          Requirement Analyzer
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
          Analyze requirements, identify gaps and risks, and prepare them for
          testing.
        </p>
      </header>

      {/* Requirement Input */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-3">
          <label
            htmlFor="requirement-input"
            className="text-sm font-semibold text-slate-900 dark:text-white"
          >
            Requirement Input
          </label>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Paste a requirement, user story, acceptance criteria, or feature
            description.
          </p>
        </div>

        <textarea
          id="requirement-input"
          rows={8}
          maxLength={4000}
          value={requirement}
          disabled={loading}
          onChange={(event) => {
            setRequirement(event.target.value);

            if (error) {
              setError("");
            }
          }}
          placeholder="Paste a requirement, user story, acceptance criteria, or feature description..."
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
        />

        <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:justify-between">
          <span>
            Provide at least 10 characters and enough context for meaningful
            analysis.
          </span>

          <span>{requirement.length} / 4000</span>
        </div>
      </section>

      {/* Analysis Options */}
      <section className="mt-5">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Analysis Options
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Choose what you want BugLens to analyze.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {analysisOptionsConfig.map(([key, label]) => (
            <label
              key={key}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/5"
            >
              <input
                type="checkbox"
                checked={analysisOptions[key]}
                onChange={() => toggleOption(key)}
                disabled={loading}
                className="h-4 w-4 accent-indigo-600"
              />

              {label}
            </label>
          ))}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {/* Primary Action */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          AI-generated suggestions require human validation.
        </p>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="min-h-11 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Requirement"}
        </button>
      </div>

      {/* Processing Status */}
      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50/70 dark:border-indigo-500/20 dark:bg-indigo-500/10"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 dark:border-indigo-500/30 dark:border-t-indigo-300" />

            <div className="min-w-0">
              <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                {progressMessages[progressIndex]}
              </p>

              <p className="mt-0.5 text-xs text-indigo-700/70 dark:text-indigo-300/70">
                This may take a few seconds.
              </p>
            </div>
          </div>

          <div className="h-1 overflow-hidden bg-indigo-100 dark:bg-indigo-950">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-indigo-600 dark:bg-indigo-400" />
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <section className="mt-8" aria-live="polite">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Analysis Results
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              AI-generated suggestions — review and validate before using.
            </p>
          </div>

          {visibleResultSections.length > 0 ? (
            <div className="space-y-3">
              {visibleResultSections.map(([key, title]) => {
                const items = results[key];
                const isOpen = Boolean(openSections[key]);

                return (
                  <div
                    key={key}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex min-h-14 items-center gap-3 px-4 sm:px-5">
                      <button
                        type="button"
                        onClick={() => toggleSection(key)}
                        aria-expanded={isOpen}
                        className="flex min-w-0 flex-1 items-center gap-3 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                      >
                        <span
                          aria-hidden="true"
                          className={`text-sm text-slate-400 transition-transform duration-200 ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        >
                          ›
                        </span>

                        <span className="truncate text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                          {title}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {items.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopySection(key, title, items)
                        }
                        className="min-h-9 rounded-lg px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
                      >
                        {copiedSection === key ? "Copied" : "Copy"}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
                        <ul className="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {items.map((item, index) => (
                            <li
                              key={`${key}-${index}`}
                              className="flex items-start gap-3"
                            >
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              No meaningful findings were identified for the selected analysis
              options.
            </div>
          )}
        </section>
      )}
    </main>
  );
}