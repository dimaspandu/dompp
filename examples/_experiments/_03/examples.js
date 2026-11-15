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
