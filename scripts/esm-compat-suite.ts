#!/usr/bin/env bun

interface CompatCase {
  description: string;
  path: string;
  expect: "module" | "json" | "redirect" | "diagnostic";
}

interface FetchSummary {
  contentType: string | null;
  diagnosticCode: string | null;
  finalUrl: string;
  ok: boolean;
  status: number;
}

interface CompatResult {
  case: CompatCase;
  esmSh: FetchSummary;
  esmUnpkg: FetchSummary;
  passed: boolean;
  reason: string | null;
}

const defaultCases: CompatCase[] = [
  {
    description: "React package root",
    path: "/react@18.3.1",
    expect: "module",
  },
  {
    description: "React DOM client subpath",
    path: "/react-dom@18.3.1/client",
    expect: "module",
  },
  {
    description: "External all shorthand",
    path: "/*swr@1.3.0",
    expect: "module",
  },
  {
    description: "Dependency override",
    path: "/react-dom@18.3.1/client?deps=react@18.2.0",
    expect: "module",
  },
  {
    description: "Alias React to Preact compat",
    path: "/react-dom@18.3.1/client?alias=react:preact/compat&deps=preact@10.25.4",
    expect: "module",
  },
  {
    description: "No-bundle mode",
    path: "/preact@10.26.4/hooks?no-bundle",
    expect: "module",
  },
  {
    description: "Metadata",
    path: "/preact@10.26.4?meta",
    expect: "json",
  },
  {
    description: "Worker wrapper",
    path: "/preact@10.26.4?worker",
    expect: "module",
  },
  {
    description: "Runtime-native target",
    path: "/react@18.3.1?target=node",
    expect: "module",
  },
  {
    description: "Unsupported source diagnostic",
    path: "/preact@10.26.4/component.vue",
    expect: "diagnostic",
  },
];

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const jsonOutput = args.has("--json");
const esmShOrigin = stripTrailingSlash(process.env.ESM_SH_ORIGIN ?? "https://esm.sh");
const esmUnpkgOrigin = stripTrailingSlash(process.env.ESM_UNPKG_ORIGIN ?? "https://esm.unpkg.com");

if (dryRun) {
  printJsonOrTable(
    defaultCases.map((compatCase) => ({
      case: compatCase,
      esmSh: pendingSummary(new URL(compatCase.path, esmShOrigin).toString()),
      esmUnpkg: pendingSummary(new URL(compatCase.path, esmUnpkgOrigin).toString()),
      passed: true,
      reason: null,
    }))
  );
  process.exit(0);
}

let results = await Promise.all(defaultCases.map(runCase));
printJsonOrTable(results);

let failures = results.filter((result) => !result.passed);
if (failures.length > 0) {
  process.exitCode = 1;
}

async function runCase(compatCase: CompatCase): Promise<CompatResult> {
  let [esmSh, esmUnpkg] = await Promise.all([
    summarizeFetch(new URL(compatCase.path, esmShOrigin)),
    summarizeFetch(new URL(compatCase.path, esmUnpkgOrigin)),
  ]);
  let reason = compareSummaries(compatCase, esmSh, esmUnpkg);

  return {
    case: compatCase,
    esmSh,
    esmUnpkg,
    passed: reason == null,
    reason,
  };
}

async function summarizeFetch(url: URL): Promise<FetchSummary> {
  let response: Response;
  try {
    response = await fetch(url, {
      redirect: "follow",
      headers: {
        Accept: "application/javascript, application/json;q=0.9, */*;q=0.1",
      },
    });
  } catch (error) {
    return {
      contentType: null,
      diagnosticCode: "FETCH_ERROR",
      finalUrl: url.toString(),
      ok: false,
      status: 0,
    };
  }

  let contentType = response.headers.get("Content-Type");
  let diagnosticCode = await readDiagnosticCode(response.clone());

  return {
    contentType,
    diagnosticCode,
    finalUrl: response.url,
    ok: response.ok,
    status: response.status,
  };
}

async function readDiagnosticCode(response: Response): Promise<string | null> {
  if (!response.headers.get("Content-Type")?.includes("application/json")) {
    return null;
  }

  try {
    let value = await response.json() as unknown;
    if (typeof value !== "object" || value == null) {
      return null;
    }

    let error = (value as { error?: unknown }).error;
    if (typeof error !== "object" || error == null) {
      return null;
    }

    let code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  } catch {
    return null;
  }
}

function compareSummaries(compatCase: CompatCase, esmSh: FetchSummary, esmUnpkg: FetchSummary): string | null {
  if (compatCase.expect === "diagnostic") {
    return esmUnpkg.status >= 400 ? null : `expected esm.unpkg.com diagnostic, got ${esmUnpkg.status}`;
  }

  if (esmSh.status >= 500 || esmUnpkg.status >= 500) {
    return `server error: esm.sh=${esmSh.status}, esm.unpkg.com=${esmUnpkg.status}`;
  }

  if (esmSh.ok !== esmUnpkg.ok) {
    return `ok mismatch: esm.sh=${esmSh.status}, esm.unpkg.com=${esmUnpkg.status}`;
  }

  if (compatCase.expect === "json" && !isJson(esmUnpkg.contentType)) {
    return `expected JSON from esm.unpkg.com, got ${esmUnpkg.contentType ?? "missing content type"}`;
  }

  if (compatCase.expect === "module" && !isJavaScript(esmUnpkg.contentType)) {
    return `expected JavaScript from esm.unpkg.com, got ${esmUnpkg.contentType ?? "missing content type"}`;
  }

  return null;
}

function isJson(contentType: string | null): boolean {
  return contentType?.includes("application/json") ?? false;
}

function isJavaScript(contentType: string | null): boolean {
  return contentType?.includes("javascript") || contentType?.includes("ecmascript") || false;
}

function pendingSummary(finalUrl: string): FetchSummary {
  return {
    contentType: null,
    diagnosticCode: null,
    finalUrl,
    ok: true,
    status: 0,
  };
}

function printJsonOrTable(results: CompatResult[]): void {
  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  for (let result of results) {
    let marker = result.passed ? "PASS" : "FAIL";
    let diagnostic = result.esmUnpkg.diagnosticCode == null ? "" : ` (${result.esmUnpkg.diagnosticCode})`;
    console.log(`${marker} ${result.case.description}: ${result.esmUnpkg.status}${diagnostic} ${result.case.path}`);
    if (result.reason != null) {
      console.log(`  ${result.reason}`);
    }
  }
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
