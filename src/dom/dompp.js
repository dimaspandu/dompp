/**
 * Installs DOM++ methods onto native DOM prototypes.
 *
 * DOM++ is intentionally designed as a prototype enhancement layer
 * rather than a wrapper-based API. This allows developers to work
 * directly with native DOM nodes while gaining a small set of
 * ergonomic utilities.
 *
 * IMPORTANT DESIGN GOALS:
 *
 * - Zero abstraction over native DOM
 * - Chainable APIs
 * - Minimal runtime overhead
 * - No virtual DOM
 * - No mutation observers
 * - No dependency on reactive systems
 *
 * These helpers should feel like they "belong" to the platform.
 *
 * SAFETY:
 * Methods are only defined if they do not already exist in order
 * to prevent overriding userland or third-party implementations.
 *
 * NOTE FOR CONTRIBUTORS:
 * Be extremely cautious when modifying prototype behavior.
 * Any change here affects ALL instances globally.
 */
const isNodeLike = (value) =>
  typeof Node !== "undefined" && value instanceof Node;

const toCamelCase = (cssProp) =>
  cssProp.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());

const readInlineStyles = (node) => {
  const styles = {};
  const styleDecl = node.style;

  for (let i = 0; i < styleDecl.length; i += 1) {
    const prop = styleDecl[i];
    styles[toCamelCase(prop)] = styleDecl.getPropertyValue(prop);
  }

  return styles;
};

const readAttributes = (node) => {
  const attributes = {};

  for (const attr of Array.from(node.attributes ?? [])) {
    attributes[attr.name] = attr.value;
  }

  return attributes;
};

const readEvents = (node) => ({ ...(node.__dompp_handlers ?? {}) });

const toNodeList = (values) => {
  const out = [];

  const pushOne = (value) => {
    if (value == null || value === false) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(pushOne);
      return;
    }

    if (isNodeLike(value)) {
      out.push(value);
      return;
    }

    out.push(document.createTextNode(String(value)));
  };

  values.forEach(pushOne);
  return out;
};

export const createDomppContext = (node) => ({
  el: node,
  // Element children only (no whitespace Text nodes).
  children: Array.from(node.children ?? []),
  // Raw node list when text/comment nodes are needed.
  childNodes: Array.from(node.childNodes ?? []),
  firstChild: node.firstChild ?? null,
  lastChild: node.lastChild ?? null
});

export const createDomppSetterContext = (node, setterName) => {
  const dom = createDomppContext(node);

  if (setterName === "setText") {
    return {
      ...dom,
      text: node.textContent ?? "",
    };
  }

  if (setterName === "setStyles") {
    return {
      ...dom,
      styles: readInlineStyles(node),
    };
  }

  if (setterName === "setAttributes") {
    return {
      ...dom,
      attributes: readAttributes(node),
    };
  }

  if (setterName === "setEvents") {
    return {
      ...dom,
      events: readEvents(node),
    };
  }

  return dom;
};

export function installDompp() {

  /**
   * Defines a non-writable method on a prototype.
   *
   * WHY Object.defineProperty?
   *
   * - Prevents accidental reassignment:
   *     element.setText = somethingElse
   *
   * - Keeps behavior stable across the app lifetime.
   *
   * Guard clause ensures we never override an existing method.
   *
   * The configurable flag remains true to allow controlled
   * evolution of the engine if absolutely necessary.
   */
  const defineOn = (proto, name, fn) => {
    if (!proto[name]) {
      Object.defineProperty(proto, name, {
        value: fn,
        writable: false,
        configurable: true,
      });
    }
  };

  /**
   * Shared implementation: setText
   *
   * A thin wrapper around textContent with chain support.
   *
   * WHY NOT innerText?
   * innerText triggers layout calculations because it is CSS-aware.
   * textContent is significantly faster and does not cause reflow.
   *
   * Works safely on:
   * - Element
   * - DocumentFragment
   */
  function setText(text) {
    const nextText = typeof text === "function"
      ? text(createDomppSetterContext(this, "setText"))
      : text;

    this.textContent = nextText;
    return this;
  }

  /**
   * Shared implementation: setChildren
   *
   * Replaces all child nodes using replaceChildren(),
   * which is the modern and efficient alternative to:
   *
   *   element.innerHTML = ""
   *   element.append(...)
   *
   * STRING HANDLING:
   * Strings are automatically converted into TextNodes.
   * This prevents accidental HTML injection and keeps
   * the operation safe by default.
   *
   * HYDRATION MODE:
   * setChildren((ctx) => nextChildren)
   *
   * The callback receives:
   * - el
   * - children (element-only children)
   * - childNodes (raw nodes)
   * - firstChild / lastChild
   *
   * This enables assimilation/hydration flows where
   * existing DOM nodes are reused and augmented.
   *
   * IMPORTANT:
   * This method performs a full subtree replacement.
   * Contributors should avoid adding diff logic here.
   *
   * DOM++ intentionally favors predictable behavior
   * over hidden heuristics.
   *
   * Supported on:
   * - Element
   * - DocumentFragment
   */
  function setChildren(...children) {
    let nextChildren = children;

    if (children.length === 1 && typeof children[0] === "function") {
      const resolved = children[0](createDomppSetterContext(this, "setChildren"));
      nextChildren = Array.isArray(resolved) ? resolved : [resolved];
    }

    this.replaceChildren(...toNodeList(nextChildren));
    return this;
  }

  // --------------------------------------------------
  // Element-only methods
  // --------------------------------------------------

  defineOn(Element.prototype, "setText", setText);
  defineOn(Element.prototype, "setChildren", setChildren);

  /**
   * setStyles(styles)
   *
   * Assigns style properties via Object.assign.
   *
   * WHY NOT setAttribute("style")?
   * Direct style mutation avoids string parsing and is faster.
   *
   * NOTE:
   * This does not auto-prefix properties.
   * DOM++ intentionally avoids magic behavior.
   */
  defineOn(Element.prototype, "setStyles", function (styles = {}) {
    const nextStyles = typeof styles === "function"
      ? styles(createDomppSetterContext(this, "setStyles"))
      : styles;

    Object.assign(this.style, nextStyles ?? {});
    return this;
  });

  /**
   * setAttributes(attrs)
   *
   * Applies attributes with boolean semantics.
   *
   * RULES:
   * true  -> attribute is added with empty string
   * false -> attribute is removed
   * null/undefined -> attribute is removed
   */
  defineOn(Element.prototype, "setAttributes", function (attrs = {}) {
    const nextAttrs = typeof attrs === "function"
      ? attrs(createDomppSetterContext(this, "setAttributes"))
      : attrs;

    for (const k in (nextAttrs ?? {})) {
      const v = nextAttrs[k];

      if (v === false || v == null) {
        this.removeAttribute(k);
      } else {
        this.setAttribute(k, v === true ? "" : v);
      }
    }

    return this;
  });

  /**
   * setEvents(events)
   *
   * Attaches event listeners with automatic deduplication.
   *
   * PROBLEM THIS SOLVES:
   * Rebinding events repeatedly can cause duplicate handlers
   * and memory leaks.
   *
   * INTERNAL STRATEGY:
   * Each element stores its handlers in a private property:
   *
   *   __dompp_handlers
   *
   * When a handler is replaced, the previous one is removed first.
   *
   * WHY NOT use WeakMap?
   * Storing directly on the node is faster and avoids
   * additional allocations.
   *
   * This is a deliberate performance tradeoff.
   */
  defineOn(Element.prototype, "setEvents", function (events = {}) {
    const nextEvents = typeof events === "function"
      ? events(createDomppSetterContext(this, "setEvents"))
      : events;

    this.__dompp_handlers ??= {};

    for (const e in (nextEvents ?? {})) {

      if (this.__dompp_handlers[e]) {
        this.removeEventListener(e, this.__dompp_handlers[e]);
      }

      this.addEventListener(e, nextEvents[e]);
      this.__dompp_handlers[e] = nextEvents[e];
    }

    return this;
  });

  // --------------------------------------------------
  // DocumentFragment support (intentionally minimal)
  // --------------------------------------------------

  /**
   * Fragments are not elements.
   *
   * They do not support:
   * - styles
   * - attributes
   * - events
   *
   * Only install mutation helpers that make semantic sense.
   *
   * This restraint is intentional and protects the engine
   * from API surface creep.
   */
  defineOn(DocumentFragment.prototype, "setText", setText);
  defineOn(DocumentFragment.prototype, "setChildren", setChildren);
}

/**
 * Registry of setters used by the stateful addon.
 *
 * IMPORTANT:
 * Only Element setters belong here.
 *
 * DocumentFragment intentionally does NOT participate
 * in stateful bindings.
 */
export const DOMPP_SETTERS = [
  "setText",
  "setChildren",
  "setStyles",
  "setAttributes",
  "setEvents"
];
