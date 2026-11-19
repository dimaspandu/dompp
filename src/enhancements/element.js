
const INSTALLED = Symbol.for("dompp.element.enhancements");

function getBuilders(target) {
  const doc = target && target.ownerDocument;
  return doc && doc.__domppBuilders;
}

export function installElementEnhancements(builders) {
  const { Element, doc } = builders;

  if (!Element || !Element.prototype) {
    return builders;
  }

  if (doc) doc.__domppBuilders = builders;

  if (Element.prototype[INSTALLED]) {
    return builders;
  }

  function define(name, fn) {
    Object.defineProperty(Element.prototype, name, {
      value: fn,
      writable: false,
      configurable: true,
    });
  }

  define("setAttributes", function(attrs = {}) {
    const b = getBuilders(this);
    if (!b) throw new Error("DOM++ builders are not installed for this document.");
    return new b.ElementBuilder(this).setAttributes(attrs);
  });

  define("setStyles", function(styles = {}) {
    const b = getBuilders(this);
    if (!b) throw new Error("DOM++ builders are not installed for this document.");
    return new b.ElementBuilder(this).setStyles(styles);
  });

  define("setEvents", function(events = {}) {
    const b = getBuilders(this);
    if (!b) throw new Error("DOM++ builders are not installed for this document.");
    return new b.ElementBuilder(this).setEvents(events);
  });

  define("setChildren", function(...children) {
    const b = getBuilders(this);
    if (!b) throw new Error("DOM++ builders are not installed for this document.");
    return new b.ElementBuilder(this).setChildren(...children);
  });

  define("setText", function(text) {
    const b = getBuilders(this);
    if (!b) throw new Error("DOM++ builders are not installed for this document.");
    return new b.ElementBuilder(this).setText(text);
  });

  Object.defineProperty(Element.prototype, INSTALLED, {
    value: true,
    configurable: true,
  });

  return builders;
}
