import fs from "node:fs";
import path from "node:path";

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => parseCsvLine(line));
  return { headers, rows };
}

function toCsvValue(v) {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function percentile(sorted, p) {
  if (sorted.length === 0) return NaN;
  const idx = (sorted.length - 1) * p;
  const low = Math.floor(idx);
  const high = Math.ceil(idx);
  if (low === high) return sorted[low];
  const w = idx - low;
  return sorted[low] * (1 - w) + sorted[high] * w;
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr, m) {
  if (arr.length < 2) return 0;
  const variance = arr.reduce((acc, x) => acc + ((x - m) ** 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function fmt(n) {
  return Number.isFinite(n) ? n.toFixed(3) : "";
}

function main() {
  const inputPath = process.argv[2];
  const outputCsvPath = process.argv[3] || "benchmarks/results/runtime_summary.csv";
  const outputMdPath = process.argv[4] || "benchmarks/results/runtime_tables.md";

  if (!inputPath) {
    console.error("Usage: node benchmarks/scripts/aggregate-runtime.mjs <runtime_raw.csv> [summary.csv] [tables.md]");
    process.exit(1);
  }

  const inAbs = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(inAbs)) {
    console.error(`Input file not found: ${inAbs}`);
    process.exit(1);
  }

  const content = fs.readFileSync(inAbs, "utf8");
  const { headers, rows } = parseCsv(content);
  const index = Object.fromEntries(headers.map((h, i) => [h, i]));
  const required = ["framework", "scenario", "operation", "duration_ms"];
  for (const field of required) {
    if (!(field in index)) {
      console.error(`Missing required field: ${field}`);
      process.exit(1);
    }
  }

  const groups = new Map();
  for (const row of rows) {
    const framework = row[index.framework];
    const scenario = row[index.scenario];
    const operation = row[index.operation];
    const duration = Number(row[index.duration_ms]);
    if (!Number.isFinite(duration)) continue;

    const key = `${framework}||${scenario}||${operation}`;
    if (!groups.has(key)) {
      groups.set(key, { framework, scenario, operation, values: [] });
    }
    groups.get(key).values.push(duration);
  }

  const summaryRows = [];
  for (const item of groups.values()) {
    const sorted = [...item.values].sort((a, b) => a - b);
    const m = mean(sorted);
    summaryRows.push({
      framework: item.framework,
      scenario: item.scenario,
      operation: item.operation,
      n: sorted.length,
      mean_ms: m,
      stddev_ms: stddev(sorted, m),
      p50_ms: percentile(sorted, 0.50),
      p95_ms: percentile(sorted, 0.95),
      min_ms: sorted[0],
      max_ms: sorted[sorted.length - 1],
    });
  }

  summaryRows.sort((a, b) =>
    a.scenario.localeCompare(b.scenario) ||
    a.operation.localeCompare(b.operation) ||
    a.framework.localeCompare(b.framework)
  );

  const outHeaders = [
    "framework",
    "scenario",
    "operation",
    "n",
    "mean_ms",
    "stddev_ms",
    "p50_ms",
    "p95_ms",
    "min_ms",
    "max_ms",
  ];

  const csvLines = [
    outHeaders.join(","),
    ...summaryRows.map((r) => outHeaders.map((h) => toCsvValue(
      typeof r[h] === "number" ? fmt(r[h]) : r[h]
    )).join(",")),
  ];

  const outCsvAbs = path.resolve(process.cwd(), outputCsvPath);
  fs.mkdirSync(path.dirname(outCsvAbs), { recursive: true });
  fs.writeFileSync(outCsvAbs, `${csvLines.join("\n")}\n`, "utf8");

  const md = [
    "# Runtime Summary",
    "",
    "| Scenario | Operation | Framework | n | Mean (ms) | Stddev (ms) | p50 (ms) | p95 (ms) | Min (ms) | Max (ms) |",
    "|---|---|---|---:|---:|---:|---:|---:|---:|---:|",
    ...summaryRows.map((r) =>
      `| ${r.scenario} | ${r.operation} | ${r.framework} | ${r.n} | ${fmt(r.mean_ms)} | ${fmt(r.stddev_ms)} | ${fmt(r.p50_ms)} | ${fmt(r.p95_ms)} | ${fmt(r.min_ms)} | ${fmt(r.max_ms)} |`
    ),
    "",
  ].join("\n");

  const outMdAbs = path.resolve(process.cwd(), outputMdPath);
  fs.mkdirSync(path.dirname(outMdAbs), { recursive: true });
  fs.writeFileSync(outMdAbs, md, "utf8");

  console.log(`Wrote summary CSV: ${outputCsvPath}`);
  console.log(`Wrote summary table: ${outputMdPath}`);
}

main();
