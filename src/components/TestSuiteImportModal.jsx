import { useEffect, useMemo, useState } from "react";

import {
  BUGLENS_FIELDS,
  convertSheetToTestCases,
  createAutoMapping,
  getNextIdPreview,
  getSheetHeaders,
  readTestSuiteFile,
} from "../utils/testSuiteExcel";

export default function TestSuiteImportModal({
  open,
  currentCases,
  onClose,
  onConfirm,
}) {
  const [file, setFile] = useState(null);
  const [workbook, setWorkbook] = useState(null);
  const [sheetName, setSheetName] = useState("");
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [existingCases, setExistingCases] =
    useState([]);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);

  const reset = () => {
    setFile(null);
    setWorkbook(null);
    setSheetName("");
    setHeaders([]);
    setMapping({});
    setExistingCases([]);
    setError("");
    setReading(false);
  };

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  const applySheet = (
    workbookValue,
    selectedSheet
  ) => {
    try {
      const nextHeaders = getSheetHeaders(
        workbookValue,
        selectedSheet
      );

      if (!nextHeaders.length) {
        throw new Error(
          "The selected worksheet is empty."
        );
      }

      const nextMapping =
        createAutoMapping(nextHeaders);

      setSheetName(selectedSheet);
      setHeaders(nextHeaders);
      setMapping(nextMapping);

      const imported = convertSheetToTestCases(
        workbookValue,
        selectedSheet,
        nextMapping
      );

      setExistingCases(imported);
    } catch (sheetError) {
      setError(
        sheetError.message ||
          "Unable to read this worksheet."
      );
    }
  };

  const handleFile = async (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) return;

    setError("");
    setReading(true);

    try {
      const lowerName =
        selectedFile.name.toLowerCase();

      if (
        !lowerName.endsWith(".xlsx") &&
        !lowerName.endsWith(".xls") &&
        !lowerName.endsWith(".csv")
      ) {
        throw new Error(
          "Upload an Excel (.xlsx, .xls) or CSV file."
        );
      }

      const parsedWorkbook =
        await readTestSuiteFile(selectedFile);

      const firstSheet =
        parsedWorkbook.SheetNames[0];

      setFile(selectedFile);
      setWorkbook(parsedWorkbook);

      applySheet(
        parsedWorkbook,
        firstSheet
      );
    } catch (fileError) {
      setFile(null);
      setWorkbook(null);

      setError(
        fileError.message ||
          "Unable to read the selected file."
      );
    } finally {
      setReading(false);
      event.target.value = "";
    }
  };

  const handleSheetChange = (value) => {
    if (!workbook) return;

    setError("");
    applySheet(workbook, value);
  };

  const handleMappingChange = (
    header,
    field
  ) => {
    const nextMapping = {
      ...mapping,
      [header]: field,
    };

    /*
     * One BugLens field should normally map
     * to only one spreadsheet column.
     */
    if (field) {
      Object.keys(nextMapping).forEach(
        (otherHeader) => {
          if (
            otherHeader !== header &&
            nextMapping[otherHeader] === field
          ) {
            nextMapping[otherHeader] = "";
          }
        }
      );
    }

    setMapping(nextMapping);

    if (workbook) {
      const imported =
        convertSheetToTestCases(
          workbook,
          sheetName,
          nextMapping
        );

      setExistingCases(imported);
    }
  };

  const mappedCount = useMemo(
    () =>
      Object.values(mapping).filter(Boolean)
        .length,
    [mapping]
  );

  const nextId = getNextIdPreview(
    existingCases
  );

  if (!open) return null;

  const canMerge =
    existingCases.length > 0 &&
    currentCases.length > 0 &&
    mappedCount > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-suite-import-title"
    >
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">

        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">

          <div>
            <h2
              id="test-suite-import-title"
              className="text-lg font-semibold text-slate-950 dark:text-white"
            >
              Add to Existing Test Suite
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Import an existing Excel or CSV test
              suite, map its columns, then append
              the current BugLens test cases.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Close
          </button>

        </div>

        <div className="space-y-6 p-5">

          <section>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              1. Upload Test Suite
            </h3>

            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-8 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-700 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/5">

              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {reading
                  ? "Reading file..."
                  : "Choose Excel or CSV file"}
              </span>

              <span className="mt-1 text-xs text-slate-500">
                .xlsx, .xls or .csv
              </span>

              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                disabled={reading}
                onChange={handleFile}
                className="hidden"
              />

            </label>

            {file && (
              <p className="mt-2 text-xs text-slate-500">
                File: {file.name}
              </p>
            )}
          </section>

          {workbook &&
            workbook.SheetNames.length > 1 && (
              <section>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  2. Select Worksheet
                </h3>

                <select
                  value={sheetName}
                  onChange={(event) =>
                    handleSheetChange(
                      event.target.value
                    )
                  }
                  className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {workbook.SheetNames.map(
                    (name) => (
                      <option
                        key={name}
                        value={name}
                      >
                        {name}
                      </option>
                    )
                  )}
                </select>
              </section>
            )}

          {headers.length > 0 && (
            <section>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Column Mapping
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    BugLens detected what it could.
                    Review the mapping before merging.
                  </p>
                </div>

                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-300">
                  {mappedCount} fields mapped
                </span>
              </div>

              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">

                <div className="grid grid-cols-2 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 dark:bg-slate-800">
                  <span>
                    Spreadsheet Column
                  </span>
                  <span>
                    BugLens Field
                  </span>
                </div>

                {headers.map((header) => (
                  <div
                    key={header}
                    className="grid grid-cols-2 items-center gap-4 border-t border-slate-100 px-4 py-3 dark:border-slate-800"
                  >
                    <span className="truncate text-sm text-slate-700 dark:text-slate-300">
                      {header}
                    </span>

                    <select
                      value={
                        mapping[header] || ""
                      }
                      onChange={(event) =>
                        handleMappingChange(
                          header,
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="">
                        Ignore
                      </option>

                      {BUGLENS_FIELDS.map(
                        (field) => (
                          <option
                            key={field.key}
                            value={field.key}
                          >
                            {field.label}
                          </option>
                        )
                      )}
                    </select>

                  </div>
                ))}

              </div>
            </section>
          )}

          {existingCases.length > 0 && (
            <section className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">

              <h3 className="text-sm font-semibold text-indigo-950 dark:text-indigo-100">
                Merge Preview
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">

                <PreviewStat
                  label="Existing"
                  value={existingCases.length}
                />

                <PreviewStat
                  label="New"
                  value={currentCases.length}
                />

                <PreviewStat
                  label="After Merge"
                  value={
                    existingCases.length +
                    currentCases.length
                  }
                />

              </div>

              <p className="mt-4 text-xs text-indigo-700 dark:text-indigo-300">
                Existing IDs will be preserved.
                New BugLens cases will start from
                approximately{" "}
                <strong>{nextId}</strong>.
              </p>

            </section>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
            >
              {error}
            </div>
          )}

        </div>

        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canMerge}
            onClick={() =>
              onConfirm(existingCases)
            }
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Merge {currentCases.length} Test Cases
          </button>

        </div>

      </div>
    </div>
  );
}

function PreviewStat({ label, value }) {
  return (
    <div className="rounded-lg bg-white/80 p-3 dark:bg-slate-950/40">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}