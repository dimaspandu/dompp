import { installBuilders }
from "./install/install-builders.js";

// Browser globals

if (
  typeof window !==
  "undefined"
) {

  installBuilders();

  window.elementBuilder =
    document.elementBuilder;

  window.componentBuilder =
    document.componentBuilder;
}