import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import compileJSX from "../helpers/compileJSX.js";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const EXAMPLES_DIR = join(ROOT, "examples");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    if (!entry.name.endsWith(".jsx")) continue;
    if (entry.name.includes(".compiled.")) continue;

    const source = await readFile(full, "utf8");
    const output = compileJSX(source);
    const outPath = full.replace(/\.jsx$/, ".compiled.js");
    await writeFile(outPath, output, "utf8");
    console.log(`compiled ${full.replace(ROOT + "\\", "").replace(ROOT + "/", "")} -> ${outPath.replace(ROOT + "\\", "").replace(ROOT + "/", "")}`);
  }
}

await walk(EXAMPLES_DIR);