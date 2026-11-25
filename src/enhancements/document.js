const INSTALLED = Symbol.for("dompp.document.enhancements");

function getBuilders(target) {
  const doc = target && (target.nodeType === 9 ? target : target.ownerDocument);
  return doc && doc.__domppBuilders;
}

export function installDocumentEnhancements(builders) {
  const { Document, doc } = builders;

  if (!Document || !Document.prototype) {
    return builders;
  }

  doc.__domppBuilders = builders;

  if (Document.prototype[INSTALLED]) {
    return builders;
  }

  Object.defineProperty(Document.prototype, "createComponent", {
    value: function(builder) {
      const b = getBuilders(this);
      if (!b) throw new Error("DOM++ builders are not installed for this document.");
      return new b.ComponentBuilder(builder);
    },
    writable: false,
    configurable: true,
  });

  // Fragment-producing APIs (JSX <></>, .fragment, createDocumentFragment with
  // children) return a flat child array. Use <fragment> or
  // document.createElement("fragment") for a wrapper element.

  const originalCreateDocumentFragment =
    Document.prototype.createDocumentFragment;

  Document.prototype.createDocumentFragment = function(...children) {
    // A JSX fragment factory may be invoked without its Document receiver.
    // Use the installed document as the fallback in that case.
    const receiver = this?.nodeType === 9 ? this : doc;
    const b = getBuilders(receiver) || (
      receiver === doc ? builders : null
    );

    if (!b) {
      return originalCreateDocumentFragment.call(receiver);
    }

    if (children.length === 0) {
      return b.asFragmentChildren([]);
    }

    // Support JSX pragma form: (props/null, ...children)
    if (
      children.length > 1 &&
      (children[0] == null || typeof children[0] === "object") &&
      !Array.isArray(children[0]) &&
      !(children[0] instanceof b.ElementBuilder) &&
      children[0]?.nodeType == null
    ) {
      return b.asFragmentChildren(children.slice(1));
    }

    return b.asFragmentChildren(children);
  };

  const originalCreateElement = Document.prototype.createElement;

  Document.prototype.createElement = function(tagName, options, ...rest) {
    const b = getBuilders(this);
    if (!b) {
      return originalCreateElement.call(this, tagName, options, ...rest);
    }

    // Custom component function (used by JSX pragmas).
    if (typeof tagName === "function") {
      return b.elementBuilder(tagName, options, ...rest);
    }

    // Adopt an existing element node.
    if (tagName && tagName.nodeType === 1) {
      return b.elementBuilder(tagName, options, ...rest);
    }

    // Treat plain option objects as builder props, but preserve native { is: ... }.
    if (options && typeof options === "object" && !("is" in options)) {
      return b.elementBuilder(tagName, options, ...rest);
    }

    // JSX without props passes (tag, null, ...children).
    if (rest.length > 0) {
      return b.elementBuilder(tagName, options, ...rest);
    }

    return originalCreateElement.call(this, tagName, options, ...rest);
  };

  // Explicit hydration: attach to server-rendered DOM without destroying
  // unspecified existing children. Use document.hydrateElement() when you want
  // to keep server markup that is not described in the virtual tree.
  Document.prototype.hydrateElement = function(node, props, ...children) {
    const b = getBuilders(this);
    if (!b) {
      throw new Error("DOM++ builders are not installed for this document.");
    }
    return b.hydrateElement(node, props, ...children);
  };

  Object.defineProperty(Document.prototype, INSTALLED, {
    value: true,
    configurable: true,
  });

  return builders;
}
