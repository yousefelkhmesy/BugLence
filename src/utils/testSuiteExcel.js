import * as XLSX from "xlsx";

export const BUGLENS_FIELDS = [
  { key: "id", label: "ID" },
  { key: "feature", label: "Feature" },
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "type", label: "Type" },
  { key: "severity", label: "Severity" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "preconditions", label: "Preconditions" },
  { key: "steps", label: "Steps" },
  { key: "expectedResult", label: "Expected Result" },
];

const aliases = {
  id: [
    "id",
    "test id",
    "test case id",
    "tc id",
    "case id",
  ],

  feature: [
    "feature",
    "module",
    "component",
    "functionality",
  ],

  title: [
    "title",
    "scenario",
    "test case",
    "test scenario",
    "test case title",
    "scenario title",
  ],

  description: [
    "description",
    "details",
    "test description",
    "scenario description",
  ],

  type: [
    "type",
    "test type",
    "category",
  ],

  severity: [
    "severity",
    "impact",
  ],

  priority: [
    "priority",
    "importance",
  ],

  status: [
    "status",
    "result",
    "execution status",
    "test result",
  ],

  preconditions: [
    "preconditions",
    "precondition",
    "prerequisites",
    "prerequisite",
  ],

  steps: [
    "steps",
    "test steps",
    "actions",
    "test actions",
  ],

  expectedResult: [
    "expected",
    "expected result",
    "expected outcome",
    "expected results",
  ],
};

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

export function detectField(header) {
  const normalized = normalizeHeader(header);

  for (const [field, names] of Object.entries(aliases)) {
    if (
      names.some(
        (name) => normalizeHeader(name) === normalized
      )
    ) {
      return field;
    }
  }

  return "";
}

export async function readTestSuiteFile(file) {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
  });

  if (!workbook.SheetNames.length) {
    throw new Error(
      "The selected file does not contain any worksheets."
    );
  }

  return workbook;
}

export function getSheetRows(workbook, sheetName) {
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error("Unable to read the selected worksheet.");
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  return rows.filter((row) =>
    row.some((cell) => String(cell ?? "").trim())
  );
}

export function getSheetHeaders(workbook, sheetName) {
  const rows = getSheetRows(workbook, sheetName);

  if (!rows.length) return [];

  return rows[0].map((header, index) => {
    const value = String(header ?? "").trim();

    return value || `Column ${index + 1}`;
  });
}

export function createAutoMapping(headers) {
  const mapping = {};
  const usedFields = new Set();

  headers.forEach((header) => {
    const detected = detectField(header);

    if (detected && !usedFields.has(detected)) {
      mapping[header] = detected;
      usedFields.add(detected);
    } else {
      mapping[header] = "";
    }
  });

  return mapping;
}

function splitList(value) {
  const text = String(value ?? "").trim();

  if (!text) return [];

  const lines = text
    .split(/\r?\n/)
    .map((item) =>
      item
        .replace(/^\s*[-•]\s*/, "")
        .replace(/^\s*\d+[.)]\s*/, "")
        .trim()
    )
    .filter(Boolean);

  if (lines.length > 1) {
    return lines;
  }

  return [text];
}

function normalizeImportedCase(testCase) {
  return {
    id: String(testCase.id ?? "").trim(),

    feature:
      String(testCase.feature ?? "").trim(),

    title:
      String(testCase.title ?? "").trim(),

    description:
      String(testCase.description ?? "").trim(),

    type:
      String(testCase.type ?? "").trim() ||
      "Positive",

    severity:
      String(testCase.severity ?? "").trim() ||
      "Medium",

    priority:
      String(testCase.priority ?? "").trim() ||
      "Medium",

    status:
      String(testCase.status ?? "").trim(),

    preconditions: splitList(
      testCase.preconditions
    ),

    steps: splitList(testCase.steps),

    expectedResult:
      String(
        testCase.expectedResult ?? ""
      ).trim(),
  };
}

export function convertSheetToTestCases(
  workbook,
  sheetName,
  mapping
) {
  const rows = getSheetRows(workbook, sheetName);

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header, index) => {
    const value = String(header ?? "").trim();

    return value || `Column ${index + 1}`;
  });

  return rows
    .slice(1)
    .filter((row) =>
      row.some((cell) =>
        String(cell ?? "").trim()
      )
    )
    .map((row) => {
      const result = {};

      headers.forEach((header, index) => {
        const targetField = mapping[header];

        if (!targetField) return;

        result[targetField] = row[index] ?? "";
      });

      return normalizeImportedCase(result);
    })
    .filter(
      (testCase) =>
        testCase.title ||
        testCase.steps.length ||
        testCase.expectedResult
    );
}

function extractNumericId(id) {
  const match = String(id ?? "").match(/(\d+)\s*$/);

  if (!match) return null;

  const number = Number(match[1]);

  return Number.isFinite(number)
    ? number
    : null;
}

export function mergeTestSuites(
  existingCases,
  newCases
) {
  const usedIds = new Set(
    existingCases
      .map((testCase) =>
        String(testCase.id ?? "").trim()
      )
      .filter(Boolean)
  );

  let highestNumber = existingCases.reduce(
    (max, testCase) => {
      const number = extractNumericId(testCase.id);

      return number !== null
        ? Math.max(max, number)
        : max;
    },
    0
  );

  const normalizedExisting =
    existingCases.map((testCase) => ({
      ...testCase,
      id: String(testCase.id ?? "").trim(),
    }));

  const normalizedNew = newCases.map(
    (testCase) => {
      let id;

      do {
        highestNumber += 1;

        id = `TC-${String(
          highestNumber
        ).padStart(3, "0")}`;
      } while (usedIds.has(id));

      usedIds.add(id);

      return {
        ...testCase,
        id,
      };
    }
  );

  return [
    ...normalizedExisting,
    ...normalizedNew,
  ];
}

export function getNextIdPreview(existingCases) {
  const highestNumber = existingCases.reduce(
    (max, testCase) => {
      const number = extractNumericId(testCase.id);

      return number !== null
        ? Math.max(max, number)
        : max;
    },
    0
  );

  return `TC-${String(
    highestNumber + 1
  ).padStart(3, "0")}`;
}

export function exportTestSuiteExcel(
  testCases,
  filename = "buglens-test-suite"
) {
  const rows = testCases.map((testCase) => ({
    ID: testCase.id || "",
    Feature: testCase.feature || "",
    Title: testCase.title || "",
    Description: testCase.description || "",
    Type: testCase.type || "",
    Severity: testCase.severity || "",
    Priority: testCase.priority || "",
    Status: testCase.status || "",

    Preconditions:
      (testCase.preconditions || [])
        .map((item) => `• ${item}`)
        .join("\n"),

    Steps:
      (testCase.steps || [])
        .map(
          (step, index) =>
            `${index + 1}. ${step}`
        )
        .join("\n"),

    "Expected Result":
      testCase.expectedResult || "",
  }));

  const worksheet =
    XLSX.utils.json_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 22 },
    { wch: 42 },
    { wch: 50 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 45 },
    { wch: 60 },
    { wch: 55 },
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Test Cases"
  );

  const date = new Date()
    .toISOString()
    .slice(0, 10);

  XLSX.writeFile(
    workbook,
    `${filename}-${date}.xlsx`
  );
}