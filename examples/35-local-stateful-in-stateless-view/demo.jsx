/** @jsx elementBuilder */

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
  const stateful = componentBuilder(() => (
    <div className="stateful-card">
      <h3>Count: {viewModel.count}</h3>
      <button type="button" onClick={() => viewModel.increment()}>
        UPDATE
      </button>
    </div>
  ));

  const container = (
    <div>
      <h2>Local stateful inside stateless</h2>
      <p className="note">
        The outer container is plain/static structure. Only the inner <code>componentBuilder</code> subtree
        rerenders when the ViewModel notifies listeners.
      </p>
      {stateful.render()}
    </div>
  );

  viewModel.addListener(() => stateful.rerender());

  return container;
}

const viewModel = createViewModel();
const view = createView(viewModel);

elementBuilder(document.getElementById("app"), null, view);