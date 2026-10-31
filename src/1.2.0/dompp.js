// Keep the existing DOM++ API and its prototype installation unchanged.
import "../1.1.1/index.js";
import { installDOMPP } from "../1.1.1/install/install-dompp.js";

export const createDOMPP = () => installDOMPP();

export const version = "1.1.1";
