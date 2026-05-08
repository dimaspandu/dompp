/**
 * Reconcile addon for DOMPP.
 *
 * This addon keeps DOMPP core untouched while providing opt-in
 * diff/patch behavior for repeated set* calls.
 *
 * Scope:
 * - No virtual DOM
 * - No template compiler
 * - Native DOM nodes only
 */

const HANDLERS_KEY = "__dompp_reconcile_handlers";
const STYLE_KEY = "__dompp_reconcile_style_keys";
const ATTR_KEY = "__dompp_reconcile_attr_keys";

const defineOn = (proto, name, fn) => {
  Object.defineProperty(proto, name, {
    value: fn,
    writable: false,
    configurable: true
  });
};

const normalizeChildren = (children) => {
  const out = [];

  const pushOne = (value) => {
    if (value == null || value === false) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(pushOne);
      return;
    }

    if (value instanceof DocumentFragment) {
      out.push(...value.childNodes);
      return;
    }

    if (value instanceof Node) {
      out.push(value);
      return;
    }

    out.push(document.createTextNode(String(value)));
  };

  children.forEach(pushOne);
  return out;
};

const isPlainObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  Object.getPrototypeOf(value) === Object.prototype;

const splitChildrenAndOptions = (args) => {
  if (args.length === 0) {
    return { children: args, options: {} };
  }

  const last = args[args.length - 1];
  if (
    isPlainObject(last) &&
    Object.prototype.hasOwnProperty.call(last, "matchById")
  ) {
    return {
      children: args.slice(0, -1),
      options: last
    };
  }

  return { children: args, options: {} };
};

const syncAttributes = (target, template) => {
  const nextAttrs = new Map();

  for (const attr of template.attributes) {
    nextAttrs.set(attr.name, attr.value);
  }

  for (const attr of Array.from(target.attributes)) {
    if (!nextAttrs.has(attr.name)) {
      target.removeAttribute(attr.name);
    }
  }

  for (const [name, value] of nextAttrs) {
    if (target.getAttribute(name) !== value) {
      target.setAttribute(name, value);
    }
  }
};

const syncEvents = (target, template) => {
  const handlers = template[HANDLERS_KEY];
  if (!handlers) {
    return;
  }
  patchEvents.call(target, handlers);
};

const resolveNodesById = (container, nextNodes, options) => {
  const existingById = new Map();
  const taken = new Set();

  for (const child of Array.from(container.childNodes)) {
    if (
      child.nodeType === Node.ELEMENT_NODE &&
      child.id
    ) {
      existingById.set(child.id, child);
    }
  }

  const syncElement = (current, template) => {
    if (current.tagName !== template.tagName) {
      return template;
    }

    syncAttributes(current, template);
    syncEvents(current, template);

    const templateChildren = Array.from(template.childNodes);
    patchChildrenInternal(current, templateChildren, options);

    return current;
  };

  return nextNodes.map((next) => {
    if (next.nodeType !== Node.ELEMENT_NODE || !next.id) {
      return next;
    }

    const current = existingById.get(next.id);

    if (!current || taken.has(current)) {
      return next;
    }

    taken.add(current);

    if (current === next) {
      return current;
    }

    return syncElement(current, next);
  });
};

function patchChildrenInternal(container, nextNodes, options = {}) {
  const nodes = options.matchById
    ? resolveNodesById(container, nextNodes, options)
    : nextNodes;

  let cursor = container.firstChild;

  for (let i = 0; i < nodes.length; i++) {
    const next = nodes[i];

    if (cursor === next) {
      cursor = cursor.nextSibling;
      continue;
    }

    if (
      cursor &&
      cursor.nodeType === Node.TEXT_NODE &&
      next.nodeType === Node.TEXT_NODE
    ) {
      if (cursor.textContent !== next.textContent) {
        cursor.textContent = next.textContent;
      }
      cursor = cursor.nextSibling;
      continue;
    }

    container.insertBefore(next, cursor);
  }

  while (cursor) {
    const next = cursor.nextSibling;
    container.removeChild(cursor);
    cursor = next;
  }
}

function patchText(text) {
  const next = String(text ?? "");
  if (this.textContent !== next) {
    this.textContent = next;
  }
  return this;
}

function patchChildren(...args) {
  const { children, options } = splitChildrenAndOptions(args);
  const nextNodes = normalizeChildren(children);
  patchChildrenInternal(this, nextNodes, options);
  return this;
}

function patchStyles(styles = {}) {
  this[STYLE_KEY] ??= new Set();

  for (const key of this[STYLE_KEY]) {
    if (!(key in styles) || styles[key] == null || styles[key] === false) {
      if (key.startsWith("--")) {
        this.style.removeProperty(key);
      } else {
        this.style[key] = "";
      }
      this[STYLE_KEY].delete(key);
    }
  }

  for (const key in styles) {
    const value = styles[key];

    if (value == null || value === false) {
      if (key.startsWith("--")) {
        this.style.removeProperty(key);
      } else {
        this.style[key] = "";
      }
      this[STYLE_KEY].delete(key);
      continue;
    }

    if (key.startsWith("--")) {
      if (this.style.getPropertyValue(key) !== String(value)) {
        this.style.setProperty(key, String(value));
      }
    } else if (this.style[key] !== String(value)) {
      this.style[key] = value;
    }

    this[STYLE_KEY].add(key);
  }

  return this;
}

function patchAttributes(attrs = {}) {
  this[ATTR_KEY] ??= new Set();

  for (const key of this[ATTR_KEY]) {
    if (!(key in attrs) || attrs[key] == null || attrs[key] === false) {
      this.removeAttribute(key);
      this[ATTR_KEY].delete(key);
    }
  }

  for (const key in attrs) {
    const value = attrs[key];

    if (value == null || value === false) {
      this.removeAttribute(key);
      this[ATTR_KEY].delete(key);
      continue;
    }

    const next = value === true ? "" : String(value);
    if (this.getAttribute(key) !== next) {
      this.setAttribute(key, next);
    }
    this[ATTR_KEY].add(key);
  }

  return this;
}

function patchEvents(events = {}) {
  this[HANDLERS_KEY] ??= {};

  for (const type in this[HANDLERS_KEY]) {
    if (!(type in events) || this[HANDLERS_KEY][type] !== events[type]) {
      this.removeEventListener(type, this[HANDLERS_KEY][type]);
      delete this[HANDLERS_KEY][type];
    }
  }

  for (const type in events) {
    const handler = events[type];
    if (this[HANDLERS_KEY][type] === handler) {
      continue;
    }

    if (this[HANDLERS_KEY][type]) {
      this.removeEventListener(type, this[HANDLERS_KEY][type]);
    }

    this.addEventListener(type, handler);
    this[HANDLERS_KEY][type] = handler;
  }

  return this;
}

/**
 * Install reconcile APIs.
 *
 * By default this addon overrides Element/DocumentFragment setText/setChildren
 * and Element setStyles/setAttributes/setEvents, while still exposing
 * explicit patch* method names.
 */
export function installDomppReconcile({ overrideSetters = true } = {}) {
  defineOn(Element.prototype, "patchText", patchText);
  defineOn(Element.prototype, "patchChildren", patchChildren);
  defineOn(Element.prototype, "patchStyles", patchStyles);
  defineOn(Element.prototype, "patchAttributes", patchAttributes);
  defineOn(Element.prototype, "patchEvents", patchEvents);

  defineOn(DocumentFragment.prototype, "patchText", patchText);
  defineOn(DocumentFragment.prototype, "patchChildren", patchChildren);

  if (!overrideSetters) {
    return;
  }

  defineOn(Element.prototype, "setText", patchText);
  defineOn(Element.prototype, "setChildren", patchChildren);
  defineOn(Element.prototype, "setStyles", patchStyles);
  defineOn(Element.prototype, "setAttributes", patchAttributes);
  defineOn(Element.prototype, "setEvents", patchEvents);

  defineOn(DocumentFragment.prototype, "setText", patchText);
  defineOn(DocumentFragment.prototype, "setChildren", patchChildren);
}
