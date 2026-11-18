const INSTALLED = Symbol.for("dompp.fragment.enhancements");

function getBuilders(target) {
  const doc = target && target.ownerDocument;
  return doc && doc.__domppBuilders;
}

export function installFragmentEnhancements(builders) {
  const { DocumentFragment, doc } = builders;

  if (!DocumentFragment || !DocumentFragment.prototype) {
    return builders;
  }

  if (doc) doc.__domppBuilders = builders;

  if (DocumentFragment.prototype[INSTALLED]) {
    return builders;
  }

  Object.defineProperty(DocumentFragment.prototype, "setChildren", {
    value: function(...children) {
      const b = getBuilders(this);
      if (!b) throw new Error("DOM++ builders are not installed for this document.");
      return b.asFragmentChildren(children);
    },
    writable: false,
    configurable: true,
  });

  Object.defineProperty(DocumentFragment.prototype, "setText", {
    value: function(text) {
      const b = getBuilders(this);
      if (!b) throw new Error("DOM++ builders are not installed for this document.");
      return b.asFragmentChildren([text]);
    },
    writable: false,
    configurable: true,
  });

  Object.defineProperty(DocumentFragment.prototype, INSTALLED, {
    value: true,
    configurable: true,
  });

  return builders;
}
