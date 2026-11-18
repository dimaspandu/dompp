import { createBuilders } from "../builders/index.js";
import { installEnhancements } from "../enhancements/index.js";

export function installDOMPP(doc = globalThis.document) {
  const builders = createBuilders(doc);
  installEnhancements(builders);

  return {
    version: "1.6.8",
    ...builders,
  };
}
