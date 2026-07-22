import { useRef, useState } from "react";

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

const emptyTestCase = {
  feature: "",
  title: "",
  description: "",
  type: "Positive",
  severity: "Medium",
  priority: "Medium",
  status: "",
  preconditions: [],
  steps: [],
  expectedResult: "",
};

export default function TestCases() {
  const [context, setContext] = useState("");

  const [testTypes, setTestTypes] = useState({
    positive: true,
    negative: true,
    edge: true,
    regression: false,
  });

  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const workspaceRef = useRef(null);

  const toggleTestType = (type) => {
    setTestTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const hasSelectedType =
    Object.values(testTypes).some(Boolean);

  const canGenerate =
    context.trim().length >= 10 &&
    hasSelectedType &&
    !loading;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/generate-requirement-test-cases",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            context: context.trim(),
            testTypes,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to generate test cases."
        );
      }

      const generated = Array.isArray(data?.testCases)
        ? data.testCases
        : [];

      setTestCases(generated);

      window.setTimeout(() => {
        workspaceRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.message ||
          "Failed to generate test cases."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateTestCase = (id, field, value) => {
    setTestCases((prev) =>
      prev.map((testCase) =>
        testCase.id === id
          ? { ...testCase, [field]: value }
          : testCase
      )
    );
  };

  const deleteTestCase = (id) => {
    setTestCases((prev) =>
      prev.filter((testCase) => testCase.id !== id)
    );
  };

  const addTestCase = () => {
    setTestCases((prev) => {
      const highestId = prev.reduce((max, testCase) => {
        const number = Number(
          String(testCase.id || "").replace("TC-", "")
        );

        return Number.isFinite(number)
          ? Math.max(max, number)
          : max;
      }, 0);

      return [
        ...prev,
        {
          ...emptyTestCase,
          id: `TC-${String(highestId + 1).padStart(
            3,
            "0"
          )}`,
          preconditions: [],
          steps: [],
        },
      ];
    });
  };

  const handleListChange = (id, field, value) => {
    updateTestCase(
      id,
      field,
      value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
    );
  };

  const copyTestCase = async (testCase) => {
    const text = [
      `ID: ${testCase.id}`,
      `Feature: ${testCase.feature || ""}`,
      `Title: ${testCase.title || ""}`,
      `Description: ${testCase.description || ""}`,
      `Type: ${testCase.type || ""}`,
      `Severity: ${testCase.severity || ""}`,
      `Priority: ${testCase.priority || ""}`,
      `Status: ${testCase.status || ""}`,
      "",
      "Preconditions:",
      ...(testCase.preconditions || []).map(
        (item) => `- ${item}`
      ),
      "",
      "Steps:",
      ...(testCase.steps || []).map(
        (step, index) => `${index + 1}. ${step}`
      ),
      "",
      `Expected Result: ${
        testCase.expectedResult || ""
      }`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError("Unable to copy the test case.");
    }
  };

  const escapeCsv = (value) => {
    const text = String(value ?? "").replace(/"/g, '""');
    return `"${text}"`;
  };

  const exportCsv = () => {
    if (!testCases.length) return;

    const headers = [
      "ID",
      "Feature",
      "Title",
      "Description",
      "Type",
      "Severity",
      "Priority",
      "Status",
      "Preconditions",
      "Steps",
      "Expected Result",
    ];

    const rows = testCases.map((testCase) => [
      testCase.id,
      testCase.feature,
      testCase.title,
      testCase.description,
      testCase.type,
      testCase.severity,
      testCase.priority,
      testCase.status,
      (testCase.preconditions || []).join("\n"),
      (testCase.steps || [])
        .map(
          (step, index) =>
            `${index + 1}. ${step}`
        )
        .join("\n"),
      testCase.expectedResult,
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) =>
        row.map(escapeCsv).join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "buglens-test-cases.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      <header className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
          Test Case Generator
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
          Generate structured, executable test cases from
          requirements, user stories, acceptance criteria,
          or feature descriptions.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">

        <label
          htmlFor="test-context"
          className="text-sm font-semibold text-slate-900 dark:text-white"
        >
          Test Context
        </label>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Provide the feature or requirement you want to
          design test cases for.
        </p>

        <textarea
          id="test-context"
          rows={8}
          maxLength={5000}
          value={context}
          disabled={loading}
          onChange={(event) => {
            setContext(event.target.value);

            if (error) setError("");
          }}
          placeholder="Paste a requirement, user story, acceptance criteria, or feature description..."
          className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />

        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>
            More context helps BugLens generate better coverage.
          </span>

          <span>{context.length} / 5000</span>
        </div>
      </section>

      <section className="mt-6">

        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Test Case Types
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choose the test coverage you want BugLens to generate.
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {testTypeOptions.map((type) => {
            const selected = testTypes[type.key];

            return (
              <label
                key={type.key}
                className={`min-h-[110px] cursor-pointer rounded-xl border p-4 transition ${
                  selected
                    ? "border-indigo-300 bg-indigo-50/70 ring-1 ring-indigo-200 dark:border-indigo-500/50 dark:bg-indigo-500/10"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <div className="flex items-start gap-3">

                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={loading}
                    onChange={() =>
                      toggleTestType(type.key)
                    }
                    className="mt-0.5 h-4 w-4 accent-indigo-600"
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

      {!hasSelectedType && (
        <p className="mt-4 text-sm text-amber-700">
          Select at least one test case type.
        </p>
      )}

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">

        <p className="text-xs text-slate-500">
          AI-generated test cases should be reviewed and
          validated before execution.
        </p>

        <div className="flex gap-2">

          {testCases.length > 0 && (
            <button
              type="button"
              onClick={scrollToWorkspace}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              View Test Cases ↓
            </button>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Generating..."
              : "Generate Test Cases"}
          </button>

        </div>
      </div>

      {loading && (
        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">
          <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
            Designing test coverage...
          </p>

          <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
            BugLens is analyzing the requirement and preparing executable test cases.
          </p>

          <div className="mt-3 h-1 overflow-hidden rounded bg-indigo-100">
            <div className="h-full w-1/3 animate-pulse bg-indigo-600" />
          </div>
        </div>
      )}

      {testCases.length > 0 && (
        <section
          ref={workspaceRef}
          className="mt-10 scroll-mt-24"
        >

          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">

            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                Test Case Workspace
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review, edit, execute and export your test cases.
              </p>
            </div>

            <div className="flex gap-2">

              <button
                onClick={addTestCase}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700 dark:text-white"
              >
                + Add Test Case
              </button>

              <button
                onClick={exportCsv}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
              >
                Export CSV
              </button>

            </div>
          </div>

          <p className="mb-4 text-xs text-slate-500">
            {testCases.length} test cases
          </p>

          <div className="space-y-5">

            {testCases.map((testCase) => (

              <article
                key={testCase.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >

                <div className="flex justify-between gap-4">

                  <span className="text-xs font-semibold text-indigo-600">
                    {testCase.id}
                  </span>

                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        copyTestCase(testCase)
                      }
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:text-white"
                    >
                      Copy
                    </button>

                    <button
                      onClick={() =>
                        deleteTestCase(testCase.id)
                      }
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
                    >
                      Delete
                    </button>

                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">

                  <Field
                    label="Feature"
                    value={testCase.feature}
                    onChange={(value) =>
                      updateTestCase(
                        testCase.id,
                        "feature",
                        value
                      )
                    }
                  />

                  <Field
                    label="Title"
                    value={testCase.title}
                    onChange={(value) =>
                      updateTestCase(
                        testCase.id,
                        "title",
                        value
                      )
                    }
                  />

                </div>

                <div className="mt-4">

                  <TextArea
                    label="Description"
                    value={testCase.description}
                    onChange={(value) =>
                      updateTestCase(
                        testCase.id,
                        "description",
                        value
                      )
                    }
                  />

                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <SelectField
                    label="Type"
                    value={testCase.type}
                    options={[
                      "Positive",
                      "Negative",
                      "Edge Case",
                      "Regression",
                    ]}
                    onChange={(value) =>
                      updateTestCase(
                        testCase.id,
                        "type",
                        value
                      )
                    }
                  />

                  <SelectField
                    label="Severity"
                    value={testCase.severity}
                    options={[
                      "Low",
                      "Medium",
                      "High",
                      "Critical",
                    ]}
                    onChange={(value) =>
                      updateTestCase(
                        testCase.id,
                        "severity",
                        value
                      )
                    }
                  />

                  <SelectField
                    label="Priority"
                    value={testCase.priority}
                    options={[
                      "Low",
                      "Medium",
                      "High",
                      "Critical",
                    ]}
                    onChange={(value) =>
                      updateTestCase(
                        testCase.id,
                        "priority",
                        value
                      )
                    }
                  />

                  <SelectField
                    label="Status"
                    value={testCase.status || ""}
                    options={[
                      "",
                      "Not Run",
                      "Passed",
                      "Failed",
                      "Blocked",
                    ]}
                    onChange={(value) =>
                      updateTestCase(
                        testCase.id,
                        "status",
                        value
                      )
                    }
                  />

                </div>

                <div className="mt-4">

                  <TextArea
                    label="Preconditions"
                    value={(testCase.preconditions || []).join(
                      "\n"
                    )}
                    onChange={(value) =>
                      handleListChange(
                        testCase.id,
                        "preconditions",
                        value
                      )
                    }
                    rows={3}
                  />

                </div>

                <div className="mt-4">

                  <TextArea
                    label="Test Steps"
                    value={(testCase.steps || []).join("\n")}
                    onChange={(value) =>
                      handleListChange(
                        testCase.id,
                        "steps",
                        value
                      )
                    }
                    rows={5}
                  />

                </div>

                <div className="mt-4">

                  <TextArea
                    label="Expected Result"
                    value={testCase.expectedResult}
                    onChange={(value) =>
                      updateTestCase(
                        testCase.id,
                        "expectedResult",
                        value
                      )
                    }
                    rows={3}
                  />

                </div>

              </article>

            ))}

          </div>

        </section>
      )}

      {testCases.length > 0 && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-lg font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-700"
        >
          ↑
        </button>
      )}

    </main>
  );
}

function Field({
  label,
  value = "",
  onChange,
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500">
        {label}
      </label>

      <input
        value={value || ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
    </div>
  );
}

function TextArea({
  label,
  value = "",
  onChange,
  rows = 3,
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500">
        {label}
      </label>

      <textarea
        rows={rows}
        value={value || ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
    </div>
  );
}

function SelectField({
  label,
  value = "",
  options,
  onChange,
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500">
        {label}
      </label>

      <select
        value={value || ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      >
        {options.map((option) => (
          <option
            key={option || "empty"}
            value={option}
          >
            {option || "Select status"}
          </option>
        ))}
      </select>
    </div>
  );
}