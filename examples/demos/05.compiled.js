

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
    document.createElement("div", { "className": "stateful-card" }, document.createElement("h3", null, "Count:", viewModel.count), document.createElement("button", { "class": "action-button", "type": "button", "onClick": () => viewModel.increment() }, "UPDATE"))
  ));

  const container = (
    document.createElement("div", { "class": "demo-surface lsisv-surface" }, document.createElement("div", { "class": "lsisv-header" }, document.createElement("h2", null, "Local stateful inside stateless"), document.createElement("p", null, "The outer container stays static. Only the inner", " ", document.createElement("code", null, "createComponent"), " ", "subtree rerenders when the ViewModel notifies listeners.")), stateful)
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
