import { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import EnvironmentSelector from "./components/EnvironmentSelector";
import OutputCard from "./components/OutputCard";
import TestCasesCard from "./components/TestCasesCard";
import AiInsightsCard from "./components/AiInsightsCard";
import { detectBrowser } from "./utils/browser";
import { useTheme } from "./hooks/useTheme";

const apiUrl = "/api/generate-bug";
const testCaseApiUrl = "/api/generate-test-cases";
const aiInsightsApiUrl = "/api/ai-insights";

const maxDescriptionLength = 500;

const initialForm = {
  description: "",
  platform: "Web",
  os: "Windows",
  browser: "",
};

const emptyReport = {
  title: "---",
  environment: {
    platform: "-",
    browser: "-",
    os: "-",
  },
  preconditions: ["---"],
  steps: [],
  expected: "---",
  actual: "---",
  severity: "",
  priority: "",
};

const tips = [
  "Include the exact user action",
  "Mention expected and actual results",
  "Add error text or affected screen when available",
];

const progressMessages = [
  "Analyzing issue...",
  "Generating report...",
  "Classifying severity...",
  "Building final report...",
];
const testCaseProgressMessages = [
  "Analyzing bug report...",
  "Designing test coverage...",
  "Building positive scenarios...",
  "Building negative scenarios...",
  "Building regression scope...",
];

const testCaseCategories = [
  ["positive", "Positive Test Cases"],
  ["negative", "Negative Test Cases"],
  ["edge", "Edge Cases"],
  ["regression", "Regression Test Cases"],
];
const initialEnabledInsights = {
  severity: true,
  priority: true,
  rootCause: true,
  fix: true,
  regressionScope: true,
};

const aiInsightsProgressMessages = [
  "Analyzing triage context...",
  "Evaluating severity and priority...",
  "Reviewing possible causes...",
  "Preparing regression scope...",
];

function normalizeString(value, fallback = "---") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeStringArray(value, fallback = ["---"]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length ? items : fallback;
}

function optionalValue(data, keys) {
  for (const key of keys) {
    const value = data?.[key];

    if (Array.isArray(value)) {
      const items = value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);

      if (items.length) return items;
    }

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function normalizeReport(data, form) {
  return {
    title: normalizeString(data?.title),
    environment: {
      platform: form.platform,
      browser: form.platform === "Web" ? normalizeString(form.browser, "Unknown browser") : "N/A",
      os: form.os,
    },
    preconditions: normalizeStringArray(data?.preconditions),
    steps: normalizeStringArray(data?.steps, []),
    expected: normalizeString(data?.expected),
    actual: normalizeString(data?.actual),
    severity: normalizeString(data?.severity, "Medium"),
    priority: normalizeString(data?.priority, "Medium"),
    possibleRootCause: optionalValue(data, ["possibleRootCause", "possible_root_cause", "rootCause", "root_cause"]),
    suggestedFix: optionalValue(data, ["suggestedFix", "suggested_fix"]),
    impactedModules: optionalValue(data, ["impactedModules", "impacted_modules"]),
    suggestedRegressionAreas: optionalValue(data, ["suggestedRegressionAreas", "suggested_regression_areas", "regressionAreas", "regression_areas"]),
    suggestedTestCases: optionalValue(data, ["suggestedTestCases", "suggested_test_cases", "testCases", "test_cases"]),
  };
}

function getValidationErrors(form) {
  const errors = {};
  const descriptionLength = form.description.trim().length;

  if (!descriptionLength) {
    errors.description = "Bug description is required.";
  } else if (descriptionLength < 10) {
    errors.description = "Enter at least 10 characters.";
  }

  if (!form.platform.trim()) {
    errors.platform = "Platform is required.";
  }

  if (!form.os.trim()) {
    errors.os = "Operating system is required.";
  }

  if (form.platform === "Web" && !form.browser.trim()) {
    errors.browser = "Browser is required for web issues.";
  }

  return errors;
}

function reportAnalysisLines(report) {
  const sections = [
    ["Possible Root Cause", report.possibleRootCause],
    ["Suggested Fix", report.suggestedFix],
    ["Impacted Modules", report.impactedModules],
    ["Suggested Regression Areas", report.suggestedRegressionAreas],
    ["Suggested Test Cases", report.suggestedTestCases],
  ].filter(([, value]) => (Array.isArray(value) ? value.length : value));

  if (!sections.length) return [];

  return [
    "",
    "AI Analysis:",
    ...sections.flatMap(([title, value]) => [
      `${title}:`,
      ...(Array.isArray(value) ? value.map((item) => `- ${item}`) : [value]),
      "",
    ]),
  ];
}


function hasAiInsights(insights) {
  if (!insights) return false;

  return Boolean(
    insights.suggestedSeverity ||
      insights.suggestedPriority ||
      insights.reasoning ||
      (Array.isArray(insights.suggestedRootCause) && insights.suggestedRootCause.length) ||
      (Array.isArray(insights.suggestedFix) && insights.suggestedFix.length) ||
      (Array.isArray(insights.regressionScope) && insights.regressionScope.length),
  );
}

function aiInsightsTextLines(insights) {
  if (!hasAiInsights(insights)) return [];

  return [
    "",
    "AI Insights:",
    insights.suggestedSeverity ? `Suggested Severity: ${insights.suggestedSeverity}` : null,
    insights.suggestedPriority ? `Suggested Priority: ${insights.suggestedPriority}` : null,
    `Confidence: ${insights.confidence ?? 0}%`,
    insights.reasoning ? `Reasoning: ${insights.reasoning}` : null,
    ...(insights.suggestedRootCause?.length ? ["Suggested Root Causes:", ...insights.suggestedRootCause.map((item) => `- ${item}`)] : []),
    ...(insights.suggestedFix?.length ? ["Suggested Fixes:", ...insights.suggestedFix.map((item) => `- ${item}`)] : []),
    ...(insights.regressionScope?.length ? ["Regression Scope:", ...insights.regressionScope.map((item) => `- ${item}`)] : []),
  ].filter(Boolean);
}

function aiInsightsMarkdownLines(insights) {
  if (!hasAiInsights(insights)) return [];

  return [
    "",
    "## AI Insights",
    insights.suggestedSeverity ? `- Suggested Severity: ${insights.suggestedSeverity}` : null,
    insights.suggestedPriority ? `- Suggested Priority: ${insights.suggestedPriority}` : null,
    `- Confidence: ${insights.confidence ?? 0}%`,
    insights.reasoning ? `- Reasoning: ${insights.reasoning}` : null,
    ...(insights.suggestedRootCause?.length ? ["", "### Suggested Root Causes", ...insights.suggestedRootCause.map((item) => `- ${item}`)] : []),
    ...(insights.suggestedFix?.length ? ["", "### Suggested Fixes", ...insights.suggestedFix.map((item) => `- ${item}`)] : []),
    ...(insights.regressionScope?.length ? ["", "### Regression Scope", ...insights.regressionScope.map((item) => `- ${item}`)] : []),
  ].filter(Boolean);
}

function reportExportPayload(report, insights) {
  return hasAiInsights(insights) ? { ...report, aiInsights: insights } : report;
}
function plainTextReport(report, insights) {
  return [
    "Title:",
    report.title,
    "",
    "Environment:",
    `Platform: ${report.environment.platform}`,
    `Browser: ${report.environment.browser}`,
    `OS: ${report.environment.os}`,
    "",
    "Preconditions:",
    ...report.preconditions,
    "",
    "Steps to Reproduce:",
    ...report.steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "Expected Result:",
    report.expected,
    "",
    "Actual Result:",
    report.actual,
    "",
    `Severity: ${report.severity}`,
    `Priority: ${report.priority}`,
    ...reportAnalysisLines(report),
    ...aiInsightsTextLines(insights),
  ].join("\n").trim();
}

function markdownReport(report, insights) {
  const analysis = reportAnalysisLines(report);

  return [
    `# ${report.title}`,
    "",
    "## Environment",
    `- Platform: ${report.environment.platform}`,
    `- Browser: ${report.environment.browser}`,
    `- OS: ${report.environment.os}`,
    "",
    "## Preconditions",
    ...report.preconditions.map((item) => `- ${item}`),
    "",
    "## Steps to Reproduce",
    ...(report.steps.length ? report.steps.map((step, index) => `${index + 1}. ${step}`) : ["---"]),
    "",
    "## Expected Result",
    report.expected,
    "",
    "## Actual Result",
    report.actual,
    "",
    "## Triage",
    `- Severity: ${report.severity}`,
    `- Priority: ${report.priority}`,
    ...(analysis.length ? ["", "## AI Analysis", ...analysis.slice(2)] : []),
    ...aiInsightsMarkdownLines(insights),
  ].join("\n").trim();
}

function jiraReport(report, insights) {
  return markdownReport(report, insights)
    .replace(/^# (.*)$/m, "h1. $1")
    .replace(/^## (.*)$/gm, "h2. $1")
    .replace(/^### (.*)$/gm, "h3. $1");
}


function normalizeGeneratedTestCases(data) {
  const normalizeList = (value) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        item.title &&
        Array.isArray(item.steps)
    );
  };

  return {
    positive: normalizeList(data?.positive),
    negative: normalizeList(data?.negative),
    edge: normalizeList(data?.edge),
    regression: normalizeList(data?.regression),
  };
}

function bugReportPayload(report) {
  return {
    title: report.title,
    environment: report.environment,
    preconditions: report.preconditions,
    steps: report.steps,
    expected: report.expected,
    actual: report.actual,
    severity: report.severity,
    priority: report.priority,
  };
}

function plainTextTestCases(testCases) {
  return testCaseCategories
    .flatMap(([key, title]) => [
      `${title}:`,
      ...((testCases?.[key] ?? []).map((item) => `- ${item}`)),
      "",
    ])
    .join("\n")
    .trim();
}

function markdownTestCases(testCases) {
  return [
    "# AI Generated Test Cases",
    "",
    ...testCaseCategories.flatMap(([key, title]) => [
      `## ${title}`,
      ...((testCases?.[key] ?? []).length ? testCases[key].map((item) => `- ${item}`) : ["- No test cases returned."]),
      "",
    ]),
  ].join("\n").trim();
}
function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState(initialForm);
  const [report, setReport] = useState(emptyReport);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [testCases, setTestCases] = useState(null);
  const [testCasesLoading, setTestCasesLoading] = useState(false);
  const [testCasesError, setTestCasesError] = useState("");
  const [aiInsights, setAiInsights] = useState(null);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [aiInsightsError, setAiInsightsError] = useState("");
  const [enabledInsights, setEnabledInsights] = useState(initialEnabledInsights);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [progressIndex, setProgressIndex] = useState(0);
  const [testCasesProgressIndex, setTestCasesProgressIndex] = useState(0);
  const [aiInsightsProgressIndex, setAiInsightsProgressIndex] = useState(0);
  const [toast, setToast] = useState("");
  const resultRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    setForm((current) => ({ ...current, browser: detectBrowser() }));
  }, []);

  const osOptions = useMemo(
    () => ({
      Web: ["Windows", "Mac", "Linux"],
      Mobile: ["Android", "iOS"],
    }),
    [],
  );

  useEffect(() => {
    setForm((current) => {
      const options = osOptions[current.platform] ?? [];
      const nextOs = options.includes(current.os) ? current.os : options[0] ?? "";

      return nextOs === current.os ? current : { ...current, os: nextOs };
    });
  }, [form.platform, osOptions]);

  useEffect(() => {
    if (!loading) {
      return undefined;
    }

    setProgressIndex(0);
    const intervalId = window.setInterval(() => {
      setProgressIndex((current) => Math.min(current + 1, progressMessages.length - 1));
    }, 1200);

    return () => window.clearInterval(intervalId);
  }, [loading]);
  useEffect(() => {
    if (!testCasesLoading) {
      return undefined;
    }

    setTestCasesProgressIndex(0);
    const intervalId = window.setInterval(() => {
      setTestCasesProgressIndex((current) => Math.min(current + 1, testCaseProgressMessages.length - 1));
    }, 1200);

    return () => window.clearInterval(intervalId);
  }, [testCasesLoading]);
  useEffect(() => {
    if (!aiInsightsLoading) {
      return undefined;
    }

    setAiInsightsProgressIndex(0);
    const intervalId = window.setInterval(() => {
      setAiInsightsProgressIndex((current) => Math.min(current + 1, aiInsightsProgressMessages.length - 1));
    }, 1200);

    return () => window.clearInterval(intervalId);
  }, [aiInsightsLoading]);

  useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current);
  }, []);

  const validationErrors = useMemo(() => getValidationErrors(form), [form]);
  const isValid = Object.keys(validationErrors).length === 0;
  const hasReport = report.title !== "---";
  const visibleErrors = Object.fromEntries(
    Object.entries(validationErrors).filter(([field]) => submitted || touched[field]),
  );
  const counterRatio = form.description.length / maxDescriptionLength;
  const counterClassName =
    counterRatio >= 0.95
      ? "text-red-600 dark:text-red-300"
      : counterRatio >= 0.8
        ? "text-amber-600 dark:text-amber-300"
        : "text-slate-500 dark:text-slate-400";

  const showToast = (message) => {
    window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2200);
  };

  const handleFieldChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleBlur = (field) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const handleGenerate = async () => {
    setSubmitted(true);
    setTouched({ description: true, platform: true, os: true, browser: true });

    if (!isValid || loading) {
      return;
    }

    setTestCases(null);
    setTestCasesError("");
    setTestCasesLoading(false);
    setAiInsights(null);
    setAiInsightsError("");
    setAiInsightsLoading(false);
    setLoading(true);
    setCopied(false);
    setError("");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          description: form.description.trim(),
          platform: form.platform,
          os: form.os,
          browser: form.platform === "Web" ? form.browser.trim() : "",
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || data?.warning || "Failed to generate bug report.");
      }

      setReport(normalizeReport(data, form));

      window.requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch (requestError) {
      setError(
        requestError.name === "AbortError"
          ? "Request timed out. Please try again."
          : requestError.message || "Failed to generate bug report.",
      );
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const copyText = async (payload, message) => {
    if (!hasReport) {
      return;
    }

    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      showToast(message);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Unable to copy to clipboard. Please try again.");
    }
  };

  const handleCopy = () => copyText(plainTextReport(report, aiInsights), "Copied to clipboard.");
  const handleCopyJira = () => copyText(jiraReport(report, aiInsights), "Copied Jira-ready report.");
  const handleCopyAzure = () => copyText(markdownReport(report, aiInsights), "Copied Azure DevOps-ready report.");

  const handleExportJson = () => {
    if (!hasReport) return;

    downloadFile("bug-report.json", JSON.stringify(reportExportPayload(report, aiInsights), null, 2), "application/json");
    showToast("JSON export downloaded.");
  };

  const handleExportMarkdown = () => {
    if (!hasReport) return;

    downloadFile("bug-report.md", markdownReport(report, aiInsights), "text/markdown");
    showToast("Markdown export downloaded.");
  };
  const handleGenerateTestCases = async () => {
    if (!hasReport || loading || testCasesLoading) {
      return;
    }

    setTestCases(null);
    setTestCasesLoading(true);
    setTestCasesError("");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(testCaseApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify(bugReportPayload(report)),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate test cases.");
      }

      setTestCases(normalizeGeneratedTestCases(data));
      showToast("Test cases generated.");
    } catch (requestError) {
      setTestCasesError(
        requestError.name === "AbortError"
          ? "Test case generation timed out. Please try again."
          : requestError.message || "Failed to generate test cases.",
      );
    } finally {
      window.clearTimeout(timeoutId);
      setTestCasesLoading(false);
    }
  };

  const handleCopyTestCases = async () => {
    if (!testCases) return;

    try {
      await navigator.clipboard.writeText(plainTextTestCases(testCases));
      showToast("Copied test cases.");
    } catch {
      setTestCasesError("Unable to copy test cases. Please try again.");
    }
  };

  const handleExportTestCasesJson = () => {
    if (!testCases) return;

    downloadFile("test-cases.json", JSON.stringify(testCases, null, 2), "application/json");
    showToast("Test case JSON export downloaded.");
  };

  const handleExportTestCasesMarkdown = () => {
    if (!testCases) return;

    downloadFile("test-cases.md", markdownTestCases(testCases), "text/markdown");
    showToast("Test case Markdown export downloaded.");
  };
  const handleEnabledInsightsChange = (key, value) => {
    setEnabledInsights((current) => ({ ...current, [key]: value }));
  };

  const handleGenerateAiInsights = async () => {
    if (!hasReport || loading || aiInsightsLoading) {
      return;
    }

    setAiInsights(null);
    setAiInsightsLoading(true);
    setAiInsightsError("");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(aiInsightsApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          bugDescription: form.description.trim(),
          platform: form.platform,
          os: form.os,
          browser: form.platform === "Web" ? form.browser.trim() : "",
          enabledInsights,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate AI insights.");
      }

      setAiInsights(data);
      showToast("AI insights generated.");
    } catch (requestError) {
      setAiInsightsError(
        requestError.name === "AbortError"
          ? "AI insights request timed out. Please try again."
          : requestError.message || "Failed to generate AI insights.",
      );
    } finally {
      window.clearTimeout(timeoutId);
      setAiInsightsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col px-3 py-4 sm:px-4 lg:px-6">
        <Header theme={theme} onToggleTheme={toggleTheme} />
        
        
        <main className="mt-4 grid items-start gap-4 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:mt-5">          
          <section className="flex flex-col rounded-2xl border border-white/70 bg-white/90 p-4 shadow-soft backdrop-blur-xl transition duration-300 hover:shadow-card dark:border-slate-800 dark:bg-slate-900/85 sm:p-5">
            <div className="flex flex-1 flex-col gap-4">
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white shadow-sm">
                      1
                    </span>
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                      Describe the Issue
                    </h2>
                  </div>
                  <p className="text-sm leading-5 text-slate-600 dark:text-slate-300">
                    Add enough context for a tester or developer to reproduce the issue confidently.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="bug-description" className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                    Bug description *
                  </label>
                  <textarea
                    id="bug-description"
                    value={form.description}
                    maxLength={maxDescriptionLength}
                    onChange={(event) => handleFieldChange("description", event.target.value)}
                    onBlur={() => handleBlur("description")}
                    placeholder="Example: On the checkout page, selecting PayPal and clicking Place Order shows an endless spinner. The order is not created, no error message appears, and the browser console shows a 500 error from /api/payments."
                    className="min-h-[132px] lg:min-h-[150px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none transition duration-300 placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus-visible:ring-4 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-50 dark:placeholder:text-slate-500 dark:hover:border-indigo-500/70 dark:focus:ring-indigo-500/20"
                    aria-invalid={Boolean(visibleErrors.description)}
                    aria-describedby="bug-description-help bug-description-count"
                  />
                  {visibleErrors.description ? (
                    <p className="text-xs font-semibold text-red-600 dark:text-red-300">
                      {visibleErrors.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p id="bug-description-help" className="text-sm text-slate-500 dark:text-slate-400">
                    Minimum 10 characters. Clear symptoms produce better reports.
                  </p>
                  <span id="bug-description-count" className={`text-sm font-semibold ${counterClassName}`}>
                    {form.description.length} / {maxDescriptionLength}
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {tips.map((tip) => (
                    <div
                      key={tip}
                      className="rounded-xl border border-indigo-100 bg-indigo-50/70 px-2.5 py-2 text-xs font-medium text-indigo-700 transition duration-300 hover:-translate-y-0.5 hover:shadow-sm dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200"
                    >
                      {tip}
                    </div>
                  ))}
                </div>
              </div>

              <EnvironmentSelector
                form={form}
                osOptions={osOptions}
                onChange={handleFieldChange}
                onBlur={handleBlur}
                errors={visibleErrors}
              />

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!isValid || loading}
                  className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 px-6 py-4 text-sm font-semibold text-white shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-soft active:translate-y-0 active:shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-card dark:focus-visible:ring-indigo-500/30"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : null}
                  {loading ? progressMessages[progressIndex] : "Generate Bug Report"}
                </button>

                {error ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <div ref={resultRef} className="self-stretch">
            <OutputCard
              report={report}
              onCopy={handleCopy}
              onRegenerate={handleGenerate}
              onExportJson={handleExportJson}
              onExportMarkdown={handleExportMarkdown}
              onCopyJira={handleCopyJira}
              onCopyAzure={handleCopyAzure}
              copied={copied}
              canCopy={hasReport && !loading}
              canRegenerate={hasReport && !loading}
              onGenerateTestCases={handleGenerateTestCases}
              canGenerateTestCases={hasReport && !loading && !testCasesLoading}
              testCasesLoading={testCasesLoading}
              loading={loading}
              progressMessage={progressMessages[progressIndex]}
            />
            </div> 

        </main>

                    <div className="mt-4">
              <AiInsightsCard
                insights={aiInsights}
                enabledInsights={enabledInsights}
                onEnabledInsightsChange={handleEnabledInsightsChange}
                onGenerate={handleGenerateAiInsights}
                loading={aiInsightsLoading}
                loadingMessage={aiInsightsProgressMessages[aiInsightsProgressIndex]}
                error={aiInsightsError}
                canGenerate={hasReport && !loading && !aiInsightsLoading}
              />
            </div>

        <div className="mt-4">
          <TestCasesCard
            testCases={testCases}
            loading={testCasesLoading}
            loadingMessage={testCaseProgressMessages[testCasesProgressIndex]}
            error={testCasesError}
            onCopy={handleCopyTestCases}
            onExportJson={handleExportTestCasesJson}
            onExportMarkdown={handleExportTestCasesMarkdown}
          />
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-soft animate-toast-in dark:border-emerald-500/25 dark:bg-slate-900 dark:text-emerald-300" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
