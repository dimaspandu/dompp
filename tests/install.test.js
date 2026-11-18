import test from "node:test";
import assert from "node:assert/strict";

import { createDOMEnv } from "./helpers/fake-dom.js";
import { installDOMPP } from "../src/install/install-dompp.js";
import { createBuilders } from "../src/builders/index.js";
import { installEnhancements } from "../src/enhancements/index.js";

test("installDOMPP installs enhancements and returns versioned API", () => {
  const env = createDOMEnv();
  const api = installDOMPP(env.document);

  assert.equal(api.version, "1.6.8");
  assert.equal(typeof api.ElementBuilder, "function");
  assert.equal(typeof api.elementBuilder, "function");
  assert.equal(typeof api.ComponentBuilder, "function");
  assert.equal(typeof api.componentBuilder, "function");
  assert.equal(typeof api.asFragmentChildren, "function");
  assert.equal(typeof api.normalizeChildren, "function");
  assert.equal(api.install, undefined);

  // document enhancements present
  assert.equal(typeof env.document.createComponent, "function");
  assert.equal(typeof env.Element.prototype.setChildren, "function");
  assert.equal(typeof env.Element.prototype.setText, "function");
  assert.equal(typeof env.Element.prototype.setAttributes, "function");
  assert.equal(typeof env.DocumentFragment.prototype.setChildren, "function");
});

test("installed API can build, mount, and rerender components", () => {
  const env = createDOMEnv();
  installDOMPP(env.document);
  const { document } = env;
  const root = document.createElement("div");
  document.body.appendChild(root);

  let count = 0;
  const counter = document.createComponent((rerender) =>
    document.createElement("button", { onClick: () => rerender(() => count++) }, `n:${count}`)
  );

  root.setChildren([counter]);
  assert.equal(root.childNodes[0].textContent, "n:0");
  counter.rerender(() => count++);
  assert.equal(root.childNodes[0].textContent, "n:1");
});

test("installDOMPP works with provided document (no global dependency)", () => {
  const env = createDOMEnv();
  const api = installDOMPP(env.document);
  assert.ok(api);
  assert.equal(typeof env.document.createComponent, "function");
});

test("installEnhancements is idempotent for defineOn-guarded methods", () => {
  const env = createDOMEnv();
  const builders = createBuilders(env.document);
  installEnhancements(builders);
  const first = env.Element.prototype.setText;
  const createCompFirst = env.document.createComponent;
  installEnhancements(builders);
  assert.equal(env.Element.prototype.setText, first);
  assert.equal(env.document.createComponent, createCompFirst);
});
