(function({ document }) {
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
})(window);

(function({ document }) {
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
})(window);

/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

// Example 02: Basic DOM with JSX (direct element mutation, no component rerender).
(function({ document }) {
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
})(window);

// Example 03: Component with JSX (render + rerender patches the existing DOM).
(function({ document }) {
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

  document.getElementById("component-app").setChildren([
    likeComponent.render()
  ]);
})(window);

// Example 04: MVVM with JSX (ViewModel owns state and notifies subscribers).
(function({ document }) {
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
    likeComponent.render()
  );

  viewModel.subscribe(() => likeComponent.rerender());
})(window);

// Example 05: Local stateful subtree inside a stateless view (ViewModel-driven).
(function({ document }) {
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
        <button class="action-button" type="button" onClick={() => viewModel.increment()}>
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
        {stateful.render()}
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
})(window);

// Example 06: Conditional rendering with JSX (null removes the subtree).
(function({ document }) {
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
          confirming = true;
          rerender();
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

  document.getElementById("conditional-app").setChildren([
    validator.render(),
  ]);
})(window);

// Example 07: Keyed list with JSX (stable keys preserve item nodes).
(function({ document }) {
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

  document.getElementById("keyed-list-app").setChildren([
    keyedList.render(),
  ]);
})(window);

// Example 08: Fragments and arrays with JSX.
(function({ document }) {
  function ArrayChildComponent() {
    return [
      <div key="array-first" className="fragment-child fragment-child-a">
        Array child one
      </div>,
      <div key="array-second" className="fragment-child fragment-child-b">
        Array child two
      </div>,
      <button key="array-action" class="action-button" type="button">
        Array child button
      </button>,
    ];
  }

  const fragmentsExample = (
    <section className="demo-surface fragment-surface">
      <h3>Fragments and array components</h3>
      <p>
        A fragment is one wrapper node. An array-returning component contributes
        each returned node directly to its parent child list.
      </p>

      <h4>Literal fragment wrapper</h4>
      <p>
        The bordered parent has two direct children: its label and one literal
        fragment node. That fragment node owns the two nested div children.
      </p>
      <div className="fragment-box">
        <strong>Fragment parent</strong>
        <fragment>
          <div className="fragment-child fragment-child-a">
            Nested fragment child one
          </div>
          <div className="fragment-child fragment-child-b">
            Nested fragment child two
          </div>
        </fragment>
      </div>

      <h4>Array-returning component</h4>
      <p>
        The component returns three nodes. The parent receives its label,
        paragraph, and the three returned nodes.
      </p>
      <div className="fragment-box">
        <strong>Array parent heading</strong>
        <p>Array parent paragraph</p>
        <ArrayChildComponent />
      </div>

      <h4>The usage of document.createDocumentFragment()</h4>
      <p>
        How does the new document.createDocumentFragment work.
      </p>
      <div className="fragment-box">
        {document.createDocumentFragment().setChildren([
          <strong>Array parent heading</strong>,
          <p>Array parent paragraph</p>,
        ])}
        <h5 styles={{ marginTop: "0.5rem" }}>
          {document.createDocumentFragment().setText("OR")}
        </h5>
        {document.createDocumentFragment(
          <strong>Array parent heading</strong>,
          <p>Array parent paragraph</p>,
        )}
        <h5 styles={{ marginTop: "0.5rem" }}>
          {document.createDocumentFragment("OR")}
        </h5>
        {document.createComponent((rerender) =>
          document.createDocumentFragment(
            <strong>Array parent heading</strong>,
            <p>Array parent paragraph</p>,
            <button
              class="action-button"
              type="button"
            >
              Array child button
            </button>,
          )
        )}
      </div>
    </section>
  );

  document.getElementById("fragment-array-app").setChildren([
    fragmentsExample,
  ]);
})(window);
