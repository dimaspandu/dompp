import { createServer }
from "http";

import {
  existsSync,
  readFileSync,
  createReadStream,
  statSync,
}
from "fs";

import {
  extname,
  join,
  relative,
  resolve,
  sep,
  isAbsolute,
  dirname,
}
from "path";

import {
  fileURLToPath,
  pathToFileURL,
}
from "url";

import compileJSX
from "./libs/js-analyzer/lib/transpileJSX/main.js";

const ROOT_DIR = dirname(fileURLToPath(import.meta.url));

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jsx": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.end(message);
}

function resolveRequestFile(rootDir, pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const relativePath = decodedPath.replace(/^[/\\]+/, "");
  const filePath = resolve(rootDir, relativePath || "index.html");
  const pathFromRoot = relative(rootDir, filePath);

  if (
    pathFromRoot === ".." ||
    pathFromRoot.startsWith(`..${sep}`) ||
    isAbsolute(pathFromRoot)
  ) {
    return null;
  }

  return filePath;
}

function serveFile(res, filePath) {
  if (!existsSync(filePath)) {
    sendText(res, 404, "Not found");
    return;
  }

  const extension = extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || "application/octet-stream";

  if (extension === ".jsx") {
    try {
      const source = readFileSync(filePath, "utf8");
      const javascript = compileJSX(source);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(javascript);
    } catch (error) {
      sendText(res, 500, `${error.name}: ${error.message}`);
    }
    return;
  }

  res.writeHead(200, { "Content-Type": contentType });
  createReadStream(filePath).pipe(res);
}

export function createDevServer({ rootDir = ROOT_DIR } = {}) {
  const resolvedRoot = resolve(rootDir);

  return createServer((req, res) => {
    let pathname;
    try {
      pathname = new URL(req.url, "http://localhost").pathname;
    } catch {
      sendText(res, 400, "Invalid request URL");
      return;
    }

    let filePath;
    try {
      filePath = resolveRequestFile(resolvedRoot, pathname);
    } catch {
      sendText(res, 400, "Invalid request path");
      return;
    }

    if (!filePath) {
      sendText(res, 403, "Forbidden");
      return;
    }

    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      serveFile(res, join(filePath, "index.html"));
      return;
    }

    if (existsSync(filePath)) {
      serveFile(res, filePath);
      return;
    }

    if (!extname(filePath)) {
      const htmlFile = `${filePath}.html`;
      if (existsSync(htmlFile)) {
        serveFile(res, htmlFile);
        return;
      }
    }

    sendText(res, 404, "Not found");
  });
}

const isDirectExecution =
  process.argv[1] != null &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isDirectExecution) {
  const port = Number(process.env.PORT || 5173);
  createDevServer().listen(port, () => {
    console.log(`DOMPP Dev Server: http://localhost:${port}`);
  });
}
