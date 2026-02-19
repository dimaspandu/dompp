import fs from "node:fs";
import path from "node:path";

const requiredHeaders = [
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
];

const numericFields = ["iteration", "duration_ms", "heap_used_mb", "long_tasks_count"];

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
  if (lines.length < 2) {
    throw new Error("CSV must contain header and at least one data row.");
  }
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => parseCsvLine(line));
  return { headers, rows };
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node benchmarks/scripts/validate-runtime-csv.mjs <runtime_raw.csv>");
    process.exit(1);
  }

  const abs = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(abs)) {
    console.error(`Input file not found: ${abs}`);
    process.exit(1);
  }

  const content = fs.readFileSync(abs, "utf8");
  const { headers, rows } = parseCsv(content);
  const headerSet = new Set(headers);

  const missing = requiredHeaders.filter((h) => !headerSet.has(h));
  if (missing.length > 0) {
    console.error(`Missing headers: ${missing.join(", ")}`);
    process.exit(1);
  }

  const index = Object.fromEntries(headers.map((h, i) => [h, i]));
  let valid = true;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (row.length !== headers.length) {
      console.error(`Row ${i + 2}: column count mismatch (${row.length} != ${headers.length})`);
      valid = false;
      continue;
    }

    for (const field of numericFields) {
      const v = row[index[field]];
      if (Number.isNaN(Number(v))) {
        console.error(`Row ${i + 2}: field "${field}" is not numeric (${v})`);
        valid = false;
      }
    }
  }

  if (!valid) {
    process.exit(1);
  }

  console.log(`OK: ${rows.length} rows validated in ${inputPath}`);
}

main();
