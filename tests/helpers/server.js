import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, isAbsolute, join, relative, resolve, sep } from "node:path";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".txt": "text/plain; charset=utf-8",
};

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
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
  const extension = extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": contentType });
  createReadStream(filePath).pipe(res);
}

export function createTestServer({ rootDir = process.cwd() } = {}) {
  const resolvedRoot = resolve(rootDir);

  return createServer((req, res) => {
    let pathname;
    try {
      pathname = new URL(req.url || "/", "http://localhost").pathname;
    } catch {
      sendText(res, 400, "Invalid request URL");
      return;
    }

    const filePath = resolveRequestFile(resolvedRoot, pathname);
    if (!filePath) {
      sendText(res, 403, "Forbidden");
      return;
    }

    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      if (!pathname.endsWith("/")) {
        res.writeHead(308, { Location: `${pathname}/` });
        res.end();
        return;
      }
      serveFile(res, join(filePath, "index.html"));
      return;
    }

    if (existsSync(filePath)) {
      serveFile(res, filePath);
      return;
    }

    sendText(res, 404, "Not found");
  });
}

export async function withTestServer(fn, options) {
  const server = createTestServer(options);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    return await fn({ server, port, baseUrl });
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}
