const display = document.createElement("div")
  .setAttributes({ class: "card" })
  .setState({ total: 0 })
  .setChildren(({ state }) => document.createElement("h2").setText("Total: " + state.total));

const controls = document.createElement("div").setChildren(
  document.createElement("button").setText("+10000").setEvents({ click() { display.setState(({ state }) => ({ total: state.total + 10000 })); } }),
  document.createElement("button").setText("+25000").setEvents({ click() { display.setState(({ state }) => ({ total: state.total + 25000 })); } })
);

app.setChildren(display, controls);