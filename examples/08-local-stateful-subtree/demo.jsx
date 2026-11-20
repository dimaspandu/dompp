/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

function createViewModel() {
  const listeners = new Set();
  let count = 0;
  return {
    get count() { return count; },
    increment() {
      count++;
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const viewModel = createViewModel();

const stateful = document.createComponent((rerender) => (
  <div className="stateful-card">
    <h3>Count: {viewModel.count}</h3>
    <button className="action-button" type="button" onClick={() => viewModel.increment()}>
      UPDATE
    </button>
  </div>
));

viewModel.subscribe(() => stateful.rerender());

const app = document.getElementById("app");
app.setChildren(
  <div className="demo-surface lsisv-surface">
    <div className="lsisv-header">
      <h2>Local stateful inside stateless</h2>
      <p>The outer container stays static. Only the inner component subtree updates.</p>
    </div>
    {stateful}
  </div>
);