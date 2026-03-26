import { createDomppContext } from "../dom/dompp.js";

const defineOn = (proto, name, fn) => {
  if (proto[name]) {
    return;
  }

  Object.defineProperty(proto, name, {
    value: fn,
    writable: false,
    configurable: true
  });
};

function hydrateChildren(recipe) {
  if (typeof recipe !== "function") {
    throw new TypeError("hydrateChildren(recipe) expects a function");
  }

  const resolved = recipe(createDomppContext(this));
  const children = Array.isArray(resolved) ? resolved : [resolved];
  return this.setChildren(...children);
}

export function installDomppHydration({ overrideSetChildren = false } = {}) {
  defineOn(Element.prototype, "hydrateChildren", hydrateChildren);
  defineOn(DocumentFragment.prototype, "hydrateChildren", hydrateChildren);

  if (!overrideSetChildren) {
    return;
  }

  defineOn(Element.prototype, "setChildren", hydrateChildren);
  defineOn(DocumentFragment.prototype, "setChildren", hydrateChildren);
}

