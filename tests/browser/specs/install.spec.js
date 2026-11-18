import { createBuilders } from "/src/builders/index.js";
import { installEnhancements } from "/src/enhancements/index.js";

const { test, equal, ok } = harness;

test("installEnhancements + builders work with real browser document", async () => {
  const builders = createBuilders(document);
  installEnhancements(builders);

  equal(typeof document.createComponent, "function");
  equal(typeof Element.prototype.setChildren, "function");
  equal(typeof DocumentFragment.prototype.setChildren, "function");
  equal(typeof builders.ElementBuilder, "function");
  equal(typeof builders.elementBuilder, "function");
  equal(typeof builders.ComponentBuilder, "function");
  equal(typeof builders.componentBuilder, "function");

  const root = document.createElement("div");
  document.body.appendChild(root);

  let count = 0;
  const counter = document.createComponent((rerender) =>
    document.createElement("button", { onClick: () => rerender(() => count++) }, `n:${count}`)
  );

  root.setChildren([counter]);
  equal(root.querySelector("button").textContent, "n:0");
  counter.rerender(() => count++);
  equal(root.querySelector("button").textContent, "n:1");
});

test("cross-component rerender works in browser via enhancements", async () => {
  const builders = createBuilders(document);
  installEnhancements(builders);
  const root = document.createElement("div");
  document.body.appendChild(root);

  let a = 0;
  let b = 0;
  const compA = document.createComponent((rerender) =>
    document.createElement("div", { id: "xa" },
      document.createElement("p", null, `A:${a}`),
      document.createElement("button", { id: "bump-b", onClick: () => { b++; compB.rerender(); } }, "b"),
      document.createElement("button", { id: "bump-a", onClick: () => rerender(() => a++) }, "a"),
    )
  );
  const compB = document.createComponent((rerender) =>
    document.createElement("div", { id: "xb" },
      document.createElement("p", null, `B:${b}`),
      document.createElement("button", { id: "bump-a2", onClick: () => { a++; compA.rerender(); } }, "a"),
    )
  );

  root.setChildren([compA, compB]);
  compA.node.querySelector("#bump-b").dispatchEvent(new MouseEvent("click", { bubbles: true }));
  equal(compB.node.querySelector("p").textContent, "B:1");
  compB.node.querySelector("#bump-a2").dispatchEvent(new MouseEvent("click", { bubbles: true }));
  equal(compA.node.querySelector("p").textContent, "A:1");
});

test("createDOMPP entry auto-installs window.DOMPP in browser", async () => {
  // src/index.js installs window.DOMPP on import in a windowed environment
  await import("/src/index.js");
  ok(window.DOMPP, "window.DOMPP should be set");
  equal(window.DOMPP.version, "1.6.8");
  equal(typeof window.DOMPP.elementBuilder, "function");
  equal(typeof window.DOMPP.componentBuilder, "function");
  equal(typeof window.DOMPP.ElementBuilder, "function");
});

test("installDOMPP return shape includes version and builder APIs", async () => {
  const { installDOMPP } = await import("/src/install/install-dompp.js");
  const api = installDOMPP(document);
  equal(api.version, "1.6.8");
  equal(typeof api.ElementBuilder, "function");
  equal(typeof api.elementBuilder, "function");
  equal(typeof api.ComponentBuilder, "function");
  equal(typeof api.componentBuilder, "function");
  equal(typeof api.asFragmentChildren, "function");
  equal(typeof api.normalizeChildren, "function");
});
