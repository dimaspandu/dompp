/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

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
          The outer container stays static. Only the inner{" "}<code>createComponent</code>{" "}subtree
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
