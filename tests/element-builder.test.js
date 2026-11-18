import test from "node:test";
import assert from "node:assert/strict";

import { createDOMEnv } from "./helpers/fake-dom.js";
import { createElementBuilder } from "../src/builders/element-builder.js";
import { createBuilders } from "../src/builders/index.js";

function setup() {
  const env = createDOMEnv({ url: "https://example.test/" });
  const { document } = env;
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.appendChild(root);
  return { ...env, root };
}

test("elementBuilder builds elements with attributes, styles, events, and children", () => {
  const { document, Event } = setup();
  const { elementBuilder, ElementBuilder } = createElementBuilder(document);
  let clicks = 0;

  const builder = elementBuilder(
    "button",
    {
      id: "btn",
      className: "primary",
      "data-x": "1",
      style: { color: "red", fontWeight: "700" },
      onClick: () => clicks++,
    },
    "Hello ",
    elementBuilder("span", null, "world")
  );

  assert.ok(builder instanceof ElementBuilder);
  const node = builder.toNode();
  assert.equal(node.tagName, "BUTTON");
  assert.equal(node.getAttribute("id"), "btn");
  assert.equal(node.getAttribute("class"), "primary");
  assert.equal(node.getAttribute("data-x"), "1");
  assert.equal(node.style.getPropertyValue("color"), "red");
  assert.equal(node.style.getPropertyValue("fontWeight"), "700");
  assert.equal(node.textContent, "Hello world");

  node.dispatchEvent(new Event("click", { bubbles: true }));
  assert.equal(clicks, 1);
});

test("setText, setChildren, setAttributes/setStyles, reset, and chaining", () => {
  const { document, root } = setup();
  const { elementBuilder } = createElementBuilder(document);

  const el = elementBuilder("div", { id: "box" }).setText("A");
  const node = el.toNode();
  root.appendChild(node);
  assert.equal(node.textContent, "A");

  el.setChildren([elementBuilder("span", null, "B"), " and ", "C", null, false]);
  assert.equal(node.textContent, "B and C");

  el.setAttributes({ "data-v": "x", title: "t" }).setStyles({ marginTop: "4px" });
  assert.equal(node.getAttribute("data-v"), "x");
  assert.equal(node.getAttribute("title"), "t");
  assert.equal(node.style.getPropertyValue("marginTop"), "4px");

  el.reset();
  assert.equal(node.childNodes.length, 0);
  assert.equal(node.getAttribute("id"), null);
});

test("keyed reconciliation preserves identity, moves, inserts, removes, and replaces by tag", () => {
  const { document } = setup();
  const { elementBuilder } = createElementBuilder(document);

  const list = elementBuilder("ul", null,
    elementBuilder("li", { key: "a" }, "A"),
    elementBuilder("li", { key: "b" }, "B"),
    elementBuilder("li", { key: "c" }, "C"),
  );
  const ul = list.toNode();
  const a = ul.children[0];
  const b = ul.children[1];
  const c = ul.children[2];

  list.setChildren([
    elementBuilder("li", { key: "c" }, "C"),
    elementBuilder("li", { key: "a" }, "A2"),
    elementBuilder("p", { key: "b" }, "B"),
    elementBuilder("li", { key: "d" }, "D"),
  ]);

  assert.equal(ul.children.length, 4);
  assert.equal(ul.children[0], c);
  assert.equal(ul.children[1], a);
  assert.equal(ul.children[1].textContent, "A2");
  assert.notEqual(ul.children[2], b);
  assert.equal(ul.children[2].tagName, "P");
  assert.equal(ul.children[2].textContent, "B");
  assert.equal(ul.children[3].textContent, "D");
});

test("adopting an existing element preserves identity and attaches behavior", () => {
  const { document, root, Event } = setup();
  const { elementBuilder } = createElementBuilder(document);
  root.appendChild(document.createElement("section"));
  const existing = root.childNodes[0];
  existing.setAttribute("id", "box");
  const span = document.createElement("span");
  span.appendChild(document.createTextNode("hi"));
  existing.appendChild(span);
  let clicked = 0;

  const builder = elementBuilder(existing, { "data-owned": "yes", onClick: () => clicked++ },
    elementBuilder("span", null, "updated"),
    elementBuilder("em", null, "more"),
  );
  const node = builder.toNode();
  assert.equal(node, existing);
  assert.equal(node.getAttribute("data-owned"), "yes");
  assert.equal(node.children[0].tagName, "SPAN");
  assert.equal(node.children[0].textContent, "updated");
  assert.equal(node.children[1].tagName, "EM");
  assert.equal(node.children[1].textContent, "more");
  node.dispatchEvent(new Event("click", { bubbles: true }));
  assert.equal(clicked, 1);
});

test("event handlers are replaced on update (no accumulation)", () => {
  const { document, Event } = setup();
  const { elementBuilder } = createElementBuilder(document);
  let a = 0;
  let b = 0;
  const btn = elementBuilder("button", { onClick: () => a++ });
  const node = btn.toNode();
  node.dispatchEvent(new Event("click"));
  assert.equal(a, 1);
  btn.setEvents({ click: () => b++ });
  node.dispatchEvent(new Event("click"));
  assert.equal(a, 1);
  assert.equal(b, 1);
});

test("elementBuilder.fragment returns a flat, updatable child array", () => {
  const { document } = setup();
  const { elementBuilder } = createElementBuilder(document);
  const frag = elementBuilder.fragment(
    elementBuilder("span", null, "x"),
    [elementBuilder("i", null, "y")],
    "z"
  );
  assert.ok(Array.isArray(frag));
  assert.equal(frag.length, 3);
  assert.equal(typeof frag.setChildren, "function");
  assert.equal(typeof frag.setText, "function");
  frag.setText("only");
  assert.equal(frag.length, 1);
  assert.equal(frag[0], "only");
  frag.setChildren([elementBuilder("b", null, "n")]);
  assert.equal(frag.length, 1);
  assert.equal(frag[0].struct.tag, "b");
});

test("createBuilders composes element and component foundations", () => {
  const { document } = setup();
  const b = createBuilders(document);
  assert.equal(typeof b.ElementBuilder, "function");
  assert.equal(typeof b.elementBuilder, "function");
  assert.equal(typeof b.ComponentBuilder, "function");
  assert.equal(typeof b.componentBuilder, "function");
  assert.equal(typeof b.install, "undefined");
  const node = b.elementBuilder("p", null, "x").toNode();
  assert.equal(node.textContent, "x");
});
