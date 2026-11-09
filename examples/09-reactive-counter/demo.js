const counter = document.createElement("button")
  .setState({ count: 0 })
  .setText(({ state }) => "Count: " + state.count)
  .setStyles(({ state }) => ({
    background: state.count % 2 === 0 ? "black" : "tomato",
    transform: "scale(" + (1 + state.count * 0.02) + ")"
  }))
  .setAttributes(({ state }) => ({ class: "counter", title: "Current count: " + state.count }))
  .setEvents(({ state, setState }) => ({
    click() { setState({ count: state.count + 1 }); }
  }));

app.setChildren(counter);