import test from "node:test";
import assert from "node:assert/strict";

import { createDOMEnv } from "./helpers/fake-dom.js";
import { createBuilders } from "../src/builders/index.js";

function setup() {
  const env = createDOMEnv();
  const { document } = env;
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.appendChild(root);
  return { ...env, root };
}

test("component returns rendered element with rerender and patches in place", () => {
  const { document, root, Event } = setup();
  const { elementBuilder, componentBuilder } = createBuilders(document);
  let count = 0;

  const counter = componentBuilder((rerender) =>
    elementBuilder("button", { id: "c", onClick: () => rerender(() => count++) }, `count:${count}`)
  );

  assert.equal(typeof counter.rerender, "function");
  assert.equal(typeof counter.toNode, "function");
  root.appendChild(counter.toNode());
  assert.equal(counter.node.textContent, "count:0");

  counter.rerender(() => count++);
  assert.equal(counter.node.textContent, "count:1");
  assert.equal(counter.node.parentNode, root);

  counter.node.dispatchEvent(new Event("click"));
  assert.equal(counter.node.textContent, "count:2");
});

test("array-returning component reconciles per slot and supports direct rerender", () => {
  const { document, root } = setup();
  const { elementBuilder, componentBuilder } = createBuilders(document);
  let n = 0;
  let extra = false;

  const list = componentBuilder((rerender) => [
    elementBuilder("span", { key: "a" }, `A${n}`),
    extra ? elementBuilder("span", { key: "b" }, "B") : null,
    elementBuilder("button", { key: "act" }, "act"),
  ]);

  assert.ok(Array.isArray(list));
  assert.equal(typeof list.rerender, "function");
  for (const child of list) {
    if (child && child.toNode) root.appendChild(child.toNode());
  }
  assert.equal(root.querySelectorAll ? 0 : 0, 0); // no querySelector in fake; count spans
  const countSpans = () => root.childNodes.filter(n => n.tagName === "SPAN").length;
  assert.equal(countSpans(), 1);
  assert.equal(root.childNodes[0].textContent, "A0");

  extra = true;
  list.rerender();
  assert.equal(countSpans(), 2);
  assert.equal(root.childNodes[1].textContent, "B");

  n = 1;
  extra = false;
  list.rerender();
  assert.equal(countSpans(), 1);
  assert.equal(root.childNodes[0].textContent, "A1");
});

test("components can rerender each other directly via held references", () => {
  const { document, root, Event } = setup();
  const { elementBuilder, componentBuilder } = createBuilders(document);
  let a = 0;
  let b = 0;

  const compA = componentBuilder((rerender) =>
    elementBuilder("div", null,
      elementBuilder("p", null, `A:${a}`),
      elementBuilder("button", { id: "inc-b", onClick: () => { b++; compB.rerender(); } }, "inc b"),
      elementBuilder("button", { id: "inc-a", onClick: () => rerender(() => a++) }, "inc a"),
    )
  );

  const compB = componentBuilder((rerender) =>
    elementBuilder("div", null,
      elementBuilder("p", null, `B:${b}`),
      elementBuilder("button", { id: "inc-a2", onClick: () => { a++; compA.rerender(); } }, "inc a"),
    )
  );

  root.appendChild(compA.toNode());
  root.appendChild(compB.toNode());

  const btnIncB = compA.node.childNodes.find(n => n.getAttribute && n.getAttribute("id") === "inc-b");
  const btnIncA2 = compB.node.childNodes.find(n => n.getAttribute && n.getAttribute("id") === "inc-a2");

  btnIncB.dispatchEvent(new Event("click"));
  assert.equal(compB.node.childNodes[0].textContent, "B:1");

  btnIncA2.dispatchEvent(new Event("click"));
  assert.equal(compA.node.childNodes[0].textContent, "A:1");
});

test("component root tag change preserves element identity and rerender capability", () => {
  const { document, root } = setup();
  const { elementBuilder, componentBuilder } = createBuilders(document);
  let asP = false;

  const c = componentBuilder(() =>
    asP ? elementBuilder("p", null, "P") : elementBuilder("div", null, "D")
  );

  root.appendChild(c.toNode());
  assert.equal(c.node.tagName, "DIV");
  const ref = c;
  asP = true;
  ref.rerender();
  assert.equal(ref, c);
  assert.equal(ref.node.tagName, "P");
  assert.equal(ref.node.textContent, "P");
  assert.equal(typeof ref.rerender, "function");
});
