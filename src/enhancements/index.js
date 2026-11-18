import { installFragmentEnhancements } from "./fragment.js";
import { installElementEnhancements } from "./element.js";
import { installDocumentEnhancements } from "./document.js";

export function installEnhancements(builders) {
  installFragmentEnhancements(builders);
  installElementEnhancements(builders);
  installDocumentEnhancements(builders);
  return builders;
}
