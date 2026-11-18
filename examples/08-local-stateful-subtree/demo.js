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
  document.createElement("div").setAttributes({ class: "stateful-card" }).setChildren(
    document.createElement("h3").setText("Count: " + viewModel.count),
    document.createElement("button")
      .setText("UPDATE")
      .setAttributes({ type: "button" })
      .setEvents({ click() { viewModel.increment(); } })
  )
));

viewModel.subscribe(() => stateful.rerender());

const app = document.getElementById("app");
app.setChildren(
  document.createElement("div").setAttributes({ class: "demo-surface" }).setChildren(
    document.createElement("h2").setText("Local stateful inside stateless"),
    document.createElement("p").setText("The outer container stays static. Only the inner component subtree updates."),
    stateful
  )
);
