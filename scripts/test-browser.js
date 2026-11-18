import { spawn } from "node:child_process";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { withTestServer } from "../tests/helpers/server.js";

const SPECS = ["element-builder", "component-builder", "enhancements", "install"];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function findBrowser() {
  if (process.env.BROWSER) return process.env.BROWSER;

  const candidates =
    process.platform === "win32"
      ? [
          "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
          "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        ]
      : process.platform === "darwin"
        ? [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
            "/Applications/Chromium.app/Contents/MacOS/Chromium",
          ]
        : [
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/chromium-browser",
            "/usr/bin/chromium",
            "/usr/bin/microsoft-edge",
            "/usr/bin/microsoft-edge-stable",
          ];

  for (const candidate of candidates) {
    if (await exists(candidate)) return candidate;
  }
  return null;
}

function runBrowser(executable, url, userDataDir, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const args = [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking",
      "--virtual-time-budget=30000",
      `--user-data-dir=${userDataDir}`,
      "--dump-dom",
      url,
    ];

    const child = spawn(executable, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Browser timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      out += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      err += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, out, err });
    });
  });
}

function extractResults(dom) {
  const match = dom.match(/<pre id="test-results">([\s\S]*?)<\/pre>/);
  if (!match) return null;

  const text = match[1]
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function main() {
  const browser = await findBrowser();
  if (!browser) {
    console.error(
      "No supported Chromium-based browser found. Set BROWSER to the browser executable path."
    );
    process.exit(1);
  }

  let overallFailed = 0;
  let overallTotal = 0;

  console.log(`Browser: ${browser}`);

  await withTestServer(async ({ baseUrl }) => {
    for (const spec of SPECS) {
      const userDataDir = await mkdtemp(join(tmpdir(), "dompp-browser-test-"));
      const url = `${baseUrl}/tests/browser/run.html?spec=${encodeURIComponent(spec)}`;
      process.stdout.write(`\n[${spec}] running... `);

      try {
        const { out, err } = await runBrowser(browser, url, userDataDir);
        const results = extractResults(out);

        if (!results) {
          overallFailed += 1;
          overallTotal += 1;
          console.log("FAIL (no results)");
          if (err) console.error(err.trim().slice(-2000));
          if (out) console.error(out.trim().slice(-2000));
          continue;
        }

        overallTotal += results.total || 0;
        overallFailed += results.failed || 0;

        if (results.failed) {
          console.log(`FAIL ${results.passed}/${results.total}`);
          for (const r of results.results || []) {
            if (!r.ok) {
              console.error(`  - ${r.name}`);
              if (r.detail) console.error(`    ${String(r.detail).split("\n")[0]}`);
            }
          }
        } else {
          console.log(`PASS ${results.passed}/${results.total}`);
        }
      } catch (error) {
        overallFailed += 1;
        overallTotal += 1;
        console.log("FAIL (error)");
        console.error(error && (error.stack || error.message || String(error)));
      } finally {
        await rm(userDataDir, { recursive: true, force: true });
      }
    }
  });

  console.log(`\nBrowser tests: ${overallTotal - overallFailed}/${overallTotal} passed`);
  process.exit(overallFailed ? 1 : 0);
}

main().catch((error) => {
  console.error(error && (error.stack || error.message || String(error)));
  process.exit(1);
});
