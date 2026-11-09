const counter = document.createElement("button")
  .setState({ count: 0 })
  .setText(({ state }) => "Count: " + state.count)
  .setEvents(({ state, setState }) => ({ click() { setState({ count: state.count + 1 }); } }));

const panel1 = document.createElement("div").setAttributes({ class: "card" }).setChildren(counter);
const panel2 = document.createElement("div").setAttributes({ class: "card" }).setChildren(
  document.createElement("p").setText("Same counter, different parent:"),
  counter
);

app.setChildren(panel1, panel2);