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

  if (setterName === "setState") {
    return {
      ...dom,
      state: node.__dompp_state ?? {},
    };
  }

  return dom;
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
export const setTextImpl = function(text) {
  const nextText = typeof text === "function"
    ? text(createDomppSetterContext(this, "setText"))
    : text;

  this.textContent = nextText;
  return this;
};

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
export const setChildrenImpl = function(...children) {
  let nextChildren = children;

  if (children.length === 1 && typeof children[0] === "function") {
    const resolved = children[0](createDomppSetterContext(this, "setChildren"));
    nextChildren = Array.isArray(resolved) ? resolved : [resolved];
  }

  this.replaceChildren(...toNodeList(nextChildren));
  return this;
};

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
export const setStylesImpl = function(styles = {}) {
  const nextStyles = typeof styles === "function"
    ? styles(createDomppSetterContext(this, "setStyles"))
    : styles;

  Object.assign(this.style, nextStyles ?? {});
  return this;
};

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
export const setAttributesImpl = function(attrs = {}) {
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
};

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
export const setEventsImpl = function(events = {}) {
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
};

/**
 * setState(state)
 *
 * Manages element-local state with reactive bindings.
 *
 * This is a core API that enables stateful elements without requiring
 * additional addons. Provides deterministic updates and prevents
 * unnecessary DOM mutations.
 */
export const setStateImpl = function(next) {
  // Ensure element has state storage
  if (!this.__dompp_state) {
    this.__dompp_state = {};
    this.__dompp_bindings = new Set();
    this.__dompp_flushScheduled = false;
  }

  let changed = false;

  if (typeof next === "function") {
    const prev = { ...this.__dompp_state };
    next({
      state: this.__dompp_state,
      setState: (n) => this.setState(n),
      ...createDomppContext(this)
    });

    for (const key in this.__dompp_state) {
      if (!Object.is(prev[key], this.__dompp_state[key])) {
        changed = true;
        break;
      }
    }
  } else {
    for (const key in next) {
      if (!Object.is(this.__dompp_state[key], next[key])) {
        changed = true;
        break;
      }
    }

    if (changed) {
      Object.assign(this.__dompp_state, next);
    }
  }

  if (changed) {
    // Schedule batched flush
    if (!this.__dompp_flushScheduled) {
      this.__dompp_flushScheduled = true;
      queueMicrotask(() => {
        this.__dompp_flushScheduled = false;
        if (this.__dompp_bindings) {
          const runners = Array.from(this.__dompp_bindings);
          for (const run of runners) {
            run();
          }
        }
      });
    }
  }

  return this;
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

  // --------------------------------------------------
  // Element-only methods
  // --------------------------------------------------

  defineOn(Element.prototype, "setText", setTextImpl);
  defineOn(Element.prototype, "setChildren", setChildrenImpl);
  defineOn(Element.prototype, "setStyles", setStylesImpl);
  defineOn(Element.prototype, "setAttributes", setAttributesImpl);
  defineOn(Element.prototype, "setEvents", setEventsImpl);
  defineOn(Element.prototype, "setState", setStateImpl);

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
  defineOn(DocumentFragment.prototype, "setText", setTextImpl);
  defineOn(DocumentFragment.prototype, "setChildren", setChildrenImpl);
}

/**
 * Wraps setters to support reactive callbacks with state access.
 *
 * Enables patterns like:
 * element.setText(({ state }) => `Count: ${state.count}`)
 */
function wrapSetterForState(name) {
  const original = Element.prototype[name];

  if (!original || original.__dompp_wrapped) {
    return;
  }

  function wrapped(...args) {
    const first = args[0];

    // Fast path for non-reactive usage.
    if (typeof first !== "function") {
      return original.apply(this, args);
    }

    // Ensure state storage
    if (!this.__dompp_state) {
      this.__dompp_state = {};
      this.__dompp_bindings = new Set();
      this.__dompp_flushScheduled = false;
    }

    let previousResult;

    const runner = () => {
      const context = {
        state: this.__dompp_state,
        setState: (n) => this.setState(n),
        ...createDomppContext(this),
        ...createDomppSetterContext(this, name),
      };

      const nextResult = first(context);

      // Memoization check
      if (Object.is(previousResult, nextResult)) {
        return;
      }

      previousResult = nextResult;

      // Normalize children output
      if (name === "setChildren") {
        const children = Array.isArray(nextResult) ? nextResult : [nextResult];
        original.call(this, ...children);
        return;
      }

      original.call(this, nextResult);
    };

    this.__dompp_bindings.add(runner);
    runner(); // Initial run

    return this;
  }

  wrapped.__dompp_wrapped = true;

  Object.defineProperty(Element.prototype, name, {
    value: wrapped,
    writable: false,
    configurable: true,
  });
}

// Wrap all setters to support reactive callbacks
["setText", "setChildren", "setStyles", "setAttributes", "setEvents"].forEach(wrapSetterForState);

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
  "setEvents",
  "setState"
];