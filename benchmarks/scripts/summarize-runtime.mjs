import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const inputPath = path.join(rootDir, "benchmarks", "results", "runtime_raw.csv");
const outputPath = path.join(rootDir, "benchmarks", "results", "runtime_summary.json");

const csv = fs.readFileSync(inputPath, "utf8").trim().split(/\r?\n/);
const [header, ...rows] = csv;
const cols = header.split(",");
const idx = (name) => cols.indexOf(name);

const data = {};

for (const line of rows) {
  const parts = line.split(",");
  const key = [parts[idx("framework")], parts[idx("scenario")], parts[idx("operation")]].join("|");
  const duration = parseFloat(parts[idx("duration_ms")]);
  const heap = parseFloat(parts[idx("heap_used_mb")]);
  if (!data[key]) {
    data[key] = {
      framework: parts[idx("framework")],
      scenario: parts[idx("scenario")],
      operation: parts[idx("operation")],
      durations: [],
      heaps: [],
    };
  }
  if (!Number.isNaN(duration)) data[key].durations.push(duration);
  if (!Number.isNaN(heap)) data[key].heaps.push(heap);
}

const stats = (arr) => {
  const n = arr.length;
  const sorted = [...arr].sort((a, b) => a - b);
  const mean = arr.reduce((sum, v) => sum + v, 0) / n;
  const p50 = sorted[Math.floor(0.5 * (n - 1))];
  const p95 = sorted[Math.floor(0.95 * (n - 1))];
  const min = sorted[0];
  const max = sorted[n - 1];
  return { n, mean, p50, p95, min, max };
};

const rowsOut = [];
for (const key of Object.keys(data).sort()) {
  const item = data[key];
  const duration = stats(item.durations);
  const heap = item.heaps.length ? stats(item.heaps) : null;
  rowsOut.push({
    framework: item.framework,
    scenario: item.scenario,
    operation: item.operation,
    duration,
    heap,
  });
}

fs.writeFileSync(outputPath, JSON.stringify(rowsOut, null, 2));
console.log(`Wrote ${outputPath}`);
