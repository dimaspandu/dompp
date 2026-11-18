import { createBuilders } from "/src/builders/index.js";

const { test, equal, ok, notEqual } = harness;

function freshRoot() {
  const root = document.createElement("div");
  document.body.appendChild(root);
  return root;
}

test("component returns rendered element with rerender and patches in place", async () => {
  const { elementBuilder, componentBuilder } = createBuilders(document);
  const root = freshRoot();
  let count = 0;

  const counter = componentBuilder((rerender) =>
    elementBuilder("button", { id: "c", onClick: () => rerender(() => count++) }, `count:${count}`)
  );

  equal(typeof counter.rerender, "function");
  equal(typeof counter.toNode, "function");
  root.appendChild(counter.toNode());
  equal(counter.node.textContent, "count:0");
  const firstNode = counter.node;

  counter.rerender(() => count++);
  equal(counter.node.textContent, "count:1");
  equal(counter.node, firstNode);
  equal(counter.node.parentNode, root);

  counter.node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  equal(counter.node.textContent, "count:2");
});

test("array-returning component reconciles per slot and supports direct rerender", async () => {
  const { elementBuilder, componentBuilder } = createBuilders(document);
  const root = freshRoot();
  let n = 0;
  let extra = false;

  const list = componentBuilder(() => [
    elementBuilder("span", { key: "a" }, `A${n}`),
    extra ? elementBuilder("span", { key: "b" }, "B") : null,
    elementBuilder("button", { key: "act" }, "act"),
  ]);

  ok(Array.isArray(list));
  equal(typeof list.rerender, "function");
  for (const child of list) {
    if (child && child.toNode) root.appendChild(child.toNode());
  }
  equal(root.querySelectorAll("span").length, 1);
  equal(root.querySelector("span").textContent, "A0");

  extra = true;
  list.rerender();
  equal(root.querySelectorAll("span").length, 2);
  equal(root.querySelectorAll("span")[1].textContent, "B");

  n = 1;
  extra = false;
  list.rerender();
  equal(root.querySelectorAll("span").length, 1);
  equal(root.querySelector("span").textContent, "A1");
});

test("components can rerender each other directly via held references", async () => {
  const { elementBuilder, componentBuilder } = createBuilders(document);
  const root = freshRoot();
  let a = 0;
  let b = 0;

  const compA = componentBuilder((rerender) =>
    elementBuilder("div", { id: "ca" },
      elementBuilder("p", null, `A:${a}`),
      elementBuilder("button", { id: "inc-b", onClick: () => { b++; compB.rerender(); } }, "inc b"),
      elementBuilder("button", { id: "inc-a", onClick: () => rerender(() => a++) }, "inc a"),
    )
  );

  const compB = componentBuilder((rerender) =>
    elementBuilder("div", { id: "cb" },
      elementBuilder("p", null, `B:${b}`),
      elementBuilder("button", { id: "inc-a2", onClick: () => { a++; compA.rerender(); } }, "inc a"),
    )
  );

  root.appendChild(compA.toNode());
  root.appendChild(compB.toNode());

  compA.node.querySelector("#inc-b").dispatchEvent(new MouseEvent("click", { bubbles: true }));
  equal(compB.node.querySelector("p").textContent, "B:1");

  compB.node.querySelector("#inc-a2").dispatchEvent(new MouseEvent("click", { bubbles: true }));
  equal(compA.node.querySelector("p").textContent, "A:1");
});

test("component root tag change preserves element identity and rerender capability", async () => {
  const { elementBuilder, componentBuilder } = createBuilders(document);
  const root = freshRoot();
  let asP = false;

  const c = componentBuilder(() =>
    asP ? elementBuilder("p", null, "P") : elementBuilder("div", null, "D")
  );

  root.appendChild(c.toNode());
  equal(c.node.tagName.toLowerCase(), "div");
  const ref = c;
  asP = true;
  ref.rerender();
  equal(ref, c);
  equal(ref.node.tagName.toLowerCase(), "p");
  equal(ref.node.textContent, "P");
  equal(typeof ref.rerender, "function");
});
