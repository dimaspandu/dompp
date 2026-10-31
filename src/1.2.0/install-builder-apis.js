import { defineOn } from "../1.1.1/core/define-on.js";
import { elementBuilder, componentBuilder } from "./element-builder.js";

export function installBuilderApis() {
  if (typeof Document === "undefined") {
    return;
  }

  defineOn(Document.prototype, "elementBuilder", function (...args) {
    return elementBuilder(...args);
  });

  defineOn(Document.prototype, "componentBuilder", function (...args) {
    return componentBuilder(...args);
  });
}
