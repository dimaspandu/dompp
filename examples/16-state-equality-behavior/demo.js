const primitive = document.createElement("div")
  .setState({ count: 0 })
  .setChildren(({ state, setState }) => [
    document.createElement("p").setText("Primitive: " + state.count),
    document.createElement("button").setText("Increment").setEvents({ click() { setState({ count: state.count + 1 }); } })
  ]);

const object = document.createElement("div")
  .setState({ data: { count: 0 } })
  .setChildren(({ state, setState }) => [
    document.createElement("p").setText("Object: " + state.data.count),
    document.createElement("button").setText("Mutate (no rerun)").setEvents({ click() { state.data.count++; } }),
    document.createElement("button").setText("Replace (reruns)").setEvents({ click() { setState({ data: { count: state.data.count + 1 } }); } })
  ]);

app.setChildren(primitive, object);