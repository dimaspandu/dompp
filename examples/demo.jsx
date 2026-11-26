/*
 * DOM++ interaction examples — a guided tour.
 *
 * The examples build on each other:
 * 1. Foundations: direct DOM control (imperative updates, then reconciliation).
 * 2. Syntax & components: express the same ideas with JSX and createComponent.
 * 3. State patterns: separate state, subscribe, and localize rerenders.
 * 4. Dynamic structure: control what renders (conditions) and how lists keep identity.
 * 5. Composition: wrappers vs inlined fragment/array children and per-slot updates.
 * 6. Adoption: attach to existing (server-rendered) markup and make it reactive.
 */

// -----------------------------------------------------------------------------
// Chapter 1 — Foundations: direct DOM control
// -----------------------------------------------------------------------------

// Example 01.0: Basic DOM (direct element mutation).
// Hold references to nodes and update only what changes. No rerender pass.
(function({ document }) {
// EXAMPLE_START:01.0
  let basicLikes = 0;
  let basicCount;
  let basicButton;

  document.getElementById("basic-app-01.0")
    .setAttributes({ class: "demo-surface basic-surface" })
    .setStyles({ backgroundColor: "#fffebb" })
    .setChildren([
      document.createElement("div")
        .setAttributes({ class: "like-row" })
        .setChildren([
          (basicCount = document.createElement("strong").setText(basicLikes)),
          document.createElement("span").setText(" likes"),
        ]),
      (basicButton = document.createElement("button")
        .setAttributes({ class: "like-button", type: "button" })
        .setText("♥ Like")
        .setEvents({
          click() {
            basicLikes++;
            basicButton.setStyles({
              fontStyle: basicLikes % 2 !== 0 ? "italic" : "normal",
            });
            basicCount.setText(basicLikes);
            if (basicLikes === 10) {
              basicButton.setAttributes({ disabled: true });
            }
          },
        })),
    ]);
// EXAMPLE_END:01.0
})(window);

// Example 01.1: Basic DOM (direct element mutation with child reconciliation).
// Step up from 01.0: re-render by replacing children and let reconciliation patch the tree.
(function({ document }) {
// EXAMPLE_START:01.1
  let basicLikes = 0;
  let basicApp;

  basicApp = document.createElement(
    document.getElementById("basic-app-01.1"),
    {
      className: "demo-surface basic-surface",
      styles: { backgroundColor: "#fffebb" },
    },
    renderChildren()
  );

  function renderChildren() {
    return [
      document.createElement(
        "div",
        { class: "like-row" },
        document.createElement("strong").setText(basicLikes),
        document.createElement("span").setText(" likes")
      ),
      document.createElement(
        "button",
        {
          class: "like-button",
          type: "button",
          styles: { fontStyle: basicLikes % 2 !== 0 ? "italic" : "normal" },
          disabled: basicLikes === 10,
          onClick() {
            basicLikes++;
            basicApp.setChildren(renderChildren());
          },
        },
        "♥ Like"
      ),
    ];
  }
// EXAMPLE_END:01.1
})(window);

// -----------------------------------------------------------------------------
// Chapter 2 — Syntax & components: JSX and the render/rerender model
// -----------------------------------------------------------------------------

/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

// Example 02: Basic DOM with JSX (direct element mutation, no component rerender).
// Same direct-mutation idea as 01, written with familiar JSX syntax.
(function({ document }) {
// EXAMPLE_START:02
  let basicLikes = 0;
  let basicCount;

  function BasicApp(_props, ...children) {
    return document.createElement(
      document.getElementById("basic-jsx-app"),
      _props,
      ...children
    );
  }

  <BasicApp
    className="demo-surface jsx-surface"
    styles={{
      backgroundColor: "#fffebb",
    }}
  >
    <div class="like-row">
      {basicCount = <strong>{basicLikes}</strong>}
      <span> likes</span>
    </div>
    <button
      class="like-button"
      type="button"
      onClick={() => {
        basicLikes++;
        basicCount.setText(basicLikes);
      }}
    >
      ♥ Like
    </button>
  </BasicApp>
// EXAMPLE_END:02
})(window);

// Example 03: Component with JSX (render + rerender patches the existing DOM).
// Move from manual updates to a component: render once, then rerender to patch.
(function({ document }) {
// EXAMPLE_START:03
  let componentLikes = 0;

  const likeComponent = document.createComponent((rerender) => (
    <section class="demo-surface component-surface">
      <div class="like-row">
        <strong>{componentLikes}</strong>
        <span> likes</span>
      </div>
      <button
        class="like-button"
        type="button"
        onClick={() => rerender(() => componentLikes++)}
      >
        ♥ Like
      </button>
    </section>
  ));

  document.getElementById("component-app").setChildren(
    likeComponent
  );
// EXAMPLE_END:03
})(window);

// -----------------------------------------------------------------------------
// Chapter 3 — State patterns: separate, subscribe, and localize rerenders
// -----------------------------------------------------------------------------

// Example 04: MVVM with JSX (ViewModel owns state and notifies subscribers).
// Separate state (ViewModel) from the view: the view subscribes and rerenders.
(function({ document }) {
// EXAMPLE_START:04
  function LikeViewModel() {
    let likes = 0;
    const listeners = new Set();

    return {
      get likes() {
        return likes;
      },

      like() {
        likes++;
        listeners.forEach(listener => listener(likes));
      },

      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      }
    };
  }

  const viewModel = LikeViewModel();
  const likeComponent = document.createComponent(() => (
    <section class="demo-surface mvvm-surface">
      <div class="like-row">
        <strong>{viewModel.likes}</strong>
        <span> likes</span>
      </div>
      <button
        class="like-button"
        type="button"
        onClick={() => viewModel.like()}
      >
        ♥ Like
      </button>
    </section>
  ));

  // Example without using setChildren.
  document.createElement(
    document.getElementById("mvvm-app"),
    null,
    likeComponent
  );

  viewModel.subscribe(() => likeComponent.rerender());
// EXAMPLE_END:04
})(window);

// Example 05: Local stateful subtree inside a stateless view (ViewModel-driven).
// Localize rerenders: only the embedded stateful subtree updates, not the whole view.
(function({ document }) {
// EXAMPLE_START:05
  function createViewModel() {
    const listeners = new Set();
    let count = 0;

    return {
      get count() {
        return count;
      },

      increment() {
        count++;
        this.notifyListener();
      },

      addListener(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },

      notifyListener() {
        listeners.forEach((listener) => listener(this));
      },
    };
  }

  function createView(viewModel) {
    const stateful = document.createComponent(() => (
      <div className="stateful-card">
        <h3>Count: {viewModel.count}</h3>
        <button
          class="action-button"
          type="button"
          onClick={() => viewModel.increment()}
        >
          UPDATE
        </button>
      </div>
    ));

    const container = (
      <div class="demo-surface lsisv-surface">
        <div class="lsisv-header">
          <h2>Local stateful inside stateless</h2>
          <p>
            The outer container stays static. Only the inner <code>createComponent</code> subtree
            rerenders when the ViewModel notifies listeners.
          </p>
        </div>
        {stateful}
      </div>
    );

    viewModel.addListener(() => stateful.rerender());

    return container;
  }

  const viewModel = createViewModel();
  const view = createView(viewModel);

  document.createElement(
    document.getElementById("lsisv-app"),
    null,
    view
  );
// EXAMPLE_END:05
})(window);

// -----------------------------------------------------------------------------
// Chapter 4 — Dynamic structure: what renders and how lists keep identity
// -----------------------------------------------------------------------------

// Example 06: Conditional rendering with JSX (null removes the subtree).
// After controlling where rerenders happen (05), control what renders:
// a null branch removes the subtree from the tree.
(function({ document }) {
// EXAMPLE_START:06
  let confirming = false;

  const validator = document.createComponent((rerender) => (
    <section className="demo-surface conditional-surface">
      <h3>Conditional child reconciliation</h3>
      <p>
        The panel is added or removed by rerendering only this component.
        A <code>null</code> branch leaves no node in the virtual tree.
      </p>
      <button
        class="action-button"
        type="button"
        onClick={() => {
          if (!confirming) {
            confirming = true;
            rerender();
          }
        }}
      >
        OPEN
      </button>
      {confirming ? (
        <div className="conditional-panel" role="dialog" aria-label="Confirm">
          <h4>Are you sure?</h4>
          <button
            class="action-button"
            type="button"
            onClick={() => {
              confirming = false;
              rerender();
            }}
          >
            CLOSE
          </button>
        </div>
      ) : null}
    </section>
  ));

  document.getElementById("conditional-app").setChildren(
    validator,
  );
// EXAMPLE_END:06
})(window);

// Example 07: Keyed list with JSX (stable keys preserve item nodes).
// Give dynamic lists identity: stable keys preserve nodes across reorder/insert/remove.
(function({ document }) {
// EXAMPLE_START:07
  let nextId = 4;
  let items = [
    { id: 1, label: "Alpha", tag: "article" },
    { id: 2, label: "Bravo", tag: "article" },
    { id: 3, label: "Charlie", tag: "article" },
  ];

  const keyedList = document.createComponent((rerender) => (
    <section className="demo-surface keyed-surface">
      <h3>Keyed child reconciliation</h3>
      <p>
        Stable keys preserve item nodes when the list order changes.
        Changing an item's tag intentionally replaces its node.
      </p>
      <div className="keyed-controls">
        <button
          class="keyed-button"
          type="button"
          onClick={() => {
            const id = nextId++;
            items = [...items, { id, label: `Item ${id}`, tag: "article" }];
            rerender();
          }}
        >
          APPEND
        </button>
        <button
          class="keyed-button"
          type="button"
          onClick={() => {
            const id = nextId++;
            items = [{ id, label: `Item ${id}`, tag: "article" }, ...items];
            rerender();
          }}
        >
          PREPEND
        </button>
        <button
          class="keyed-button"
          type="button"
          onClick={() => {
            items = [...items].reverse();
            rerender();
          }}
        >
          REVERSE
        </button>
        <button
          class="keyed-button"
          type="button"
          onClick={() => {
            items = items.slice(1);
            rerender();
          }}
        >
          REMOVE FIRST
        </button>
        <button
          class="keyed-button"
          type="button"
          onClick={() => {
            if (items.length) {
              const [first, ...remaining] = items;
              items = [{
                ...first,
                tag: first.tag === "article" ? "p" : "article",
              }, ...remaining];
              rerender();
            }
          }}
        >
          CHANGE FIRST TAG
        </button>
      </div>
      <div className="keyed-list">
        {items.map((item) => {
          const Tag = item.tag;
          return (
            <Tag key={item.id} className="keyed-item">
              {item.label} (key: {item.id})
            </Tag>
          );
        })}
      </div>
    </section>
  ));

  document.getElementById("keyed-list-app").setChildren(
    keyedList,
  );
// EXAMPLE_END:07
})(window);

// -----------------------------------------------------------------------------
// Chapter 5 — Composition: wrappers, inlined fragment/array children, per-slot updates
// -----------------------------------------------------------------------------

// Example 08: Fragments and arrays with JSX (a composition catalog).
// Compare forms: a wrapper element (<fragment>) vs inlined child arrays
// (<>...</>, elementBuilder.fragment, document.createDocumentFragment(...)),
// plus array-returning components reconciled per slot.
(function({ document }) {
// EXAMPLE_START:08
  let showPanel = false;
  let renderCount = 0;

  // A component may return an array. When rendered through createComponent,
  // each slot is reconciled on rerender (a slot can become null and be removed).
  function ArrayChildList({ rerender }) {
    return [
      <div key="a" className="fragment-child fragment-child-a">
        Array child A
      </div>,
      <div key="b" className="fragment-child fragment-child-b">
        Array child B (renders: {renderCount})
      </div>,
      <button
        key="action"
        class="action-button"
        type="button"
        onClick={() => rerender(() => renderCount++)}
      >
        Rerender array slots
      </button>,
    ];
  }

  // Fragment-producing APIs (<>...</>, elementBuilder.fragment,
  // document.createDocumentFragment(...)) return a flat child array that is
  // inlined into the parent. As a component result it is reconciled per slot.
  const inlineFragmentPanel = document.createComponent((rerender) =>
    document.createDocumentFragment(
      <strong>Inline fragment array</strong>,
      <p>Time: {new Date().toLocaleTimeString()}</p>,
      <button
        class="action-button"
        type="button"
        onClick={() => rerender(() => (showPanel = true))}
      >
        Open panel
      </button>,
      showPanel ? (
        <div className="conditional-panel" role="dialog" aria-label="Panel" style={{ marginTop: "10px" }}>
          <h4>Conditional slot</h4>
          <p>This slot is removed when it becomes null.</p>
          <button
            class="action-button"
            type="button"
            onClick={() => rerender(() => (showPanel = false))}
          >
            Close
          </button>
        </div>
      ) : null
    )
  );

  // The root view is a component so child array components can request rerenders.
  const view = document.createComponent((rerender) => (
    <section className="demo-surface fragment-surface">
      <h3>Fragments and arrays</h3>
      <p>
        Fragment-producing forms (<code>{"<>"}...{"</>"}</code>,{" "}
        <code>elementBuilder.fragment</code>,{" "}
        <code>document.createDocumentFragment(...)</code>) return a flat child
        array that is inlined (no wrapper node). Use{" "}
        <code>{"<"}fragment{">"}</code> or{" "}
        <code>document.createElement("fragment")</code> for an explicit wrapper
        element.
      </p>

      <h4>{"<"}fragment{">"} wrapper element</h4>
      <p>
        <code>{"<"}fragment{">"}</code> creates a real wrapper element node that
        owns its children.
      </p>
      <div className="fragment-box">
        <strong>Parent</strong>
        <fragment>
          <div className="fragment-child fragment-child-a">Wrapped child one</div>
          <div className="fragment-child fragment-child-b">Wrapped child two</div>
        </fragment>
      </div>

      <h4>JSX fragment {"<"}{">"}...{"<"}/{">"} (inlined array)</h4>
      <p>Children are contributed directly to the parent with no wrapper.</p>
      <div className="fragment-box">
        <strong>Parent label</strong>
        <>
          <div className="fragment-child fragment-child-a">Inlined child one</div>
          <div className="fragment-child fragment-child-b">Inlined child two</div>
        </>
      </div>

      <h4>Array-returning component (per-slot rerender)</h4>
      <p>
        The component returns an array; each slot is compared and updated on
        rerender.
      </p>
      <div className="fragment-box">
        <strong>Parent label</strong>
        <ArrayChildList rerender={rerender} />
      </div>

      <h4>document.createDocumentFragment(...) child arrays</h4>
      <p>
        Returns/updates a flat child array. <code>.setChildren</code> and{" "}
        <code>.setText</code> mutate the array in place.
      </p>
      <div className="fragment-box">
        {document.createDocumentFragment(
          <strong>Static fragment array</strong>,
          <p>Two nodes inlined with no wrapper.</p>
        )}
        <h5 style={{ margin: "0.5rem 0" }}>
          {document.createDocumentFragment("Text-only fragment array")}
        </h5>
        {document.createDocumentFragment()
          .setChildren([
            <em key="set-children">Built via .setChildren([...])</em>,
          ])}
        <div style={{ marginTop: "0.5rem" }}>
          {inlineFragmentPanel}
        </div>
      </div>
    </section>
  ));

  document.getElementById("fragment-array-app").setChildren(view);
// EXAMPLE_END:08
})(window);

// Example 09: Keyed list inside a real fragment (createDocumentFragment array).
// Combine 07 and 08: keys still preserve item identity when the list is produced
// inside an inlined fragment (child array), not a wrapper element.
(function({ document }) {
// EXAMPLE_START:09
  let nextId = 4;
  let items = [
    { id: 1, label: "Alpha" },
    { id: 2, label: "Bravo" },
    { id: 3, label: "Charlie" },
  ];

  const keyedFragment = document.createComponent((rerender) => (
    <section className="demo-surface keyed-surface">
      <h3>Keyed list inside a fragment</h3>
      <p>
        The list items are produced inside a real fragment array via{" "}
        <code>document.createDocumentFragment(...)</code> (not the{" "}
        <code>{"<"}fragment{">"}</code> wrapper element). The fragment inlines its
        children into the container while stable keys preserve item identity
        across updates.
      </p>
      <div className="keyed-controls">
        <button
          class="keyed-button"
          type="button"
          onClick={() => {
            const id = nextId++;
            items = [...items, { id, label: `Item ${id}` }];
            rerender();
          }}
        >
          APPEND
        </button>
        <button
          class="keyed-button"
          type="button"
          onClick={() => {
            const id = nextId++;
            items = [{ id, label: `Item ${id}` }, ...items];
            rerender();
          }}
        >
          PREPEND
        </button>
        <button
          class="keyed-button"
          type="button"
          onClick={() => {
            items = [...items].reverse();
            rerender();
          }}
        >
          REVERSE
        </button>
        <button
          class="keyed-button"
          type="button"
          onClick={() => {
            if (items.length) {
              items = items.slice(1);
              rerender();
            }
          }}
        >
          REMOVE FIRST
        </button>
      </div>
      <div className="keyed-list">
        {document.createDocumentFragment(
          ...items.map((item) => (
            <div key={item.id} className="keyed-item">
              {item.label} (key: {item.id})
            </div>
          ))
        )}
      </div>
    </section>
  ));

  document.getElementById("keyed-fragment-app").setChildren(keyedFragment);
// EXAMPLE_END:09
})(window);

// -----------------------------------------------------------------------------
// Chapter 6 — Adoption: attach to existing markup and make it reactive
// -----------------------------------------------------------------------------

// Example 10: Server DOM adoption (hydrate existing markup).
// HYDRATE (method 1): document.hydrateElement(existingNode, props, children)
// adopts the server-rendered <ul> and reconciles against it while preserving
// server children NOT described in the virtual tree (non-destructive).
// DOM identity of the <ul> root is preserved.
(function({ document }) {
// EXAMPLE_START:10
  // Data embedded by the server alongside the rendered HTML.
  const serverMessages = JSON.parse(
    document.getElementById("adoption-data").textContent
  );

  const listNode = document.getElementById("adoption-list");
  const statusNode = document.getElementById("adoption-status");

  // Adopt the existing <ul> node and reconcile a keyed descriptor tree against
  // its current children instead of destroying and recreating them.
  const listBuilder = document.hydrateElement(
    listNode,
    null,
    ...[...serverMessages]
      .reverse()
      .map((msg) => <li key={msg.id}>{msg.text}</li>)
  );

  const adopted = listBuilder.node === listNode;
  statusNode.setText(
    "Adopted existing <ul>: " + adopted +
    " · reconciled items: " + listBuilder.struct.children.length +
    " · same DOM node kept: " + adopted
  );
// EXAMPLE_END:10
})(window);

// Example 11: Reactive server messenger (hydrate + rerender).
// HYDRATE (method 1): document.hydrateElement(rootNode, props, children)
// adopts the pre-rendered container root and rerenders a keyed message list
// reactively while keeping the same DOM root node. Server children NOT
// described in the virtual tree are preserved (non-destructive).
// Contrast with document.createElement(node, props, children) which reconciles
// and replaces old children not in the new tree (destructive).
(function({ document }) {
// EXAMPLE_START:11
  // Data embedded by the server alongside the rendered HTML.
  const messages = JSON.parse(
    document.getElementById("messenger-data").textContent
  );
  let nextId = Math.max(...messages.map((m) => m.id)) + 1;

  const rootNode = document.getElementById("messenger-app");

  const messenger = document.createComponent((rerender) =>
    document.hydrateElement(
      rootNode,
      { class: "demo-surface messenger-surface" },
      <h3>Reactive server messenger</h3>,
      <p>
        This component adopts the pre-rendered container (same root node) and
        rerenders a keyed message list when you send a message.
      </p>,
      <ul class="server-list">
        {[...messages].reverse().map((msg) => (
          <li key={msg.id}>{msg.text}</li>
        ))}
      </ul>,
      <div class="message-form">
        <textarea
          class="message-input"
          aria-label="New message"
          placeholder="Write a message..."
        ></textarea>
        <button
          class="action-button"
          type="button"
          onClick={() => {
            const input = rootNode.querySelector("textarea");
            const text = input.value.trim();
            if (!text) return;
            messages.push({ id: nextId++, text });
            input.value = "";
            rerender();
          }}
        >
          Send
        </button>
      </div>,
      <p id="messenger-status" class="status-note">
        {"Adopted root node · messages: " + messages.length}
      </p>
    )
  );

  // ComponentBuilder renders immediately and adopts the existing root.
// EXAMPLE_END:11
})(window);

// -----------------------------------------------------------------------------
// Chapter 7 — Cross-component updates: direct references and rerender
// -----------------------------------------------------------------------------

// Example 12: Cross-component update (components rerender each other directly).
// createComponent returns the element with .rerender(), so components can hold
// references to each other and trigger targeted updates without a parent intermediary.
(function({ document }) {
// EXAMPLE_START:12
  let countA = 0;
  let countB = 0;

  const componentA = document.createComponent((rerender) => (
    <section className="cross-card">
      <h4>Component A</h4>
      <p className="cross-count">Count: {countA}</p>
      <div className="cross-actions">
        <button class="action-button" type="button" onClick={() => rerender(() => countA++)}>
          +1 A (self)
        </button>
        <button class="action-button" type="button" onClick={() => { countB++; componentB.rerender(); }}>
          +1 B (from A)
        </button>
      </div>
    </section>
  ));

  const componentB = document.createComponent((rerender) => (
    <section className="cross-card">
      <h4>Component B</h4>
      <p className="cross-count">Count: {countB}</p>
      <div className="cross-actions">
        <button class="action-button" type="button" onClick={() => rerender(() => countB++)}>
          +1 B (self)
        </button>
        <button class="action-button" type="button" onClick={() => { countA++; componentA.rerender(); }}>
          +1 A (from B)
        </button>
      </div>
    </section>
  ));

  document.getElementById("cross-update-app").setChildren([componentA, componentB]);
// EXAMPLE_END:12
})(window);
