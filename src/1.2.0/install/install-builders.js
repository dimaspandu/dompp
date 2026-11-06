import { defineOn }
from "../core/define-on.js";

import { elementBuilder }
from "../builders/elementBuilder.js";

import { componentBuilder }
from "../builders/componentBuilder.js";

export function installBuilders() {

  defineOn(
    Document.prototype,
    "elementBuilder",
    elementBuilder
  );

  defineOn(
    Document.prototype,
    "componentBuilder",
    componentBuilder
  );

  if (typeof window !== "undefined") {
    window.elementBuilder ??= elementBuilder;
    window.componentBuilder ??= componentBuilder;
  }
}