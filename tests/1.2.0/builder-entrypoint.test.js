import test from "node:test";
import assert from "node:assert/strict";

test("DOM++ builder entry point installs document APIs without legacy setters", async () => {
  globalThis.Element = class Element {};
  globalThis.Document = class Document {};

  const api = await import("../../src/1.2.0/dompp-builders.js");

  assert.equal(api.version, "1.2.0");
  assert.equal(typeof Document.prototype.elementBuilder, "function");
  assert.equal(typeof Document.prototype.componentBuilder, "function");
  assert.equal(Element.prototype.setState, undefined);
});
