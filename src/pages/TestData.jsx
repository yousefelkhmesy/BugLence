import { useMemo, useState } from "react";
import * as XLSX from "xlsx";

import {
  edgeCasePresets,
  generateBoundaryData,
  generateTestData,
} from "../utils/testDataGenerators";

const dataTypes = [
  ["alphanumeric", "Alphanumeric"],
  ["letters", "Letters"],
  ["uppercase", "Uppercase"],
  ["number", "Integer"],
  ["decimal", "Decimal"],
  ["name", "Full Name"],
  ["firstname", "First Name"],
  ["lastname", "Last Name"],
  ["email", "Email"],
  ["password", "Password"],
  ["phone", "Phone Number"],
  ["username", "Username"],
  ["uuid", "UUID"],
  ["date", "Date & Time"],
  ["url", "URL"],
  ["ipv4", "IPv4"],
  ["symbols", "Symbols"],
  ["boolean", "Boolean"],
  ["custom", "Custom Characters"],
];

export default function TestData() {
  const [type, setType] = useState("alphanumeric");
  const [count, setCount] = useState(10);
  const [length, setLength] = useState(12);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [mode, setMode] = useState("valid");

  const [uppercaseEnabled, setUppercaseEnabled] =
    useState(true);
  const [lowercaseEnabled, setLowercaseEnabled] =
    useState(true);
  const [numbersEnabled, setNumbersEnabled] =
    useState(true);
  const [symbolsEnabled, setSymbolsEnabled] =
    useState(true);

  const [customCharacters, setCustomCharacters] =
    useState("");

  const [results, setResults] = useState([]);
  const [copied, setCopied] = useState("");

  const usesLength = [
    "alphanumeric",
    "letters",
    "uppercase",
    "password",
    "username",
    "symbols",
    "custom",
  ].includes(type);

  const usesRange = ["number", "decimal"].includes(type);

  const usesValidityMode = ["email", "url"].includes(type);

  const usesDateMode = type === "date";

  const canGenerate = useMemo(() => {
    if (count < 1 || count > 500) return false;

    if (usesLength && (length < 1 || length > 1000)) {
      return false;
    }

    if (usesRange && Number(min) > Number(max)) {
      return false;
    }

    if (type === "custom" && !customCharacters) {
      return false;
    }

    return true;
  }, [
    count,
    length,
    min,
    max,
    type,
    customCharacters,
    usesLength,
    usesRange,
  ]);

  const handleGenerate = () => {
    if (!canGenerate) return;

    setResults(
      generateTestData({
        type,
        count: Number(count),
        length: Number(length),
        min: Number(min),
        max: Number(max),
        mode,
        uppercaseEnabled,
        lowercaseEnabled,
        numbersEnabled,
        symbolsEnabled,
        customCharacters,
      })
    );
  };

  const generateEdges = () => {
    const values = edgeCasePresets.map((item, index) => ({
      id: index + 1,
      ...item,
    }));

    setResults(values);
  };

  const generateBoundaries = (boundaryType) => {
    const values = generateBoundaryData({
      dataType: boundaryType,
      min,
      max,
    }).map((item, index) => ({
      id: index + 1,
      ...item,
    }));

    setResults(values);
  };

  const copyValue = async (value, id) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);

    window.setTimeout(() => setCopied(""), 1200);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(
      results.map((item) => item.value).join("\n")
    );

    setCopied("all");
    window.setTimeout(() => setCopied(""), 1200);
  };

  const exportExcel = () => {
    if (!results.length) return;

    const rows = results.map((item, index) => ({
      "#": index + 1,
      Value: item.value,
      Type: item.type,
      "Expected Validity": item.validity,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 55 },
      { wch: 22 },
      { wch: 24 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Test Data"
    );

    XLSX.writeFile(
      workbook,
      `buglens-test-data-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
          Test Data Generator
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
          Generate realistic, boundary, and edge-case test
          data for manual and automated testing.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Generator Settings
          </h2>

          <label className="mt-5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
            Data Type
          </label>

          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setResults([]);
            }}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {dataTypes.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {usesLength && (
            <Field
              label="Length"
              type="number"
              value={length}
              min="1"
              max="1000"
              onChange={setLength}
            />
          )}

          {usesRange && (
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Minimum"
                type="number"
                value={min}
                onChange={setMin}
              />

              <Field
                label="Maximum"
                type="number"
                value={max}
                onChange={setMax}
              />
            </div>
          )}

          {usesValidityMode && (
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Validity
              </label>

              <select
                value={mode}
                onChange={(event) =>
                  setMode(event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="valid">Valid</option>
                <option value="invalid">Invalid</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          )}

          {usesDateMode && (
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Date Range
              </label>

              <select
                value={mode}
                onChange={(event) =>
                  setMode(event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="future">Future</option>
                <option value="past">Past</option>
              </select>
            </div>
          )}

          {type === "password" && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Include
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Check
                  label="Uppercase"
                  checked={uppercaseEnabled}
                  onChange={setUppercaseEnabled}
                />
                <Check
                  label="Lowercase"
                  checked={lowercaseEnabled}
                  onChange={setLowercaseEnabled}
                />
                <Check
                  label="Numbers"
                  checked={numbersEnabled}
                  onChange={setNumbersEnabled}
                />
                <Check
                  label="Symbols"
                  checked={symbolsEnabled}
                  onChange={setSymbolsEnabled}
                />
              </div>
            </div>
          )}

          {type === "custom" && (
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Allowed Characters
              </label>

              <input
                value={customCharacters}
                onChange={(event) =>
                  setCustomCharacters(event.target.value)
                }
                placeholder="ABCabc123-_"
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          )}

          <Field
            label="Count"
            type="number"
            value={count}
            min="1"
            max="500"
            onChange={setCount}
          />

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generate Data
          </button>

          <div className="my-5 border-t border-slate-200 dark:border-slate-800" />

          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            QA Presets
          </p>

          <div className="mt-2 grid gap-2">
            <PresetButton
              onClick={generateEdges}
              label="Generate Edge Cases"
            />

            <PresetButton
              onClick={() => generateBoundaries("text")}
              label="Text Length Boundaries"
            />

            <PresetButton
              onClick={() => generateBoundaries("number")}
              label="Numeric Boundaries"
            />
          </div>
        </section>

        <section className="min-w-0">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Generated Data
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {results.length} generated values
                </p>
              </div>

              {results.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copyAll}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    {copied === "all"
                      ? "Copied"
                      : "Copy All"}
                  </button>

                  <button
                    type="button"
                    onClick={exportExcel}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {!results.length ? (
              <div className="flex min-h-[420px] items-center justify-center p-8 text-center">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    No test data generated yet.
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Configure the generator or use a QA preset.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-950/50">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Value</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">
                        Expected Validity
                      </th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>

                  <tbody>
                    {results.map((item, index) => (
                      <tr
                        key={`${item.id}-${index}`}
                        className="border-t border-slate-100 dark:border-slate-800"
                      >
                        <td className="px-4 py-3 text-slate-500">
                          {index + 1}
                        </td>

                        <td className="max-w-md break-all px-4 py-3 font-mono text-xs text-slate-900 dark:text-slate-100">
                          {item.value === ""
                            ? "(empty string)"
                            : item.value}
                        </td>

                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                          {item.type}
                        </td>

                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                          {item.validity}
                        </td>

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              copyValue(
                                item.value,
                                `${item.id}-${index}`
                              )
                            }
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300"
                          >
                            {copied ===
                            `${item.id}-${index}`
                              ? "Copied"
                              : "Copy"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  ...props
}) {
  return (
    <label className="mt-4 block">
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        {...props}
      />
    </label>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="accent-indigo-600"
      />

      {label}
    </label>
  );
}

function PresetButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-slate-200 px-3 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-indigo-500/10"
    >
      {label}
    </button>
  );
}