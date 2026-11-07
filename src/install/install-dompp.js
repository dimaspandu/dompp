import { installSetters }
from "./install-setters.js";

import { installFragment }
from "./install-fragment.js";

import { installDocumentApi }
from "./install-document-api.js";

import { installReactiveWrappers }
from "./install-reactive-wrappers.js";

import { createSignal }
from "../runtime/signals.js";

import { createSignalEffect }
from "../runtime/signals.js";
import { installBuilders } from "./install-builders.js";

export function installDOMPP() {

  installSetters();

  installFragment();

  installDocumentApi();

  installReactiveWrappers();

  installBuilders();

  return {

    version: "1.6.5",

    createSignal,

    createSignalEffect
  };
}