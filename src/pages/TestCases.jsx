import { useState } from "react";

const testTypeOptions = [
  {
    key: "positive",
    label: "Positive",
    description: "Validate expected and successful user flows.",
  },
  {
    key: "negative",
    label: "Negative",
    description: "Validate invalid inputs and failure scenarios.",
  },
  {
    key: "edge",
    label: "Edge Cases",
    description: "Explore boundaries and uncommon conditions.",
  },
  {
    key: "regression",
    label: "Regression",
    description: "Protect existing functionality from regressions.",
  },
];

export default function TestCases() {
  const [context, setContext] = useState("");

  const [testTypes, setTestTypes] = useState({
    positive: true,
    negative: true,
    edge: true,
    regression: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleTestType = (type) => {
    setTestTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const hasSelectedType = Object.values(testTypes).some(Boolean);

  const canGenerate =
    context.trim().length >= 10 &&
    hasSelectedType &&
    !loading;

const handleGenerate = async () => {
  if (!canGenerate) return;

  setError("");
  setLoading(true);

  try {
    const response = await fetch("/api/generate-requirement-test-cases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context: context.trim(),
        testTypes,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.error || "Failed to generate test cases."
      );
    }

    console.log("Generated Test Cases:", data);
  } catch (requestError) {
    console.error("Test case generation error:", requestError);

    setError(
      requestError.message || "Failed to generate test cases."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
          Test Case Generator
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
          Generate structured, executable test cases from requirements, user
          stories, acceptance criteria, or feature descriptions.
        </p>
      </header>

      {/* Context Input */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-3">
          <label
            htmlFor="test-context"
            className="text-sm font-semibold text-slate-900 dark:text-white"
          >
            Test Context
          </label>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Provide the feature or requirement you want to design test cases
            for.
          </p>
        </div>

        <textarea
          id="test-context"
          rows={8}
          maxLength={5000}
          value={context}
          disabled={loading}
          onChange={(event) => {
            setContext(event.target.value);

            if (error) {
              setError("");
            }
          }}
          placeholder="Paste a requirement, user story, acceptance criteria, or feature description..."
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
        />

        <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:justify-between">
          <span>
            More context helps BugLens generate more relevant test coverage.
          </span>

          <span>{context.length} / 5000</span>
        </div>
      </section>

      {/* Test Types */}
      <section className="mt-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Test Case Types
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Choose the types of test cases you want BugLens to generate.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {testTypeOptions.map((type) => {
            const selected = testTypes[type.key];

            return (
              <label
                key={type.key}
                className={`
                  relative min-h-[110px] cursor-pointer rounded-xl border p-4
                  transition-all duration-200
                  ${
                    selected
                      ? "border-indigo-300 bg-indigo-50/70 ring-1 ring-indigo-200 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:ring-indigo-500/20"
                      : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={loading}
                    onChange={() => toggleTestType(type.key)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {type.label}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {type.description}
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {/* Validation */}
      {!hasSelectedType && (
        <p
          role="status"
          className="mt-4 text-sm text-amber-700 dark:text-amber-300"
        >
          Select at least one test case type.
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {/* CTA */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          AI-generated test cases should be reviewed and validated before
          execution.
        </p>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="min-h-11 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Test Cases"}
        </button>
      </div>

      {/* Temporary Loading State */}
      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50/70 dark:border-indigo-500/20 dark:bg-indigo-500/10"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 dark:border-indigo-500/30 dark:border-t-indigo-300" />

            <div>
              <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                Designing test coverage...
              </p>

              <p className="mt-0.5 text-xs text-indigo-700/70 dark:text-indigo-300/70">
                Preparing structured test cases from your context.
              </p>
            </div>
          </div>

          <div className="h-1 overflow-hidden bg-indigo-100 dark:bg-indigo-950">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-indigo-600 dark:bg-indigo-400" />
          </div>
        </div>
      )}
    </main>
  );
}