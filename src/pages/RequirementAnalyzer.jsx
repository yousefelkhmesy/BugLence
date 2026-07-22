import { useState } from "react";

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

  const toggleOption = (option) => {
    setAnalysisOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
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
    setError("");
    setResults(null);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Requirement analysis failed.");
      }

      setResults(data);
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
          onChange={(event) => {
            setRequirement(event.target.value);

            if (error) {
              setError("");
            }
          }}
          placeholder="Paste a requirement, user story, acceptance criteria, or feature description..."
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
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

      {/* Analysis Results */}
      {results && (
        <section className="mt-8" aria-live="polite">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Analysis Results
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              AI-generated suggestions — review and validate before using.
            </p>
          </div>

          <div className="space-y-4">
            {resultSections.map(([key, title]) =>
              results[key]?.length ? (
                <div
                  key={key}
                  className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {title}
                  </h3>

                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {results[key].map((item, index) => (
                      <li key={`${key}-${index}`} className="flex gap-2">
                        <span aria-hidden="true">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}
          </div>
        </section>
      )}
    </main>
  );
}