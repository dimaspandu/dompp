# DOM++ 1.2.0 examples

Open this directory through the repository development server (`npm run dev`)
so native ESM imports and `.jsx` module responses are served correctly.

- `dompp-only.html` imports the existing DOM++ setter API from `src/1.2.0/dompp.js`.
- `builders-only.html` imports the DOM++ builder extensions from `src/1.2.0/dompp-builders.js`, which install `document.elementBuilder` and `document.componentBuilder`.
- `combined.html` imports the existing setters and both builder APIs from `src/1.2.0/index.js`.

Each page loads an external `.jsx` module with `<script type="module">`. The
development server transforms that module with `libs/js-analyzer/lib/transpileJSX`
and responds with JavaScript. No Babel runtime or JSX build step is used in the
browser.

Builder examples mount their roots with
`document.elementBuilder(app, null, ...children)`; that call reconciles into
the existing app node and returns it directly.
