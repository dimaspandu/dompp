/**
 * Minimal DOM environment for running DOM++ builder tests in Node.
 * Implements only the APIs required by src/builders and src/enhancements.
 * Each call returns fresh constructors/prototypes for isolation.
 */

export function createDOMEnv({ url = "http://localhost/" } = {}) {
  class FakeNode {
    static ELEMENT_NODE = 1;
    static TEXT_NODE = 3;
    static DOCUMENT_FRAGMENT_NODE = 11;

    constructor(nodeType) {
      this.nodeType = nodeType;
      this.parentNode = null;
      this.childNodes = [];
      this.nodeValue = null;
    }

    get nextSibling() {
      if (!this.parentNode) return null;
      const index = this.parentNode.childNodes.indexOf(this);
      return index < 0 ? null : (this.parentNode.childNodes[index + 1] ?? null);
    }

    get firstChild() {
      return this.childNodes[0] ?? null;
    }

    appendChild(node) {
      if (node.nodeType === FakeNode.DOCUMENT_FRAGMENT_NODE) {
        const children = [...node.childNodes];
        for (const child of children) this.appendChild(child);
        return node;
      }
      return this.insertBefore(node, null);
    }

    insertBefore(node, anchor) {
      if (node.nodeType === FakeNode.DOCUMENT_FRAGMENT_NODE) {
        const children = [...node.childNodes];
        for (const child of children) this.insertBefore(child, anchor);
        return node;
      }
      if (anchor != null && anchor.parentNode !== this) {
        throw new Error("The node before which the new node is to be inserted is not a child of this node.");
      }
      if (node === anchor) return node;
      if (node.parentNode) node.parentNode.removeChild(node);
      const index = anchor == null ? this.childNodes.length : this.childNodes.indexOf(anchor);
      if (index < 0) throw new Error("Anchor not found.");
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
      if (previousNode.parentNode !== this) throw new Error("Node is not a child.");
      const anchor = previousNode.nextSibling;
      this.removeChild(previousNode);
      this.insertBefore(nextNode, anchor);
      return previousNode;
    }

    replaceChildren(...nodes) {
      for (const child of [...this.childNodes]) this.removeChild(child);
      for (const node of nodes) this.appendChild(node);
    }

    get textContent() {
      if (this.nodeType === FakeNode.TEXT_NODE) return this.nodeValue;
      let out = "";
      for (const child of this.childNodes) out += child.textContent ?? "";
      return out;
    }

    set textContent(value) {
      this.replaceChildren();
      if (value != null && value !== "") {
        this.appendChild(new FakeText(String(value)));
      }
    }

    contains(node) {
      if (node === this) return true;
      for (const child of this.childNodes) {
        if (child === node || (child.contains && child.contains(node))) return true;
      }
      return false;
    }
  }

  class FakeText extends FakeNode {
    constructor(value) {
      super(FakeNode.TEXT_NODE);
      this.nodeValue = String(value);
      this.ownerDocument = null;
    }
  }

  class FakeDocumentFragment extends FakeNode {
    constructor() {
      super(FakeNode.DOCUMENT_FRAGMENT_NODE);
      this.ownerDocument = null;
    }
  }

  class FakeStyle {
    constructor() {
      this._props = new Map();
    }
    get length() {
      return this._props.size;
    }
    item(index) {
      return [...this._props.keys()][index] ?? "";
    }
    setProperty(name, value) {
      this._props.set(String(name), String(value));
    }
    getPropertyValue(name) {
      return this._props.get(String(name)) ?? "";
    }
    removeProperty(name) {
      this._props.delete(String(name));
    }
    [Symbol.iterator]() {
      return this._props.keys();
    }
  }

  class FakeElement extends FakeNode {
    constructor(tagName, namespaceURI = "http://www.w3.org/1999/xhtml") {
      super(FakeNode.ELEMENT_NODE);
      this.tagName = String(tagName).toUpperCase();
      this.namespaceURI = namespaceURI;
      this.ownerDocument = null;
      this._attributes = new Map();
      this._styleStore = new FakeStyle();
      this._listeners = new Map();

      this.style = new Proxy(this._styleStore, {
        get: (target, prop) => {
          if (prop === "length") return target.length;
          if (prop === "item") return target.item.bind(target);
          if (prop === "setProperty") return target.setProperty.bind(target);
          if (prop === "getPropertyValue") return target.getPropertyValue.bind(target);
          if (prop === "removeProperty") return target.removeProperty.bind(target);
          if (prop === Symbol.iterator) return target[Symbol.iterator].bind(target);
          if (typeof prop === "string" && /^\d+$/.test(prop)) return target.item(Number(prop));
          if (prop in target) return target[prop];
          const v = target.getPropertyValue(prop);
          return v || target[prop];
        },
        set: (target, prop, value) => {
          if (value == null || value === "") {
            target.removeProperty(prop);
          } else {
            target.setProperty(prop, value);
          }
          return true;
        },
      });
    }

    get attributes() {
      const entries = [...this._attributes.entries()].map(([name, value]) => ({ name, value }));
      entries[Symbol.iterator] = Array.prototype[Symbol.iterator];
      return entries;
    }

    setAttribute(name, value) {
      this._attributes.set(String(name), String(value));
    }

    getAttribute(name) {
      const k = String(name);
      return this._attributes.has(k) ? this._attributes.get(k) : null;
    }

    hasAttribute(name) {
      return this._attributes.has(String(name));
    }

    removeAttribute(name) {
      this._attributes.delete(String(name));
    }

    get children() {
      return this.childNodes.filter((n) => n.nodeType === FakeNode.ELEMENT_NODE);
    }

    addEventListener(type, handler) {
      if (typeof handler !== "function") return;
      if (!this._listeners.has(type)) this._listeners.set(type, new Set());
      this._listeners.get(type).add(handler);
    }

    removeEventListener(type, handler) {
      this._listeners.get(type)?.delete(handler);
    }

    dispatchEvent(event) {
      if (!event.target) event.target = this;
      const listeners = this._listeners.get(event.type);
      if (listeners) {
        for (const fn of [...listeners]) fn.call(this, event);
      }
      return true;
    }

    get id() { return this.getAttribute("id") ?? ""; }
    set id(v) { this.setAttribute("id", v); }

    querySelector() { return null; }
    querySelectorAll() { return []; }
  }

  class FakeDocument extends FakeNode {
    constructor() {
      super(9);
      this.baseURI = url;
      this.documentElement = null;
      this.body = null;
      this.defaultView = null;
      this.ownerDocument = null;
    }

    createElement(tag, options) {
      const el = new FakeElement(tag);
      el.ownerDocument = this;
      return el;
    }
    createElementNS(ns, tag) {
      const el = new FakeElement(tag, ns);
      el.ownerDocument = this;
      return el;
    }
    createTextNode(text) {
      const node = new FakeText(text);
      node.ownerDocument = this;
      return node;
    }
    createDocumentFragment() {
      const frag = new FakeDocumentFragment();
      frag.ownerDocument = this;
      return frag;
    }
    getElementById(id) {
      const walk = (node) => {
        if (node.nodeType === FakeNode.ELEMENT_NODE && node.getAttribute("id") === id) return node;
        for (const child of node.childNodes || []) {
          const found = walk(child);
          if (found) return found;
        }
        return null;
      };
      return walk(this.documentElement || this);
    }
  }

  class FakeEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.bubbles = !!init.bubbles;
      this.target = null;
    }
  }

  const window = {
    Event: FakeEvent,
    MouseEvent: FakeEvent,
    CustomEvent: FakeEvent,
    URL: globalThis.URL,
  };
  window.window = window;
  window.globalThis = window;

  window.Node = FakeNode;
  window.Element = FakeElement;
  window.DocumentFragment = FakeDocumentFragment;
  window.Document = FakeDocument;

  const document = new FakeDocument();
  document.defaultView = window;
  window.document = document;

  const html = document.createElement("html");
  const body = document.createElement("body");
  html.appendChild(body);
  document.appendChild(html);
  document.documentElement = html;
  document.body = body;

  return { window, document, Node: FakeNode, Element: FakeElement, Document: FakeDocument, DocumentFragment: FakeDocumentFragment, Event: FakeEvent };
}
