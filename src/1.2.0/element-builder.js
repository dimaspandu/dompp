const SVG_ONLY_TAGS = new Set([
  "svg",
  "circle",
  "path",
  "rect",
  "line",
  "polyline",
  "polygon",
  "ellipse",
  "g",
  "defs",
  "use",
  "symbol",
  "text",
  "tspan",
  "textPath",
  "image",
  "foreignObject",
  "mask",
  "clipPath",
  "pattern",
  "linearGradient",
  "radialGradient",
  "stop",
  "filter",
  "feGaussianBlur",
  "feColorMatrix",
  "animate",
  "animateTransform",
  "animateMotion",
  "marker",
  "view",
  "switch",
]);

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const mountedElementBuilders = new WeakMap();

function isObjectRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeChildren(children) {
  return (Array.isArray(children) ? children : [children])
    .flat(Infinity)
    .filter((child) => child != null && typeof child !== "boolean");
}

function setStyleProperty(style, name, value) {
  if (name.startsWith("--")) {
    if (value == null) {
      style.removeProperty(name);
    } else {
      style.setProperty(name, String(value));
    }
    return;
  }

  style[name] = value == null ? "" : value;
}

function childToNode(child) {
  if (child instanceof ElementBuilder) {
    return child._createNode();
  }

  if (child && typeof child.nodeType === "number") {
    return child;
  }

  return document.createTextNode(String(child));
}

function validateKey(key) {
  if (typeof key !== "string" && typeof key !== "number") {
    throw new TypeError("ElementBuilder child keys must be strings or numbers.");
  }
}

class ElementBuilder {
  constructor(tag) {
    this.struct = {
      tag: null,
      key: null,
      attributes: {},
      styles: {},
      events: {},
      children: [],
    };
    this.node = null;
    this._attachedEvents = {};

    if (tag && typeof tag.nodeType === "number") {
      this.struct.tag = tag.nodeType === 1
        ? tag.tagName.toLowerCase()
        : "fragment";
      this.node = tag;
    } else if (typeof tag === "string" && tag.length) {
      this.struct.tag = tag;
    } else {
      throw new TypeError("elementBuilder expects a tag name or DOM node.");
    }
  }

  setAttributes(attributes = {}) {
    if (!isObjectRecord(attributes)) {
      return this;
    }

    this.struct.attributes = {
      ...this.struct.attributes,
      ...attributes,
    };

    if (this.node) {
      for (const [name, value] of Object.entries(attributes)) {
        if (value === false || value == null) {
          this.node.removeAttribute(name);
        } else {
          this.node.setAttribute(name, value === true ? "" : String(value));
        }
      }
    }

    return this;
  }

  setStyles(styles = {}) {
    if (!isObjectRecord(styles)) {
      return this;
    }

    this.struct.styles = {
      ...this.struct.styles,
      ...styles,
    };

    if (this.node) {
      for (const [name, value] of Object.entries(styles)) {
        setStyleProperty(this.node.style, name, value);
      }
    }

    return this;
  }

  setEvents(events = {}) {
    if (!isObjectRecord(events)) {
      return this;
    }

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
    return this;
  }

  setText(text) {
    return this.setChildren([text]);
  }

  setChildren(...children) {
    const nextChildren = normalizeChildren(children);

    if (this.node) {
      this._reconcileChildren(nextChildren);
    } else {
      this.struct.children = nextChildren;
    }

    return this;
  }

  _createNode() {
    if (this.node) {
      return this.node;
    }

    this.node = SVG_ONLY_TAGS.has(this.struct.tag)
      ? document.createElementNS(SVG_NAMESPACE, this.struct.tag)
      : document.createElement(this.struct.tag);

    this.setAttributes(this.struct.attributes);
    this.setStyles(this.struct.styles);
    this.setEvents(this.struct.events);
    this._reconcileChildren(this.struct.children);

    return this.node;
  }

  _reconcileChildren(nextChildren) {
    const previousChildren = this.struct.children;
    const previousNodes = Array.from(this.node.childNodes);
    const previousKeyedChildren = new Map();
    const nextKeys = new Set();
    const usedNodes = new Set();

    previousChildren.forEach((child, index) => {
      if (!(child instanceof ElementBuilder) || child.struct.key == null) {
        return;
      }

      validateKey(child.struct.key);
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
        validateKey(key);
        if (nextKeys.has(key)) {
          throw new Error(`Duplicate child key: ${key}`);
        }
        nextKeys.add(key);

        const previous = previousKeyedChildren.get(key);
        if (
          previous &&
          previous.child.struct.tag === nextChild.struct.tag &&
          previous.node?.nodeType === 1 &&
          !usedNodes.has(previous.node)
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
          candidateNode?.nodeType === 1 &&
          !usedNodes.has(candidateNode);
        const bothText =
          (typeof candidate === "string" || typeof candidate === "number") &&
          (typeof nextChild === "string" || typeof nextChild === "number") &&
          candidateNode?.nodeType === Node.TEXT_NODE &&
          !usedNodes.has(candidateNode);

        if (bothUnkeyedBuilders || bothText) {
          currentChild = candidate;
          currentNode = candidateNode;
        } else if (
          candidateNode === nextChild &&
          nextChild?.nodeType &&
          !usedNodes.has(candidateNode)
        ) {
          currentNode = candidateNode;
        }
      }

      if (currentChild instanceof ElementBuilder) {
        currentChild.node = currentNode;
        currentChild._patchFrom(nextChild);
        usedNodes.add(currentNode);
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
        usedNodes.add(currentNode);
        reconciledChildren.push(nextChild);
        reconciledNodes.push(currentNode);
        return;
      }

      const nextNode = childToNode(nextChild);
      if (usedNodes.has(nextNode)) {
        throw new Error("The same DOM node cannot appear twice in children.");
      }
      usedNodes.add(nextNode);
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
  }

  _patchFrom(next) {
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
        setStyleProperty(this.node.style, name, null);
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

    const previousChildren = this.struct.children;
    this.struct = {
      tag: next.struct.tag,
      key: next.struct.key,
      attributes: { ...nextAttributes },
      styles: { ...nextStyles },
      events: { ...next.struct.events },
      children: previousChildren,
    };
    this._reconcileChildren(next.struct.children);
    return this;
  }

  toNode() {
    return this._createNode();
  }
}

export function elementBuilder(tag, props, ...children) {
  if (typeof tag === "function") {
    return tag(props ?? {}, ...children);
  }

  const isExistingNode = tag && typeof tag.nodeType === "number";
  if (isExistingNode && tag.nodeType !== 1) {
    throw new TypeError("elementBuilder mount targets must be Element nodes.");
  }

  const element = new ElementBuilder(
    isExistingNode ? tag.tagName.toLowerCase() : tag
  );
  if (element.struct.tag.toLowerCase() === "fragment") {
    element.setStyles({ display: "contents" });
  }
  let key = null;

  if (isObjectRecord(props)) {
    const attributes = {};
    const styles = {};
    const events = {};
    let className;

    for (const [propName, value] of Object.entries(props)) {
      const normalizedName = propName.toLowerCase();

      if (normalizedName === "key") {
        key = value;
      } else if (normalizedName === "style" || normalizedName === "styles") {
        if (isObjectRecord(value)) {
          Object.assign(styles, value);
        }
      } else if (normalizedName === "class" || normalizedName === "classname") {
        className ??= value;
      } else if (normalizedName.startsWith("on")) {
        const eventName = normalizedName.slice(2);
        if (eventName && typeof value === "function") {
          events[eventName] = value;
        }
      } else {
        attributes[propName] = value;
      }
    }

    if (className != null) {
      attributes.class = className;
    }
    element.setAttributes(attributes);
    element.setStyles(styles);
    element.setEvents(events);
  }

  element.struct.key = key;
  element.setChildren(children);
  if (!isExistingNode) {
    return element;
  }

  const mountedElement = mountedElementBuilders.get(tag);
  if (mountedElement) {
    mountedElement._patchFrom(element);
    return tag;
  }

  const initialChildren = element.struct.children;
  element.struct.children = [];
  element.node = tag;
  element.setAttributes(element.struct.attributes);
  element.setStyles(element.struct.styles);
  element.setEvents(element.struct.events);
  element._reconcileChildren(initialChildren);
  mountedElementBuilders.set(tag, element);
  return tag;
}

elementBuilder.fragment = (...children) =>
  elementBuilder("fragment", null, ...children);

function createComponentTree(output) {
  if (output instanceof ElementBuilder) {
    return output;
  }

  if (Array.isArray(output)) {
    return elementBuilder.fragment(...output);
  }

  if (output && typeof output.nodeType === "number") {
    return new ElementBuilder(output);
  }

  throw new TypeError(
    "componentBuilder render functions must return an element, node, or array of children."
  );
}

export function componentBuilder(builder) {
  if (typeof builder !== "function") {
    throw new TypeError("componentBuilder expects a render function.");
  }

  let component = null;

  const instance = {
    render() {
      if (!component) {
        component = createComponentTree(
          builder(() => instance.rerender())
        );
      }
      return component.toNode();
    },

    rerender() {
      if (!component) {
        return instance;
      }

      const next = createComponentTree(
        builder(() => instance.rerender())
      );

      if (component.struct.tag === next.struct.tag) {
        component._patchFrom(next);
      } else {
        const nextNode = next.toNode();
        if (component.node?.parentNode) {
          component.node.parentNode.replaceChild(nextNode, component.node);
        }
        component = next;
      }

      return instance;
    },
  };

  return Object.freeze(instance);
}
