import test from "node:test";
import assert from "node:assert/strict";

import {
  elementBuilder,
  componentBuilder,
} from "../../src/1.2.0/element-builder.js";
import { installBuilderApis } from "../../src/1.2.0/install-builder-apis.js";

class FakeNode {
  static TEXT_NODE = 3;

  constructor(nodeType) {
    this.nodeType = nodeType;
    this.parentNode = null;
    this.childNodes = [];
    this.nodeValue = null;
  }

  get nextSibling() {
    if (!this.parentNode) return null;
    const index = this.parentNode.childNodes.indexOf(this);
    return this.parentNode.childNodes[index + 1] ?? null;
  }

  get firstChild() {
    return this.childNodes[0] ?? null;
  }

  get textContent() {
    if (this.nodeType === FakeNode.TEXT_NODE) return this.nodeValue;
    return this.childNodes.map((child) => child.textContent).join("");
  }

  set textContent(value) {
    this.replaceChildren(globalThis.document.createTextNode(String(value)));
  }

  appendChild(node) {
    return this.insertBefore(node, null);
  }

  insertBefore(node, anchor) {
    if (anchor != null && anchor.parentNode !== this) {
      throw new Error("The anchor is not a child of this node.");
    }
    if (node === anchor) return node;
    if (node.parentNode) node.parentNode.removeChild(node);
    const index = anchor == null ? this.childNodes.length : this.childNodes.indexOf(anchor);
    this.childNodes.splice(index, 0, node);
    node.parentNode = this;
    return node;
  }

  removeChild(node) {
    const index = this.childNodes.indexOf(node);
    if (index < 0) throw new Error("Node is not a child.");
    this.childNodes.splice(index, 1);
    node.parentNode = null;
    return node;
  }

  replaceChild(nextNode, previousNode) {
    if (nextNode === previousNode) return previousNode;
    const anchor = previousNode.nextSibling;
    this.removeChild(previousNode);
    this.insertBefore(nextNode, anchor);
    return previousNode;
  }

  replaceChildren(...nodes) {
    for (const child of [...this.childNodes]) this.removeChild(child);
    for (const node of nodes) this.appendChild(node);
  }
}

class FakeText extends FakeNode {
  constructor(value) {
    super(FakeNode.TEXT_NODE);
    this.nodeValue = String(value);
  }
}

class FakeElement extends FakeNode {
  constructor(tagName, namespaceURI = "http://www.w3.org/1999/xhtml") {
    super(1);
    this.tagName = tagName.toUpperCase();
    this.namespaceURI = namespaceURI;
    this.attributes = new Map();
    this.styleValues = new Map();
    this.style = new Proxy({
      setProperty: (name, value) => this.styleValues.set(name, String(value)),
      removeProperty: (name) => this.styleValues.delete(name),
    }, {
      set: (target, name, value) => {
        this.styleValues.set(name, String(value));
        target[name] = String(value);
        return true;
      },
    });
    this.listeners = new Map();
  }

  get children() {
    return this.childNodes.filter((child) => child.nodeType === 1);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  addEventListener(name, handler) {
    this.listeners.set(name, handler);
  }

  removeEventListener(name, handler) {
    if (this.listeners.get(name) === handler) this.listeners.delete(name);
  }

  dispatchEvent(event) {
    this.listeners.get(event.type)?.(event);
  }
}

globalThis.Node = FakeNode;
globalThis.Document = class FakeDocument {};
globalThis.document = {
  createElement: (tag) => new FakeElement(tag),
  createElementNS: (namespace, tag) => new FakeElement(tag, namespace),
  createTextNode: (text) => new FakeText(text),
};
Object.setPrototypeOf(globalThis.document, Document.prototype);
installBuilderApis();

test("builders stay independent, reconcile keyed lists, arrays, fragments, and components", () => {
  assert.equal(FakeElement.prototype.setState, undefined);
  assert.equal(typeof document.elementBuilder, "function");
  assert.equal(typeof document.componentBuilder, "function");

  const mountPoint = new FakeElement("main");
  const mounted = document.elementBuilder(
    mountPoint,
    null,
    elementBuilder("p", { key: "stable" }, "mounted through elementBuilder")
  );
  assert.equal(mounted, mountPoint);
  assert.equal(mountPoint.firstChild.textContent, "mounted through elementBuilder");
  const mountedChild = mountPoint.firstChild;
  document.elementBuilder(
    mountPoint,
    null,
    elementBuilder("p", { key: "stable" }, "updated"),
    elementBuilder("span", null, "added")
  );
  assert.equal(mountPoint.firstChild, mountedChild);
  assert.equal(mountPoint.firstChild.textContent, "updated");
  assert.equal(mountPoint.childNodes.length, 2);

  const list = elementBuilder(
    "ul",
    null,
    ...["a", "b", "c"].map((key) => elementBuilder("li", { key }, key))
  );
  const listNode = list.toNode();
  const originalNodes = new Map(
    list.struct.children.map((child) => [child.struct.key, child.node])
  );

  list.setChildren(
    ...["c", "a", "d", "b"].map((key) => elementBuilder("li", { key }, key))
  );

  assert.deepEqual(
    listNode.childNodes.map((node) => node.textContent),
    ["c", "a", "d", "b"]
  );
  assert.equal(listNode.childNodes[0], originalNodes.get("c"));
  assert.equal(listNode.childNodes[1], originalNodes.get("a"));
  assert.equal(listNode.childNodes[3], originalNodes.get("b"));

  const arrayComponent = () => [
    elementBuilder("span", { key: "one" }, "one"),
    elementBuilder("span", { key: "two" }, "two"),
  ];
  const arrayParent = elementBuilder(
    "section",
    null,
    elementBuilder(arrayComponent, null)
  ).toNode();
  assert.equal(arrayParent.childNodes.length, 2);

  const fragmentParent = elementBuilder(
    "section",
    null,
    elementBuilder.fragment(
      elementBuilder("span", null, "one"),
      elementBuilder("span", null, "two")
    )
  ).toNode();
  assert.equal(fragmentParent.childNodes.length, 1);
  assert.equal(fragmentParent.firstChild.tagName, "FRAGMENT");
  assert.equal(fragmentParent.firstChild.childNodes.length, 2);
  assert.equal(fragmentParent.firstChild.styleValues.get("display"), "contents");

  let count = 0;
  const counter = componentBuilder((rerender) =>
    elementBuilder("button", {
      onClick: () => {
        count += 1;
        rerender();
      },
    }, count)
  );
  const button = counter.render();
  button.dispatchEvent({ type: "click" });
  assert.equal(counter.render(), button);
  assert.equal(button.textContent, "1");
});

test("duplicate sibling keys are rejected", () => {
  const list = elementBuilder("ul", null,
    elementBuilder("li", { key: "same" }, "first"),
    elementBuilder("li", { key: "same" }, "second")
  );

  assert.throws(() => list.toNode(), /Duplicate child key/);
});
