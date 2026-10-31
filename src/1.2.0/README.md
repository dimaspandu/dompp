# DOM++ 1.2.0 entry points

DOM++ 1.2.0 keeps the existing 1.1.1 setter runtime intact and adds isolated
`elementBuilder` and `componentBuilder` APIs. Choose the entry point that fits
each part of an application:

```js
// Existing DOM++ setters only.
import { createDOMPP } from "./dompp.js";

// DOM++ builder extensions only; adds methods to Document.
import "./dompp-builders.js";
document.elementBuilder("main", null, "Hello");
document.componentBuilder(() => document.elementBuilder("p", null, "Reactive"));

// Both the existing setters and the builder APIs.
import { createDOMPP } from "./index.js";
const dompp = createDOMPP();
document.elementBuilder("main", null, dompp.version);
document.componentBuilder(() => document.elementBuilder("p", null, "Reactive"));
```

`elementBuilder` stores a virtual structure and applies its own attributes,
styles, and events directly to the associated DOM node. Its child reconciliation
supports positional matching and stable sibling keys. JSX fragments become a
literal `<fragment>` element so each structure child corresponds to one DOM
child. The builder sets `display: contents` on that element by default.

`componentBuilder` hides its render function and current component tree in a
closure. `render()` returns the DOM root; `rerender()` rebuilds the structure
and reconciles it with the existing DOM.

`elementBuilder` and `componentBuilder` are installed as
`document.elementBuilder` and `document.componentBuilder`. The builder-only
entry point does not install the existing Element setter methods. The combined
entry point installs both APIs.

The APIs do not call the DOM++ setters internally. Import `index.js` when a page
needs both APIs, or `dompp-builders.js` when it only needs the new extensions.

Pass an existing DOM node as the first argument to build directly into it:

```js
document.elementBuilder(app, null, heading, content);
```

This reconciles the supplied children into `app` and returns `app`, so mounting
does not need a separate `appendChild()` or `.toNode()` call.
