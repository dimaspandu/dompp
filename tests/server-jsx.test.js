import test from "node:test";
import assert from "node:assert/strict";

import { createDevServer } from "../server.js";

test("development server transforms JSX modules into native ESM responses", async () => {
  const server = createDevServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const { port } = server.address();
    const directoryResponse = await fetch(
      `http://127.0.0.1:${port}/examples/22-v1.2.0/`
    );
    assert.equal(directoryResponse.status, 200, "example directory should resolve to index.html");

    for (const pageName of [
      "index.html",
      "dompp-only.html",
      "builders-only.html",
      "combined.html",
    ]) {
      const pageResponse = await fetch(
        `http://127.0.0.1:${port}/examples/22-v1.2.0/${pageName}`
      );
      assert.equal(pageResponse.status, 200, `${pageName} should be served`);
    }

    for (const moduleName of ["dompp-only", "builders-only", "combined"]) {
      const response = await fetch(
        `http://127.0.0.1:${port}/examples/22-v1.2.0/${moduleName}.jsx`
      );
      const source = await response.text();

      assert.equal(response.status, 200, `${moduleName}.jsx should compile`);
      assert.match(response.headers.get("content-type"), /text\/javascript/);
      if (moduleName !== "dompp-only") {
        assert.match(source, /elementBuilder\("section"/);
        assert.doesNotMatch(source, /<section\b/);
      }
    }
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});
