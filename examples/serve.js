/**
 * DOM++ Playground Server
 *
 * Features:
 * - Serves the repository root
 * - Auto-generates example index
 * - Supports ES modules
 * - Directory trailing slash redirect
 * - Path alias (/dompp -> /src/index.js)
 * - Zero dependency
 *
 * Usage:
 *
 *   node examples/serve.js
 *
 * Optional:
 *
 *   PORT=5173 node examples/serve.js
 */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const examplesDir = path.dirname(__filename);
const rootDir = path.resolve(examplesDir, "..");

const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".map": "application/json",
};

/**
 * Generate examples index automatically.
 */
function generateIndex() {

  const dirs = fs.readdirSync(examplesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const links = dirs.map(dir => `
    <li>
      <a href="/examples/${dir}/">
        ${dir}
      </a>
    </li>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>DOM++ Playground</title>

<style>
body {
  font-family: system-ui;
  padding: 40px;
  max-width: 720px;
  margin: auto;
}

h1 {
  margin-bottom: 12px;
}

ul {
  line-height: 1.9;
}

a {
  text-decoration: none;
  font-weight: 600;
}

a:hover {
  text-decoration: underline;
}

code {
  background: #eee;
  padding: 2px 6px;
  border-radius: 6px;
}
</style>
</head>

<body>

<h1>DOM++ Examples</h1>

<p>Select an example:</p>

<ul>
${links}
</ul>

</body>
</html>
`;
}

/**
 * Resolve safe file path from repo root.
 */
function resolvePath(urlPath) {

  // Alias support
  if (urlPath === "/dompp") {
    return path.join(rootDir, "src/index.js");
  }

  return path.join(rootDir, urlPath);
}

const server = http.createServer((req, res) => {

  try {

    // Root -> examples index
    if (req.url === "/") {

      res.writeHead(200, {
        "Content-Type": "text/html",
      });

      res.end(generateIndex());
      return;
    }

    let filePath = resolvePath(req.url);

    // Redirect directory without trailing slash
    if (
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isDirectory() &&
      !req.url.endsWith("/")
    ) {

      res.writeHead(301, {
        Location: req.url + "/",
      });

      res.end();
      return;
    }

    // Directory -> index.html
    if (
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isDirectory()
    ) {
      filePath = path.join(filePath, "index.html");
    }

    if (!fs.existsSync(filePath)) {

      res.writeHead(404);
      res.end("404 - Not Found");
      return;
    }

    const ext = path.extname(filePath);
    const type = MIME[ext] || "application/octet-stream";

    const data = fs.readFileSync(filePath);

    res.writeHead(200, {
      "Content-Type": type,
    });

    res.end(data);

  } catch (err) {

    res.writeHead(500);
    res.end("500 - Server Error");

    console.error(err);
  }

});

server.listen(PORT, () => {

  console.log(`
DOM++ playground running:

http://localhost:${PORT}

Examples:
http://localhost:${PORT}/examples/
`);

});
