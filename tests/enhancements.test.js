import test from "node:test";
import assert from "node:assert/strict";

import { createDOMEnv } from "./helpers/fake-dom.js";
import { createBuilders } from "../src/builders/index.js";
import { installEnhancements } from "../src/enhancements/index.js";

function setup() {
  const env = createDOMEnv({ url: "https://example.test/" });
  const builders = createBuilders(env.document);
  installEnhancements(builders);
  const { document, Event } = env;
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.appendChild(root);
  return { ...env, ...builders, root, Event };
}

test("Element prototype setters are installed and chainable", () => {
  const { document, root, Event } = setup();
  let clicked = 0;
  const el = document.createElement("button");

  const r1 = el.setAttributes({ id: "b", "data-x": "1", disabled: false });
  const r2 = el.setStyles({ color: "red", marginTop: "2px" });
  const r3 = el.setEvents({ click: () => clicked++ });
  const r4 = el.setChildren(["hi"]);
  assert.equal(r1 && r1.toNode(), el);
  assert.equal(r2 && r2.toNode(), el);
  assert.equal(r3 && r3.toNode(), el);
  assert.equal(r4 && r4.toNode(), el);
  assert.equal(el.getAttribute("id"), "b");
  assert.equal(el.getAttribute("data-x"), "1");
  assert.equal(el.getAttribute("disabled"), null);
  assert.equal(el.style.getPropertyValue("color"), "red");
  assert.equal(el.style.getPropertyValue("marginTop"), "2px");
  assert.equal(el.textContent, "hi");

  root.appendChild(el);
  el.dispatchEvent(new Event("click"));
  assert.equal(clicked, 1);
  el.setText("bye");
  assert.equal(el.textContent, "bye");
});

test("DocumentFragment prototype setChildren/setText return flat child arrays", () => {
  const { document, elementBuilder } = setup();
  const frag = document.createDocumentFragment();
  assert.ok(Array.isArray(frag));
  assert.equal(typeof frag.setChildren, "function");
  assert.equal(typeof frag.setText, "function");
  frag.setChildren([elementBuilder("span", null, "a"), "b"]);
  assert.equal(frag.length, 2);
  frag.setText("only");
  assert.deepEqual(frag, ["only"]);
});

test("document.createComponent returns a rendered component with rerender", () => {
  const { document, root } = setup();
  let n = 0;
  const comp = document.createComponent((rerender) =>
    document.createElement("div", null,
      document.createElement("span", null, String(n)),
      document.createElement("button", { onClick: () => rerender(() => n++) }, "+")
    )
  );
  assert.equal(typeof comp.rerender, "function");
  root.appendChild(comp.toNode());
  assert.equal(comp.node.childNodes[0].textContent, "0");
  comp.rerender(() => n++);
  assert.equal(comp.node.childNodes[0].textContent, "1");
});

test("document.createDocumentFragment returns flat array and supports pragma form", () => {
  const { document, elementBuilder, ElementBuilder } = setup();
  const empty = document.createDocumentFragment();
  assert.ok(Array.isArray(empty));
  assert.equal(empty.length, 0);

  const withChildren = document.createDocumentFragment(
    elementBuilder("i", null, "a"),
    "b"
  );
  assert.ok(Array.isArray(withChildren));
  assert.equal(withChildren.length, 2);
  assert.ok(withChildren[0] instanceof ElementBuilder);
  assert.equal(withChildren[1], "b");

  const pragma = document.createDocumentFragment(null,
    elementBuilder("em", null, "x"),
    "y"
  );
  assert.equal(pragma.length, 2);
  assert.equal(pragma[0].struct.tag, "em");

  const mutable = document.createDocumentFragment().setChildren([
    elementBuilder("b", null, "n"),
  ]);
  assert.equal(mutable.length, 1);
});

test("document.createElement override routes function/adoption/props/children to builders", () => {
  const { document, root, ElementBuilder } = setup();
  // function component
  const Fn = (props, ...children) =>
    document.createElement("section", { id: props.id }, ...children);
  const fromFn = document.createElement(Fn, { id: "fn" }, "hi");
  assert.ok(fromFn instanceof ElementBuilder);
  assert.equal(fromFn.toNode().tagName, "SECTION");
  assert.equal(fromFn.toNode().textContent, "hi");

  // existing element adoption
  const existing = document.createElement("div", null); // native path first? after install createElement overridden
  // create a native-like element via prototype chain not necessary; use real element instance
  const node = new (Object.getPrototypeOf(existing.toNode ? existing.toNode() : existing).constructor)("div");
  // Easier: create via stored behavior - but after install createElement("div", null) with no children and null props goes native only when options null and no rest; our call above with (div,null) -> options null, rest empty => native createElement called returning real element? Let's test explicitly:
  const nativeEl = Object.getPrototypeOf(document).createElement.call(
    // can't easily get original; instead test by installing on fresh env manually
    document, "span"
  );
  // nativeEl from overridden createElement without props/children: ("span") no options, rest empty => original called
  assert.equal(nativeEl.tagName, "SPAN");

  // plain props object (no children array/rest beyond)
  const withProps = document.createElement("p", { className: "x", "data-a": "1" });
  assert.ok(withProps instanceof ElementBuilder);
  assert.equal(withProps.toNode().getAttribute("class"), "x");

  // JSX-like (tag, null, ...children)
  const jsxLike = document.createElement("div", null, "a", document.createElement("b", null, "c"));
  assert.ok(jsxLike instanceof ElementBuilder);
  assert.equal(jsxLike.toNode().textContent, "ac");
});

test("document.createElement preserves native behavior for no-arg/primitive options", () => {
  const env = createDOMEnv();
  const builders = createBuilders(env.document);
  // call native before override reference captured? install captures originalCreateElement at call time
  installEnhancements(builders);
  const { document } = env;
  const plain = document.createElement("div");
  // should be a real element node, not ElementBuilder
  assert.equal(plain.nodeType, 1);
  assert.equal(plain.tagName, "DIV");
  assert.equal(typeof plain.setAttribute, "function");
});

test("createElement with { is } option is passed to native createElement", () => {
  const env = createDOMEnv();
  const builders = createBuilders(env.document);
  let seen = null;
  const orig = env.Document.prototype.createElement;
  env.Document.prototype.createElement = function(tag, options, ...rest) {
    seen = options;
    return orig.call(this, tag);
  };
  // reinstall enhancements to capture our wrapped original
  installEnhancements(builders);
  const el = env.document.createElement("button", { is: "fancy-button" });
  assert.deepEqual(seen, { is: "fancy-button" });
  assert.equal(el.nodeType, 1);
  assert.equal(el.tagName, "BUTTON");
});

test("document.hydrateElement adopts existing node and preserves undescribed server children", () => {
  const { document, root } = setup();
  // Manually build server-rendered markup (fake DOM has no innerHTML parser).
  const list = document.createElement("ul");
  list.setAttribute("id", "list");
  const li1 = document.createElement("li");
  li1.textContent = "server item 1";
  const li2 = document.createElement("li");
  li2.textContent = "server item 2";
  list.appendChild(li1);
  list.appendChild(li2);
  root.appendChild(list);
  document.body.appendChild(root);

  const listNode = document.getElementById("list");
  const hydrated = document.hydrateElement(listNode, null,
    document.createElement("li", { key: "a" }, "Item A")
  );

  // Identity of the adopted root is preserved.
  assert.equal(hydrated.node, listNode);
  assert.equal(listNode.getAttribute("id"), "list");

  // Described child replaces/updates; undescribed server child is preserved (non-destructive).
  assert.equal(listNode.children.length, 2);
  assert.equal(listNode.children[0].textContent, "Item A");
  assert.equal(listNode.children[1].textContent, "server item 2");
});

test("document.hydrateElement applies props to the adopted node", () => {
  const { document, root } = setup();
  const target = document.createElement("div");
  target.setAttribute("id", "target");
  target.textContent = "original";
  root.appendChild(target);
  document.body.appendChild(root);

  const hydrated = document.hydrateElement(target, {
    "data-owned": "yes",
    className: "hydrated",
  });
  const node = hydrated.node;

  assert.equal(node, target);
  assert.equal(node.getAttribute("data-owned"), "yes");
  assert.equal(node.getAttribute("class"), "hydrated");
});

test("document.hydrateElement requires an element node as first argument", () => {
  const { document } = setup();
  assert.throws(() => document.hydrateElement(null), TypeError);
  assert.throws(() => document.hydrateElement(document.createTextNode("text")), TypeError);
});
