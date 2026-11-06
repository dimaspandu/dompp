# Builders (1.2.0)

This directory contains the virtual-descriptor DOM layer added in 1.2.0: `elementBuilder` and `componentBuilder`. It is designed to work with the existing DOMPP runtime while also being usable on its own through the minimal entrypoint.

## Goals

- Describe DOM nodes as small, mutable virtual descriptors.
- Update real DOM nodes directly (no virtual DOM tree diff against a separate renderer runtime).
- Support both fresh creation and hydration/attachment to existing DOM nodes.
- Keep reconciliation deterministic and local to the descriptor tree.

## Files

- `elementBuilder.js`: core descriptor class, JSX factory, reconciliation, hydration/attach logic.
- `componentBuilder.js`: stateful render/rerender wrapper around an `ElementBuilder` tree.
- `constants.js`: SVG namespace and tag/protocol/attribute allowlists used by builder logic.
- `validators.js`: attribute and URL safety validation, plus style-name normalization.
- `index.js`: public barrel export for builder symbols.

## Data Model

Each `ElementBuilder` instance holds:

- `struct.tag`: tag name (or special marker such as `fragment` for the JSX fragment helper).
- `struct.key`: optional stable identity for keyed reconciliation.
- `struct.attributes`: normalized attribute map.
- `struct.styles`: style properties (camelCase keys as used by DOM style assignment).
- `struct.events`: event handlers tracked for listener replacement/removal.
- `struct.children`: child descriptors (other `ElementBuilder` instances, primitive text, or existing DOM nodes in specific cases).
- `node`: the real DOM node, when materialized or adopted.
- `_attachedEvents`: the handlers currently attached to `node`.

Two `WeakMap`s associate metadata with real nodes:
- `attachedEventsByNode`: tracks live event handlers per node.
- `elementKeysByNode`: tracks keys for adopted/materialized nodes.

## `ElementBuilder` Lifecycle

### 1. Construction

`new ElementBuilder(selector)` supports two modes:

- **Adopt existing element** (`selector` is an `Element`): the builder reads the tag, attributes (validated), inline styles, and child nodes into `struct`. It intentionally skips unsafe/managed attributes during adoption (for example `style` is read via style APIs, and unsafe attributes are removed rather than preserved). Indentation-only whitespace text nodes are ignored except in whitespace-preserving tags (`pre`, `textarea`, `script`, `style`). Existing child elements are wrapped as `ElementBuilder` instances (except `script`, which is preserved as a node reference in the current model where applicable).
- **Create descriptor** (`selector` is a tag string): initializes an empty descriptor for later materialization.

Script elements are rejected for management/creation by the builder to avoid unsafe/dynamic script handling paths.

### 2. Setters (descriptor-first, optional immediate DOM update)

- `setAttributes(attrs)`: validates attributes, merges into `struct.attributes`, and applies/removes them on `node` if present. `false`/`null` removes; `true` sets an empty attribute.
- `setStyles(styles)`: merges into `struct.styles` and assigns to `node.style` if present (`null`/`undefined` clears a property).
- `setEvents(events)`: replaces changed handlers and removes handlers when the new value is not a function. This prevents listener accumulation across updates. The active handler map is stored in `_attachedEvents` and mirrored to `attachedEventsByNode`.
- `setText(text)`: convenience wrapper over `setChildren([text])`.
- `setChildren(children)`: flattens arrays, drops `null`/`boolean`, and either reconciles against `node.childNodes` (if materialized) or stores `struct.children` (if not).

### 3. Materialization

`toNode()` / `_createNode()` creates the real DOM node when needed:
- Uses `createElementNS(SVG_NS, tag)` for SVG-only tags listed in `constants.js`; otherwise `createElement`.
- Applies attributes, styles, and events, then reconciles children.
- Persists the key association on the node.

### 4. Reconciliation (`_reconcileChildren`)

Reconciliation updates `node.childNodes` to match `nextChildren` while preserving usable nodes where possible.

Matching strategy (in order of intent):
- **Keyed elements**: when a next child is an `ElementBuilder` with a non-null key, it is matched against a previous keyed child with the same key and tag. Keys must be strings or numbers; duplicates throw.
- **Unkeyed positional reuse**: if not keyed, it attempts to reuse the previous child at the same index when both are unkeyed `ElementBuilder`s of the same tag, or both are text-like values and the existing node is a text node. It may also reuse the exact same existing DOM node object when passed through.
- **Fallback**: create/insert a new node (materialized builder, passed DOM node, or text node).

Update behavior:
- Reused `ElementBuilder` children are patched via `_patchFrom(nextChild)` with their existing `node` attached.
- Reused text nodes are updated in place.
- Old nodes not present in the reconciled set are removed.
- Nodes are reordered with `insertBefore` only when necessary, walking backward to place nodes before the current anchor.

The method updates `struct.children` to the reconciled descriptor list.

### 5. Patching (`_patchFrom`)

`_patchFrom(next)` applies field-level changes from a next descriptor to an existing builder/node:
- Removes attributes no longer present, then applies next attributes.
- Clears removed styles, then applies next styles.
- Removes event handlers no longer present, then applies next events.
- Updates `struct` metadata (tag, key, attributes, styles, events) and persists the key.
- Reconciles children using the previous children as the comparison base.

### 6. Hydration / Attach (`_attachChildren`, `_attachFrom`)

Attach mode is used when adopting or hydrating existing server/client DOM without treating omitted children as deletions.

- `_attachFrom(next)` merges attributes/styles/events from `next` onto the adopted node and keeps unspecified existing children. If `next` provides children, it delegates to `_attachChildren`.
- `_attachChildren(children)` attempts to match provided descriptors to existing `struct.children` by key+tag, then by same-position compatible tag/text fallback (important for initial hydration where server nodes have no virtual keys yet). Matched existing builders are updated in place; references passed by callers are rebound to the adopted node/struct/handlers so external references remain valid. Any existing children not explicitly matched are preserved and appended after described children in the reconciled result, which avoids accidental deletion during partial hydration.

## JSX Factory (`elementBuilder` function)

`elementBuilder(tag, props, ...children)` is the JSX-compatible factory exported alongside the class:

- If `tag` is a function, it is treated as a custom component and invoked as `tag(props, ...children)`.
- Otherwise it creates an `ElementBuilder` for the tag.
- Props handling:
  - `on*` function props become DOM event listeners (e.g., `onClick` -> `click`).
  - `style` / `styles` are passed to `setStyles`.
  - `class` / `className` are normalized to the `class` attribute.
  - `key` is stored as `struct.key` and persisted (without becoming a DOM attribute).
  - Other props are treated as attributes and validated by `setAttributes`.
- If the target already has a node (adoption/hydration scenarios), children go through `_attachChildren`; otherwise `setChildren` performs normal reconciliation/materialization behavior.

`elementBuilder.fragment(...children)` returns an `ElementBuilder("fragment")` with flattened children. It is a descriptor-level fragment helper for JSX fragment syntax; consumers should materialize/handle it according to their rendering path.

## `ComponentBuilder`

`componentBuilder(builderFn)` wraps a render function that receives a `rerender` callback.

- `render()`: lazily creates the initial component tree by calling `builderFn(rerender)` once and caches the returned `ElementBuilder`.
- `rerender(callback?)`: optionally runs a state mutation callback, then builds a next `ElementBuilder` tree by calling `builderFn` again.
  - If the next builder resolves to the same root `node` (common for adopted/hydrated roots synchronized in place), it copies `struct` and `_attachedEvents` from `next` without replacing the node.
  - If tags match, it patches the existing component root via `_patchFrom(next)`.
  - If tags differ, it materializes `next.toNode()` and replaces the old root node in its parent (if mounted), then swaps the cached node/struct.

The instance is frozen (`Object.freeze`) to keep the public surface small. `ComponentBuilder` manages render timing/state orchestration at a high level; DOM diffing and mutation details remain in `ElementBuilder`.

## Safety and Validation

Validation is delegated to `validators.js` / `constants.js`:
- Inline event attributes (`on*`) are rejected; use `setEvents`.
- `srcdoc` and direct `style` attribute setting are restricted in favor of safer APIs.
- URL-bearing attributes are checked against allowed protocols. `href`/`xlink:href` allow HTTP(S), mailto, and tel; other URL attributes are restricted to HTTP(S). `srcset`-like attributes are parsed per candidate.

Adoption of existing DOM sanitizes unsafe attributes encountered during initial read by removing them from the live node.

## Integration Notes

- Full DOMPP install (`src/1.2.0/install/install-dompp.js`) installs setters, fragments, document API, reactive wrappers, and builders.
- Minimal builders-only usage can be provided via the 1.2.0 minimal entrypoint (no prototype setters/reactive wrappers), which is useful when only descriptor-based building/reconciliation is needed.
- `examples/experiments/*` currently use a local engine copy and are not coupled to `src/` entrypoint changes.

## Contributor Notes

- Preserve descriptor-first behavior: update `struct` consistently even when `node` is mutated immediately.
- Be careful with hydration/attach semantics: omitted children during attach must not delete existing server nodes.
- When changing reconciliation, verify keyed moves, unkeyed positional reuse, text updates, duplicate-key errors, and event handler replacement/removal.
- Script tag creation/management is intentionally restricted; do not weaken this without a security review.