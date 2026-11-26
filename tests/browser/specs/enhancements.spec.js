import { createBuilders } from "/src/builders/index.js";
import { installEnhancements } from "/src/enhancements/index.js";

const { test, equal, ok, deepEqual } = harness;

function freshEnv() {
  const builders = createBuilders(document);
  installEnhancements(builders);
  const root = document.createElement("div");
  document.body.appendChild(root);
  return { ...builders, root };
}

test("Element prototype setters are installed and chainable", async () => {
  const { root } = freshEnv();
  let clicked = 0;
  const el = document.createElement("button");

  const r1 = el.setAttributes({ id: "b", "data-x": "1", disabled: false });
  const r2 = el.setStyles({ color: "red", marginTop: "2px" });
  const r3 = el.setEvents({ click: () => clicked++ });
  const r4 = el.setChildren(["hi"]);
  ok(r1 && r1.toNode() === el);
  ok(r2 && r2.toNode() === el);
  ok(r3 && r3.toNode() === el);
  ok(r4 && r4.toNode() === el);
  equal(el.getAttribute("id"), "b");
  equal(el.getAttribute("data-x"), "1");
  equal(el.getAttribute("disabled"), null);
  equal(el.style.color, "red");
  equal(el.style.marginTop, "2px");
  equal(el.textContent, "hi");

  root.appendChild(el);
  el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  equal(clicked, 1);
  el.setText("bye");
  equal(el.textContent, "bye");
});

test("DocumentFragment prototype setChildren/setText return flat child arrays", async () => {
  const { elementBuilder } = freshEnv();
  const frag = document.createDocumentFragment();
  ok(Array.isArray(frag));
  equal(typeof frag.setChildren, "function");
  equal(typeof frag.setText, "function");
  frag.setChildren([elementBuilder("span", null, "a"), "b"]);
  equal(frag.length, 2);
  frag.setText("only");
  deepEqual(frag, ["only"]);
});

test("document.createComponent returns a rendered component with rerender", async () => {
  const { root } = freshEnv();
  let n = 0;
  const comp = document.createComponent((rerender) =>
    document.createElement("div", null,
      document.createElement("span", null, String(n)),
      document.createElement("button", { onClick: () => rerender(() => n++) }, "+")
    )
  );
  equal(typeof comp.rerender, "function");
  root.appendChild(comp.toNode());
  equal(comp.node.querySelector("span").textContent, "0");
  comp.rerender(() => n++);
  equal(comp.node.querySelector("span").textContent, "1");
});

test("document.createDocumentFragment returns flat array and supports pragma/mutable forms", async () => {
  const { elementBuilder, ElementBuilder } = freshEnv();
  const empty = document.createDocumentFragment();
  ok(Array.isArray(empty));
  equal(empty.length, 0);

  const withChildren = document.createDocumentFragment(
    elementBuilder("i", null, "a"),
    "b"
  );
  ok(Array.isArray(withChildren));
  equal(withChildren.length, 2);
  ok(withChildren[0] instanceof ElementBuilder);
  equal(withChildren[1], "b");

  const pragma = document.createDocumentFragment(null,
    elementBuilder("em", null, "x"),
    "y"
  );
  equal(pragma.length, 2);
  equal(pragma[0].struct.tag, "em");

  const mutable = document.createDocumentFragment().setChildren([
    elementBuilder("b", null, "n"),
  ]);
  equal(mutable.length, 1);
});

test("document.createElement override routes function/adoption/props/children to builders", async () => {
  const { ElementBuilder } = freshEnv();

  const Fn = (props, ...children) =>
    document.createElement("section", { id: props.id }, ...children);
  const fromFn = document.createElement(Fn, { id: "fn" }, "hi");
  ok(fromFn instanceof ElementBuilder);
  equal(fromFn.toNode().tagName.toLowerCase(), "section");
  equal(fromFn.toNode().textContent, "hi");

  const nativeEl = document.createElement("span");
  equal(nativeEl.nodeType, 1);
  equal(nativeEl.tagName.toLowerCase(), "span");
  ok(!(nativeEl instanceof ElementBuilder));

  const withProps = document.createElement("p", { className: "x", "data-a": "1" });
  ok(withProps instanceof ElementBuilder);
  equal(withProps.toNode().getAttribute("class"), "x");
  equal(withProps.toNode().getAttribute("data-a"), "1");

  const jsxLike = document.createElement("div", null, "a", document.createElement("b", null, "c"));
  ok(jsxLike instanceof ElementBuilder);
  equal(jsxLike.toNode().textContent, "ac");
});

test("document.createElement adopts an existing element node", async () => {
  freshEnv();
  const existing = document.createElement("div");
  existing.innerHTML = "<span>hi</span>";
  document.body.appendChild(existing);
  const adopted = document.createElement(existing, { "data-owned": "yes" },
    document.createElement("span", null, "updated")
  );
  ok(adopted.toNode() === existing);
  equal(existing.getAttribute("data-owned"), "yes");
  equal(existing.querySelector("span").textContent, "updated");
});

test("document.hydrateElement adopts existing node and preserves undescribed server children", async () => {
  freshEnv();
  // Manually build server-rendered markup.
  const list = document.createElement("ul");
  list.setAttribute("id", "list");
  const li1 = document.createElement("li");
  li1.textContent = "server item 1";
  const li2 = document.createElement("li");
  li2.textContent = "server item 2";
  list.appendChild(li1);
  list.appendChild(li2);
  document.body.appendChild(list);

  const listNode = document.getElementById("list");
  const hydrated = document.hydrateElement(listNode, null,
    document.createElement("li", { key: "a" }, "Item A")
  );

  // Identity of the adopted root is preserved.
  ok(hydrated.toNode() === listNode);
  equal(listNode.getAttribute("id"), "list");

  // Described child replaces; undescribed server child is preserved (non-destructive).
  equal(listNode.children.length, 2);
  equal(listNode.children[0].textContent, "Item A");
  equal(listNode.children[1].textContent, "server item 2");
});

test("document.hydrateElement applies props to the adopted node", async () => {
  freshEnv();
  const target = document.createElement("div");
  target.setAttribute("id", "target");
  target.textContent = "original";
  document.body.appendChild(target);

  const hydrated = document.hydrateElement(target, {
    "data-owned": "yes",
    className: "hydrated",
  });
  const node = hydrated.toNode();

  ok(node === target);
  equal(node.getAttribute("data-owned"), "yes");
  equal(node.getAttribute("class"), "hydrated");
});
