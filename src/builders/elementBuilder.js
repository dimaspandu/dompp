import { SVG_NS, svgOnlyTags } from "./constants.js";
import { toJavaScriptStyleName, validateAttribute } from "./validators.js";

const attachedEventsByNode = new WeakMap();
const elementKeysByNode = new WeakMap();

function persistElementKey(node, key) {
  if (!node) {
    return;
  }

  if (key == null) {
    elementKeysByNode.delete(node);
  } else {
    elementKeysByNode.set(node, key);
  }
}

// Store the old and new virtual fields needed by the reconciliation pass.
function ElementBuilder(selector) {
  this.struct = {
    tag: null,
    key: null,
    attributes: {},
    styles: {},
    events: {},
    children: [],
  };

  this.node = null;

  if (selector && selector.nodeType === 1) {
    this.struct.tag = selector.tagName.toLowerCase();
    if (this.struct.tag === "script") {
      throw new TypeError(
        "Script elements cannot be managed by ElementBuilder. Use a trusted ESM import."
      );
    }
    this.node = selector;
    this.struct.key = elementKeysByNode.get(selector) ?? null;

    // Seed the virtual struct from server attributes and inline styles.
    this.struct.attributes = {};
    Array.from(selector.attributes).forEach((attribute) => {
      const normalizedName = attribute.name.toLowerCase();
      if (normalizedName === "style") return;

      try {
        validateAttribute(attribute.name, attribute.value);
        this.struct.attributes[attribute.name] = attribute.value;
      } catch {
        // Do not preserve unsafe server attributes when adopting existing DOM.
        selector.removeAttribute(attribute.name);
      }
    });

    for (let index = 0; index < selector.style.length; index += 1) {
      const cssName = selector.style[index];
      const propertyName = toJavaScriptStyleName(cssName);
      this.struct.styles[propertyName] = selector.style.getPropertyValue(cssName);
    }

    // Ignore indentation-only text nodes so descriptors match visual children.
    const preservesWhitespace =
      ["pre", "textarea", "script", "style"].includes(this.struct.tag);
    this.struct.children = [];
    Array.from(selector.childNodes).forEach((child) => {
      const isIndentedWhitespace =
        child.nodeType === Node.TEXT_NODE &&
        child.nodeValue.trim() === "" &&
        /[\r\n]/.test(child.nodeValue);

      if (isIndentedWhitespace && !preservesWhitespace) {
        selector.removeChild(child);
        return;
      }

      if (child.nodeType === 1) {
        this.struct.children.push(
          child.tagName.toLowerCase() === "script"
            ? child
            : new ElementBuilder(child)
        );
      } else {
        this.struct.children.push(
          child.nodeType === Node.TEXT_NODE ? child.nodeValue : child
        );
      }
    });
  } else {
    if (typeof selector === "string" && selector.toLowerCase() === "script") {
      throw new TypeError(
        "Script elements cannot be created with ElementBuilder. Use a trusted ESM import."
      );
    }
    this.struct.tag = selector;
  }

  this._attachedEvents = this.node
    ? attachedEventsByNode.get(this.node) ?? {}
    : {};
}

// Apply attributes immediately when a DOM node exists; otherwise cache them.
ElementBuilder.prototype.setAttributes = function(attrs) {
  attrs = attrs && typeof attrs === "object" ? attrs : {};
  for (const [name, value] of Object.entries(attrs)) {
    validateAttribute(name, value);
  }

  this.struct.attributes = { ...this.struct.attributes, ...attrs };

  if (this.node) {
    for (const [name, value] of Object.entries(attrs)) {
      if (value === false || value == null) {
        this.node.removeAttribute(name);
      } else {
        this.node.setAttribute(name, value === true ? "" : value);
      }
    }
  }

  return this;
};

// Styles follow the same descriptor-first, direct-update behavior.
ElementBuilder.prototype.setStyles = function(styles) {
  styles = styles && typeof styles === "object" ? styles : {};
  this.struct.styles = { ...this.struct.styles, ...styles };

  if (this.node) {
    for (const [name, value] of Object.entries(styles)) {
      this.node.style[name] = value == null ? "" : value;
    }
  }

  return this;
};

// Replace changed event handlers so rerenders do not accumulate listeners.
ElementBuilder.prototype.setEvents = function(events) {
  events = events && typeof events === "object" ? events : {};
  const nextEvents = { ...this.struct.events };

  for (const [name, handler] of Object.entries(events)) {
    const previousHandler = this._attachedEvents[name];

    if (typeof handler === "function") {
      if (this.node && previousHandler !== handler) {
        if (previousHandler) {
          this.node.removeEventListener(name, previousHandler);
        }
        this.node.addEventListener(name, handler);
        this._attachedEvents[name] = handler;
      }
      nextEvents[name] = handler;
    } else {
      if (this.node && previousHandler) {
        this.node.removeEventListener(name, previousHandler);
      }
      delete this._attachedEvents[name];
      delete nextEvents[name];
    }
  }

  this.struct.events = nextEvents;
  if (this.node) {
    attachedEventsByNode.set(this.node, this._attachedEvents);
  }

  return this;
};

// Text is represented as a normal child so it uses the same reconciliation.
ElementBuilder.prototype.setText = function(text) {
  return this.setChildren([text]);
};

ElementBuilder.prototype.reset = function() {
  this.struct.styles = {};
  this.struct.attributes = {};
  this.struct.children = [];
  this.struct.events = {};

  if (this.node) {
    Array.from(this.node.attributes).forEach((attr) => {
      this.node.removeAttribute(attr.name);
    });
    this.node.removeAttribute("style");
    this.node.replaceChildren();
  }
  return this;
};

// Flatten arrays and discard null/boolean children before diffing the tree.
ElementBuilder.prototype.setChildren = function(children) {
  const nextChildren = (Array.isArray(children) ? children : [children])
    .flat(Infinity)
    .filter((child) => child != null && typeof child !== "boolean");

  if (this.node) {
    this._reconcileChildren(nextChildren);
  } else {
    this.struct.children = nextChildren;
  }

  return this;
};

// Materialize one DOM node and apply the descriptor's current fields.
ElementBuilder.prototype._createNode = function() {
  if (this.node) {
    return this.node;
  }

  this.node = svgOnlyTags.has(this.struct.tag)
    ? document.createElementNS(SVG_NS, this.struct.tag)
    : document.createElement(this.struct.tag);

  this.setAttributes(this.struct.attributes);
  this.setStyles(this.struct.styles);
  this.setEvents(this.struct.events);

  this._reconcileChildren(this.struct.children);
  persistElementKey(this.node, this.struct.key);
  return this.node;
};

/*
 * Match keyed children by key and tag, then match unkeyed children by
 * position. Reuse matching nodes, replace changed nodes, and move nodes into
 * their new order.
 */
ElementBuilder.prototype._reconcileChildren = function(nextChildren, previousChildrenOverride) {
  const previousChildren = previousChildrenOverride ?? this.struct.children;
  const previousNodes = Array.from(this.node.childNodes);
  const previousKeyedChildren = new Map();
  const nextKeys = new Set();

  previousChildren.forEach((child, index) => {
    if (!(child instanceof ElementBuilder) || child.struct.key == null) {
      return;
    }
    validateElementKey(child.struct.key);
    if (previousKeyedChildren.has(child.struct.key)) {
      throw new Error(`Duplicate child key: ${child.struct.key}`);
    }
    previousKeyedChildren.set(child.struct.key, {
      child,
      node: previousNodes[index],
    });
  });

  const reconciledChildren = [];
  const reconciledNodes = [];

  nextChildren.forEach((nextChild, index) => {
    let currentChild = null;
    let currentNode = null;

    if (nextChild instanceof ElementBuilder && nextChild.struct.key != null) {
      const key = nextChild.struct.key;
      validateElementKey(key);
      if (nextKeys.has(key)) {
        throw new Error(`Duplicate child key: ${key}`);
      }
      nextKeys.add(key);

      const previous = previousKeyedChildren.get(key);
      if (
        previous &&
        previous.child.struct.tag === nextChild.struct.tag &&
        previous.node?.nodeType === 1
      ) {
        currentChild = previous.child;
        currentNode = previous.node;
      }
    } else {
      const candidate = previousChildren[index];
      const candidateNode = previousNodes[index];
      const bothUnkeyedBuilders =
        candidate instanceof ElementBuilder &&
        nextChild instanceof ElementBuilder &&
        candidate.struct.key == null &&
        nextChild.struct.key == null &&
        candidate.struct.tag === nextChild.struct.tag &&
        candidateNode?.nodeType === 1;
      const bothText =
        (typeof candidate === "string" || typeof candidate === "number") &&
        (typeof nextChild === "string" || typeof nextChild === "number") &&
        candidateNode?.nodeType === Node.TEXT_NODE;

      if (bothUnkeyedBuilders || bothText) {
        currentChild = candidate;
        currentNode = candidateNode;
      } else if (candidateNode === nextChild && nextChild?.nodeType) {
        currentNode = candidateNode;
      }
    }

    if (currentChild instanceof ElementBuilder) {
      currentChild.node = currentNode;
      currentChild._patchFrom(nextChild);
      reconciledChildren.push(currentChild);
      reconciledNodes.push(currentNode);
      return;
    }

    if (
      currentNode?.nodeType === Node.TEXT_NODE &&
      (typeof nextChild === "string" || typeof nextChild === "number")
    ) {
      const nextText = String(nextChild);
      if (currentNode.nodeValue !== nextText) {
        currentNode.nodeValue = nextText;
      }
      reconciledChildren.push(nextChild);
      reconciledNodes.push(currentNode);
      return;
    }

    const nextNode = nextChild instanceof ElementBuilder
      ? nextChild._createNode()
      : nextChild?.nodeType
        ? nextChild
        : document.createTextNode(String(nextChild));

    reconciledChildren.push(nextChild);
    reconciledNodes.push(nextNode);
  });

  const nextNodeSet = new Set(reconciledNodes);
  for (const oldNode of previousNodes) {
    if (!nextNodeSet.has(oldNode)) {
      this.node.removeChild(oldNode);
    }
  }

  let anchor = null;
  for (let index = reconciledNodes.length - 1; index >= 0; index -= 1) {
    const node = reconciledNodes[index];
    if (node.parentNode !== this.node || node.nextSibling !== anchor) {
      this.node.insertBefore(node, anchor);
    }
    anchor = node;
  }

  this.struct.children = reconciledChildren;
};

// Keys must be stable primitive values to identify siblings across renders.
function validateElementKey(key) {
  if (typeof key !== "string" && typeof key !== "number") {
    throw new TypeError("ElementBuilder child keys must be strings or numbers.");
  }
}

// Patch only changed fields, then reconcile the child descriptors.
ElementBuilder.prototype._patchFrom = function(next) {
  const previousAttributes = this.struct.attributes;
  const nextAttributes = next.struct.attributes;
  for (const name of Object.keys(previousAttributes)) {
    if (!(name in nextAttributes)) {
      this.node.removeAttribute(name);
    }
  }
  this.setAttributes(nextAttributes);
  this.struct.attributes = { ...nextAttributes };

  const previousStyles = this.struct.styles;
  const nextStyles = next.struct.styles;
  for (const name of Object.keys(previousStyles)) {
    if (!(name in nextStyles)) {
      this.node.style[name] = "";
    }
  }
  this.setStyles(nextStyles);
  this.struct.styles = { ...nextStyles };
  for (const name of Object.keys(this.struct.events)) {
    if (!(name in next.struct.events)) {
      this.setEvents({ [name]: null });
    }
  }
  this.setEvents(next.struct.events);
  this.struct.events = { ...next.struct.events };

  const previousChildren = this.struct.children;
  this.struct = {
    tag: next.struct.tag,
    key: next.struct.key,
    attributes: { ...nextAttributes },
    styles: { ...nextStyles },
    events: { ...next.struct.events },
    children: previousChildren,
  };
  persistElementKey(this.node, this.struct.key);
  this._reconcileChildren(next.struct.children);
  return this;
};

/*
 * Attach descriptors to server-created nodes without treating omitted
 * children as deletions. Existing child nodes stay in the initial struct.
 */
ElementBuilder.prototype._attachChildren = function(children) {
  const nextChildren = (Array.isArray(children) ? children : [children])
    .flat(Infinity)
    .filter((child) => child != null && typeof child !== "boolean");
  const previousChildren = this.struct.children;
  if (nextChildren.length === 0) {
    return this;
  }

  const usedChildren = new Set();
  const attachedChildren = nextChildren.map((nextChild, index) => {
    let matchIndex = -1;

    if (nextChild instanceof ElementBuilder && nextChild.struct.key != null) {
      matchIndex = previousChildren.findIndex((child, childIndex) =>
        !usedChildren.has(childIndex) &&
        child instanceof ElementBuilder &&
        child.struct.key === nextChild.struct.key &&
        child.struct.tag === nextChild.struct.tag
      );
    }

    // During first hydration, server nodes have no virtual keys yet. Adopt
    // the same-position node when its tag matches the descriptor.
    if (matchIndex < 0) {
      const candidate = previousChildren[index];
      if (
        !usedChildren.has(index) &&
        candidate instanceof ElementBuilder &&
        nextChild instanceof ElementBuilder &&
        candidate.struct.key == null &&
        candidate.struct.tag === nextChild.struct.tag
      ) {
        matchIndex = index;
      } else if (
        !usedChildren.has(index) &&
        (typeof candidate === "string" || typeof candidate === "number") &&
        (typeof nextChild === "string" || typeof nextChild === "number")
      ) {
        matchIndex = index;
      }
    }

    if (matchIndex < 0) {
      return nextChild;
    }

    usedChildren.add(matchIndex);
    const existingChild = previousChildren[matchIndex];
    if (existingChild instanceof ElementBuilder) {
      existingChild._attachFrom(nextChild);
      // Keep references held by callers (for example ComponentBuilder or a
      // directly updated title/menu) connected to the adopted server node.
      nextChild.node = existingChild.node;
      nextChild.struct = existingChild.struct;
      nextChild._attachedEvents = existingChild._attachedEvents;
      return nextChild;
    }
    return nextChild;
  });

  // Keep any server children omitted by a partial descriptor, while ordering
  // described children according to their virtual tree.
  previousChildren.forEach((child, index) => {
    if (!usedChildren.has(index)) attachedChildren.push(child);
  });

  this._reconcileChildren(attachedChildren, previousChildren);
  return this;
};

// Merge props and handlers onto an existing node while retaining its children.
ElementBuilder.prototype._attachFrom = function(next) {
  this.struct.key = next.struct.key;
  persistElementKey(this.node, this.struct.key);
  this.setAttributes(next.struct.attributes);
  this.struct.attributes = {
    ...this.struct.attributes,
    ...next.struct.attributes,
  };

  this.setStyles(next.struct.styles);
  this.struct.styles = {
    ...this.struct.styles,
    ...next.struct.styles,
  };

  this.setEvents(next.struct.events);
  this.struct.events = {
    ...this.struct.events,
    ...next.struct.events,
  };

  if (next.struct.children.length > 0) {
    this._attachChildren(next.struct.children);
  }

  return this;
};

// Public bridge from a virtual descriptor to its DOM representation.
ElementBuilder.prototype.toNode = function() {
  return this._createNode();
};

/*
 * JSX factory: elementBuilder(tag, props, ...children).
 * It separates attributes, styles, events, and keys into the virtual struct.
 */
function elementBuilder(tag, props, ...children) {

  // Custom components.
  if (typeof tag === "function") {
    return tag(props, ...children);
  }

  const element = new ElementBuilder(tag);
  let elementKey = null;

  if (props) {
    const attrs = {};
    const events = {};
    let className;
    let style;

    for (const [propKey, value] of Object.entries(props)) {
      const normalizedKey = propKey.toLowerCase();
      if (
        normalizedKey.startsWith("on") &&
        typeof value === "function"
      ) {
        // JSX onClick maps to DOM click listeners.
        const eventName = propKey
          .slice(2)
          .toLowerCase()
          .replace(/^:/, "");
        if (eventName) {
          events[eventName] = value;
        }
      } else if (
        normalizedKey === "styles" ||
        normalizedKey === "style"
      ) {
        style = value;
      } else if (
        normalizedKey === "classname" ||
        normalizedKey === "class"
      ) {
        className ??= value;
      } else if (normalizedKey === "key") {
        elementKey = value;
      } else {
        attrs[propKey] = value;
      }
    }

    if (className != null) {
      element.setAttributes({ class: className });
    }

    if (style != null) {
      element.setStyles(style);
    }

    if (Object.keys(events).length) {
      element.setEvents(events);
    }

    if (Object.keys(attrs).length) {
      element.setAttributes(attrs);
    }
  }

  element.struct.key = elementKey;
  persistElementKey(element.node, elementKey);

  // Use attach mode for an existing element; ordinary builders reconcile.
  if (children.length) {
    if (element.node) {
      // Adopt matching nodes and leave unspecified server children untouched.
      element._attachChildren(children);
    } else {
      element.setChildren(children);
    }
  }

  return element;
}

// JSX fragment syntax uses a real wrapper to preserve one-to-one child counts.
elementBuilder.fragment = function(...children) {
  return new ElementBuilder("fragment").setChildren(children.flat(Infinity));
};

export { ElementBuilder, elementBuilder };