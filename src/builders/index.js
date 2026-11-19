/**
 * Foundation builders (ElementBuilder, ComponentBuilder).
 * Exposed for tests and advanced usage. Application code should use src/index.js.
 */

export { createElementBuilder } from "./element-builder.js";
export { createComponentBuilder } from "./component-builder.js";

import { createElementBuilder } from "./element-builder.js";
import { createComponentBuilder } from "./component-builder.js";

export function createBuilders(doc = globalThis.document) {
  const element = createElementBuilder(doc);
  const component = createComponentBuilder({
    reconcileSlot: element.reconcileSlot,
    attachedEventsByNode: element.attachedEventsByNode,
  });

  return {
    ...element,
    ...component,
  };
}
