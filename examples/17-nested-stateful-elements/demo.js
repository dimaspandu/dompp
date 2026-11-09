const parent = document.createElement("div")
  .setState({ parentCount: 0 })
  .setChildren(({ state, setState }) => [
    document.createElement("h3").setText("Parent: " + state.parentCount),
    document.createElement("button").setText("Parent +1").setEvents({ click() { setState({ parentCount: state.parentCount + 1 }); } }),
    document.createElement("div").setAttributes({ class: "card" }).setChildren(
      document.createElement("div")
        .setState({ childCount: 0 })
        .setChildren(({ state, setState }) => [
          document.createElement("p").setText("Child: " + state.childCount),
          document.createElement("button").setText("Child +1").setEvents({ click() { setState({ childCount: state.childCount + 1 }); } })
        ])
    )
  ]);

app.setChildren(parent);