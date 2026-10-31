import test from "node:test";
import assert from "node:assert/strict";

test("combined 1.2.0 entry point adds builders while retaining DOMPP setters", async () => {
  globalThis.Element = class Element {};
  globalThis.Document = class Document {};
  globalThis.DocumentFragment = class DocumentFragment {};

  const api = await import("../../src/1.2.0/index.js");
  api.createDOMPP();

  assert.equal(api.version, "1.2.0");
  assert.equal(typeof api.createDOMPP, "function");
  assert.equal(typeof Document.prototype.elementBuilder, "function");
  assert.equal(typeof Document.prototype.componentBuilder, "function");
  assert.equal(typeof Element.prototype.setState, "function");
  assert.equal(typeof Element.prototype.setFineGrained, "function");
  assert.equal(typeof Document.prototype.createSignal, "function");
});
