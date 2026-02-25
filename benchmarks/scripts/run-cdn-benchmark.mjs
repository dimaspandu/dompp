import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");

const RESULTS_DIR = path.join(rootDir, "benchmarks", "results");
const OUTPUT_CSV = path.join(RESULTS_DIR, "runtime_raw.csv");

const BASE_URL = process.env.BENCH_BASE_URL || "http://localhost:3000";
const WARMUP_RUNS = Number(process.env.BENCH_WARMUP || 5);
const MEASURED_RUNS = Number(process.env.BENCH_RUNS || 30);
const RUN_ID = process.env.BENCH_RUN_ID || `run_${Date.now()}`;
const BROWSER_NAME = process.env.BENCH_BROWSER || "chrome";
const BROWSER_VERSION = process.env.BENCH_BROWSER_VERSION || "unknown";
const OS_NAME = process.env.BENCH_OS || process.platform;
const NODE_VERSION = process.version.replace(/^v/, "");
const BUILD_MODE = process.env.BENCH_BUILD_MODE || "production";
const COMMIT_HASH = process.env.BENCH_COMMIT || "unknown";

const SCENARIOS = [
  {
    framework: "dompp",
    scenario: "counter",
    url: "benchmarks/apps-cdn/dompp/counter.html",
    operation: "counter_burst",
    type: "counter",
  },
  {
    framework: "dompp",
    scenario: "counter-reconcile",
    url: "benchmarks/apps-cdn/dompp/counter-reconcile.html",
    operation: "counter_burst",
    type: "counter",
  },
  {
    framework: "dompp",
    scenario: "counter-reconcile-no-match-by-id",
    url: "benchmarks/apps-cdn/dompp/counter-reconcile-no-match-by-id.html",
    operation: "counter_burst",
    type: "counter",
  },
  {
    framework: "dompp",
    scenario: "ordered-list-keyed",
    url: "benchmarks/apps-cdn/dompp/ordered-list-keyed.html",
    operation: "list_add",
    type: "list",
  },
  {
    framework: "react",
    scenario: "counter",
    url: "benchmarks/apps-cdn/react/counter.html",
    operation: "counter_burst",
    type: "counter",
  },
  {
    framework: "react",
    scenario: "ordered-list-keyed",
    url: "benchmarks/apps-cdn/react/ordered-list-keyed.html",
    operation: "list_add",
    type: "list",
  },
  {
    framework: "solid",
    scenario: "counter",
    url: "benchmarks/apps-cdn/solid/counter.html",
    operation: "counter_burst",
    type: "counter",
  },
  {
    framework: "solid",
    scenario: "ordered-list-keyed",
    url: "benchmarks/apps-cdn/solid/ordered-list-keyed.html",
    operation: "list_add",
    type: "list",
  },
  {
    framework: "vue",
    scenario: "counter",
    url: "benchmarks/apps-cdn/vue/counter.html",
    operation: "counter_burst",
    type: "counter",
  },
  {
    framework: "vue",
    scenario: "ordered-list-keyed",
    url: "benchmarks/apps-cdn/vue/ordered-list-keyed.html",
    operation: "list_add",
    type: "list",
  },
  {
    framework: "dompp",
    scenario: "bigtree",
    url: "benchmarks/apps-cdn/dompp/bigtree.html",
    operation: "bigtree_refresh",
    type: "bigtree",
  },
  {
    framework: "react",
    scenario: "bigtree",
    url: "benchmarks/apps-cdn/react/bigtree.html",
    operation: "bigtree_refresh",
    type: "bigtree",
  },
  {
    framework: "solid",
    scenario: "bigtree",
    url: "benchmarks/apps-cdn/solid/bigtree.html",
    operation: "bigtree_refresh",
    type: "bigtree",
  },
  {
    framework: "vue",
    scenario: "bigtree",
    url: "benchmarks/apps-cdn/vue/bigtree.html",
    operation: "bigtree_refresh",
    type: "bigtree",
  },
];

const header = [
  "timestamp",
  "run_id",
  "framework",
  "scenario",
  "operation",
  "iteration",
  "duration_ms",
  "heap_used_mb",
  "long_tasks_count",
  "browser",
  "browser_version",
  "os",
  "node_version",
  "build_mode",
  "commit_hash",
  "notes",
].join(",");

const counterIterations = Number(process.env.BENCH_COUNTER_ITERATIONS || 1000);
const listIterations = Number(process.env.BENCH_LIST_ITERATIONS || 50);
const bigtreeIterations = Number(process.env.BENCH_BIGTREE_ITERATIONS || 50);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function ensureResultsDir() {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(OUTPUT_CSV)) {
    fs.writeFileSync(OUTPUT_CSV, `${header}\n`, "utf8");
  }
}

function appendRow(row) {
  fs.appendFileSync(OUTPUT_CSV, `${row}\n`, "utf8");
}

function formatRow({
  framework,
  scenario,
  operation,
  iteration,
  durationMs,
  heapMb,
  longTasks,
  notes = "",
}) {
  const timestamp = new Date().toISOString();
  const fields = [
    timestamp,
    RUN_ID,
    framework,
    scenario,
    operation,
    String(iteration),
    durationMs.toFixed(3),
    heapMb?.toFixed(3) ?? "",
    longTasks ?? "",
    BROWSER_NAME,
    BROWSER_VERSION,
    OS_NAME,
    NODE_VERSION,
    BUILD_MODE,
    COMMIT_HASH,
    notes.replace(/\n/g, " ").replace(/,/g, ";"),
  ];
  return fields.join(",");
}

async function setupPage(page) {
  await page.setCacheEnabled(false);
  await page.evaluateOnNewDocument(() => {
    window.__benchHarness = {
      attach() {
        const findButton = (label) =>
          Array.from(document.querySelectorAll("button")).find(
            (btn) => btn.textContent.trim() === label
          );

        return {
          click(label) {
            const btn = findButton(label);
            if (!btn) {
              throw new Error(`Button not found: ${label}`);
            }
            btn.click();
          },
        };
      },
    };
  });
}

async function measureCounter(page) {
  const iterations = counterIterations;
  return page.evaluate(async (iterationsArg) => {
    const harness = window.__benchHarness.attach();
    const durations = [];
    const getHeap = () => {
      if (performance && performance.memory && performance.memory.usedJSHeapSize) {
        return performance.memory.usedJSHeapSize / (1024 * 1024);
      }
      return null;
    };

    for (let i = 0; i < iterationsArg; i += 1) {
      const start = performance.now();
      harness.click("+1");
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const end = performance.now();
      durations.push({
        duration: end - start,
        heap: getHeap(),
      });
    }

    return durations;
  }, iterations);
}

async function measureList(page) {
  const iterations = listIterations;
  return page.evaluate(async (iterationsArg) => {
    const harness = window.__benchHarness.attach();
    const durations = [];
    const getHeap = () => {
      if (performance && performance.memory && performance.memory.usedJSHeapSize) {
        return performance.memory.usedJSHeapSize / (1024 * 1024);
      }
      return null;
    };

    for (let i = 0; i < iterationsArg; i += 1) {
      const start = performance.now();
      harness.click("Refresh");
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const end = performance.now();
      durations.push({
        duration: end - start,
        heap: getHeap(),
      });
    }

    return durations;
  }, iterations);
}

async function measureBigtree(page) {
  const iterations = bigtreeIterations;
  return page.evaluate(async (iterationsArg) => {
    const harness = window.__benchHarness.attach();
    const durations = [];
    const getHeap = () => {
      if (performance && performance.memory && performance.memory.usedJSHeapSize) {
        return performance.memory.usedJSHeapSize / (1024 * 1024);
      }
      return null;
    };

    for (let i = 0; i < iterationsArg; i += 1) {
      const start = performance.now();
      harness.click("Refresh List");
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const end = performance.now();
      durations.push({
        duration: end - start,
        heap: getHeap(),
      });
    }

    return durations;
  }, iterations);
}

async function runScenario(page, scenario, measuredRuns) {
  const url = `${BASE_URL}/${scenario.url}`;
  await page.goto(url, { waitUntil: "networkidle0" });
  await delay(250);

  const results = [];
  for (let i = 0; i < measuredRuns; i += 1) {
    await page.reload({ waitUntil: "networkidle0" });
    await delay(150);
    let durations;
    if (scenario.type === "counter") {
      durations = await measureCounter(page);
    } else if (scenario.type === "bigtree") {
      durations = await measureBigtree(page);
    } else {
      durations = await measureList(page);
    }
    const mean = durations.reduce((sum, d) => sum + d.duration, 0) / durations.length;
    const heap = durations.map((d) => d.heap).filter((h) => typeof h === "number");
    const heapMean = heap.length ? heap.reduce((sum, h) => sum + h, 0) / heap.length : null;
    results.push({ durationMs: mean, heapMb: heapMean });
  }

  return results;
}

async function main() {
  ensureResultsDir();
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await setupPage(page);

  for (const scenario of SCENARIOS) {
    const warmupResults = await runScenario(page, scenario, WARMUP_RUNS);
    void warmupResults;

    const measuredResults = await runScenario(page, scenario, MEASURED_RUNS);
    measuredResults.forEach((result, index) => {
      const row = formatRow({
        framework: scenario.framework,
        scenario: scenario.scenario,
        operation: scenario.operation,
        iteration: index + 1,
        durationMs: result.durationMs,
        heapMb: result.heapMb,
        longTasks: "",
        notes: "",
      });
      appendRow(row);
    });
  }

  await browser.close();
  console.log(`Benchmark done. CSV: ${OUTPUT_CSV}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
