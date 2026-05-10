import { createServer } from "http";

import {
  existsSync,
  createReadStream,
  statSync
} from "fs";

import {
  extname,
  join,
  dirname
} from "path";

import { fileURLToPath } from "url";

// =====================================
// PATHS
// =====================================

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  dirname(__filename);

// examples/
// ├── server.js
// ├── index.html
// ├── 01-basic-text/
// │   └── index.html
// └── etc...

const ROOT_DIR = __dirname;

const PORT =
  process.env.PORT || 5173;

// =====================================
// MIME TYPES
// =====================================

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};

// =====================================
// SERVE FILE
// =====================================

function serveFile(res, filePath) {

  if (!existsSync(filePath)) {

    res.writeHead(404);

    res.end("Not found");

    return;
  }

  const ext =
    extname(filePath);

  const contentType =
    mimeTypes[ext] || "text/plain";

  res.writeHead(200, {
    "Content-Type": contentType
  });

  createReadStream(filePath)
    .pipe(res);
}

// =====================================
// SERVER
// =====================================

createServer((req, res) => {

  let urlPath =
    req.url.split("?")[0];

  console.log("REQ:", urlPath);

  // =================================
  // OPTIONAL PREFIX SUPPORT
  // /examples/01-basic-text/
  // =================================

  if (
    urlPath.startsWith("/examples/")
  ) {

    urlPath =
      urlPath.slice(
        "/examples".length
      );

    if (urlPath === "") {
      urlPath = "/";
    }
  }

  // =================================
  // ROOT
  // =================================

  if (urlPath === "/") {

    return serveFile(
      res,
      join(ROOT_DIR, "index.html")
    );
  }

  // =================================
  // SPECIAL:
  // /src/*
  // -> ../src/*
  // =================================

  if (
    urlPath.startsWith("/src/")
  ) {

    const srcPath = join(
      ROOT_DIR,
      "..",
      urlPath.slice(1)
    );

    return serveFile(
      res,
      srcPath
    );
  }

  // =================================
  // NORMAL FILE PATH
  // =================================

  const filePath =
    join(ROOT_DIR, urlPath);

  // =================================
  // DIRECT FILE
  // =================================

  if (
    existsSync(filePath) &&
    !statSync(filePath).isDirectory()
  ) {

    return serveFile(
      res,
      filePath
    );
  }

  // =================================
  // DIRECTORY -> index.html
  // =================================

  if (
    existsSync(filePath) &&
    statSync(filePath).isDirectory()
  ) {

    return serveFile(
      res,
      join(filePath, "index.html")
    );
  }

  // =================================
  // HTML FILE SUPPORT
  // /about -> /about.html
  // =================================

  const htmlFile =
    join(
      ROOT_DIR,
      urlPath + ".html"
    );

  if (existsSync(htmlFile)) {

    return serveFile(
      res,
      htmlFile
    );
  }

  // =================================
  // NOT FOUND
  // =================================

  res.writeHead(404);

  res.end("Not found");

}).listen(PORT, () => {

  console.log("");
  console.log(
    `Server running at:`
  );

  console.log(
    `http://localhost:${PORT}`
  );

  console.log("");

});