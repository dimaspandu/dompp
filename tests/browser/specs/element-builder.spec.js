import { createBuilders } from "/src/builders/index.js";

const { test, equal, ok, notEqual } = harness;

function freshRoot() {
  const root = document.createElement("div");
  root.id = "root-" + Math.random().toString(36).slice(2);
  document.body.appendChild(root);
  return root;
}

test("elementBuilder builds elements with props, styles, events, and children", async () => {
  const { elementBuilder, ElementBuilder } = createBuilders(document);
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

  ok(builder instanceof ElementBuilder, "instanceof ElementBuilder");
  const node = builder.toNode();
  equal(node.tagName.toLowerCase(), "button");
  equal(node.getAttribute("id"), "btn");
  equal(node.getAttribute("class"), "primary");
  equal(node.getAttribute("data-x"), "1");
  equal(node.style.color, "red");
  equal(node.style.fontWeight, "700");
  equal(node.textContent, "Hello world");
  node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  equal(clicks, 1);
});

test("setText, setChildren, setAttributes/setStyles, reset, and chaining", async () => {
  const { elementBuilder } = createBuilders(document);
  const root = freshRoot();
  const el = elementBuilder("div", { id: "box" }).setText("A");
  const node = el.toNode();
  root.appendChild(node);
  equal(node.textContent, "A");

  el.setChildren([elementBuilder("span", null, "B"), " and ", "C", null, false]);
  equal(node.textContent, "B and C");

  el.setAttributes({ "data-v": "x", title: "t" }).setStyles({ marginTop: "4px" });
  equal(node.getAttribute("data-v"), "x");
  equal(node.getAttribute("title"), "t");
  equal(node.style.marginTop, "4px");

  el.reset();
  equal(node.childNodes.length, 0);
  equal(node.getAttribute("id"), null);
});

test("keyed reconciliation preserves identity, moves, inserts, removes, and replaces by tag", async () => {
  const { elementBuilder } = createBuilders(document);
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

  equal(ul.children.length, 4);
  equal(ul.children[0], c);
  equal(ul.children[1], a);
  equal(ul.children[1].textContent, "A2");
  notEqual(ul.children[2], b);
  equal(ul.children[2].tagName.toLowerCase(), "p");
  equal(ul.children[2].textContent, "B");
  equal(ul.children[3].textContent, "D");
});

test("adopting an existing element preserves identity and attaches behavior", async () => {
  const { elementBuilder } = createBuilders(document);
  const root = freshRoot();
  root.innerHTML = `<section id="adopt-box"><span>hi</span></section>`;
  const existing = root.querySelector("#adopt-box");
  let clicked = 0;

  const builder = elementBuilder(existing, { "data-owned": "yes", onClick: () => clicked++ },
    elementBuilder("span", null, "updated"),
    elementBuilder("em", null, "more"),
  );
  const node = builder.toNode();
  equal(node, existing);
  equal(node.getAttribute("data-owned"), "yes");
  equal(node.querySelector("span").textContent, "updated");
  equal(node.querySelector("em").textContent, "more");
  node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  equal(clicked, 1);
});

test("event handlers are replaced on update (no accumulation)", async () => {
  const { elementBuilder } = createBuilders(document);
  let a = 0;
  let b = 0;
  const btn = elementBuilder("button", { onClick: () => a++ });
  const node = btn.toNode();
  node.dispatchEvent(new MouseEvent("click"));
  equal(a, 1);
  btn.setEvents({ click: () => b++ });
  node.dispatchEvent(new MouseEvent("click"));
  equal(a, 1);
  equal(b, 1);
});

test("elementBuilder.fragment returns a flat, updatable child array", async () => {
  const { elementBuilder } = createBuilders(document);
  const frag = elementBuilder.fragment(
    elementBuilder("span", null, "x"),
    [elementBuilder("i", null, "y")],
    "z"
  );
  ok(Array.isArray(frag));
  equal(frag.length, 3);
  equal(typeof frag.setChildren, "function");
  equal(typeof frag.setText, "function");
  frag.setText("only");
  equal(frag.length, 1);
  equal(frag[0], "only");
  frag.setChildren([elementBuilder("b", null, "n")]);
  equal(frag.length, 1);
  equal(frag[0].struct.tag, "b");
});

test("createBuilders composes element and component foundations", async () => {
  const b = createBuilders(document);
  equal(typeof b.ElementBuilder, "function");
  equal(typeof b.elementBuilder, "function");
  equal(typeof b.ComponentBuilder, "function");
  equal(typeof b.componentBuilder, "function");
  const node = b.elementBuilder("p", null, "x").toNode();
  equal(node.textContent, "x");
});
