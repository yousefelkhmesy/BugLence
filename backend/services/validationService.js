const allowedPlatforms = new Set(["Web", "Mobile"]);

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function validateBugRequest(payload) {
  const description = normalizeString(payload?.description);
  const platform = normalizeString(payload?.platform);
  const os = normalizeString(payload?.os);
  const browser = normalizeString(payload?.browser);

  if (!description) {
    return {
      error: "Description is required.",
      statusCode: 400,
    };
  }

  if (description.length < 10) {
    return {
      warning: "Description is too short. Please provide at least 10 characters.",
      statusCode: 400,
    };
  }

  if (!allowedPlatforms.has(platform)) {
    return {
      error: "Platform must be either Web or Mobile.",
      statusCode: 400,
    };
  }

  if (!os) {
    return {
      error: "OS is required.",
      statusCode: 400,
    };
  }

  if (platform === "Web" && !browser) {
    return {
      error: "Browser is required for Web reports.",
      statusCode: 400,
    };
  }

  return {
    statusCode: 200,
    data: {
      description,
      platform,
      os,
      browser,
    },
  };
}

export function validateTestCaseRequest(payload) {
  const title = normalizeString(payload?.title);

  const environment =
    payload?.environment &&
    typeof payload.environment === "object" &&
    !Array.isArray(payload.environment)
      ? payload.environment
      : {};

  const preconditions = normalizeStringArray(payload?.preconditions);
  const steps = normalizeStringArray(payload?.steps);
  const expected = normalizeString(payload?.expected);
  const actual = normalizeString(payload?.actual);
  const severity = normalizeString(payload?.severity);
  const priority = normalizeString(payload?.priority);

  if (!title) {
    return {
      error: "Bug report title is required.",
      statusCode: 400,
    };
  }

  if (!expected) {
    return {
      error: "Expected result is required.",
      statusCode: 400,
    };
  }

  if (!actual) {
    return {
      error: "Actual result is required.",
      statusCode: 400,
    };
  }

  return {
    statusCode: 200,
    data: {
      title,
      environment,
      preconditions,
      steps,
      expected,
      actual,
      severity,
      priority,
    },
  };
}

export function validateAiInsightsRequest(payload) {
  const bugDescription = normalizeString(payload?.bugDescription);
  const platform = normalizeString(payload?.platform);
  const os = normalizeString(payload?.os);
  const browser = normalizeString(payload?.browser);

  const enabledInsights =
    payload?.enabledInsights &&
    typeof payload.enabledInsights === "object" &&
    !Array.isArray(payload.enabledInsights)
      ? payload.enabledInsights
      : {};

  const normalizedInsights = {
    severity: Boolean(enabledInsights.severity),
    priority: Boolean(enabledInsights.priority),
    rootCause: Boolean(enabledInsights.rootCause),
    fix: Boolean(enabledInsights.fix),
    regressionScope: Boolean(enabledInsights.regressionScope),
  };

  if (!bugDescription) {
    return {
      error: "Bug description is required.",
      statusCode: 400,
    };
  }

  if (bugDescription.length < 10) {
    return {
      error: "Bug description must be at least 10 characters.",
      statusCode: 400,
    };
  }

  if (!allowedPlatforms.has(platform)) {
    return {
      error: "Platform must be either Web or Mobile.",
      statusCode: 400,
    };
  }

  if (!os) {
    return {
      error: "OS is required.",
      statusCode: 400,
    };
  }

  if (platform === "Web" && !browser) {
    return {
      error: "Browser is required for Web insights.",
      statusCode: 400,
    };
  }

  if (!Object.values(normalizedInsights).some(Boolean)) {
    return {
      error: "At least one AI insight must be selected.",
      statusCode: 400,
    };
  }

  return {
    statusCode: 200,
    data: {
      bugDescription,
      platform,
      os,
      browser,
      enabledInsights: normalizedInsights,
    },
  };
}

export function validateRequirementAnalysisRequest(payload) {
  const requirement = normalizeString(payload?.requirement);

  const analysisOptions =
    payload?.analysisOptions &&
    typeof payload.analysisOptions === "object" &&
    !Array.isArray(payload.analysisOptions)
      ? payload.analysisOptions
      : {};

  const normalizedOptions = {
    ambiguities: Boolean(analysisOptions.ambiguities),
    missingInfo: Boolean(analysisOptions.missingInfo),
    risks: Boolean(analysisOptions.risks),
    testScenarios: Boolean(analysisOptions.testScenarios),
    edgeCases: Boolean(analysisOptions.edgeCases),
  };

  if (!requirement) {
    return {
      error: "Requirement is required.",
      statusCode: 400,
    };
  }

  if (requirement.length < 10) {
    return {
      error: "Requirement must be at least 10 characters.",
      statusCode: 400,
    };
  }

  if (requirement.length > 4000) {
    return {
      error: "Requirement must not exceed 4000 characters.",
      statusCode: 400,
    };
  }

  if (!Object.values(normalizedOptions).some(Boolean)) {
    return {
      error: "At least one analysis option must be selected.",
      statusCode: 400,
    };
  }

  return {
    statusCode: 200,
    data: {
      requirement,
      analysisOptions: normalizedOptions,
    },
  };
}