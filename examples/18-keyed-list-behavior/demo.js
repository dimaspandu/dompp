const list = document.createElement("div")
  .setState({ items: [{ id: 1, label: "Alpha" }, { id: 2, label: "Bravo" }, { id: 3, label: "Charlie" }] })
  .setChildren(({ state, setState }) => [
    document.createElement("button").setText("Shuffle").setEvents({ click() { setState({ items: [...state.items].sort(() => Math.random() - 0.5) }); } }),
    document.createElement("button").setText("Add").setEvents({ click() { const id = Date.now(); setState({ items: [...state.items, { id, label: "Item " + (state.items.length + 1) }] }); } }),
    document.createElement("ul").setChildren(
      state.items.map(item =>
        document.createElement("li").setAttributes({ key: item.id }).setText(item.label)
      )
    )
  ]);

app.setChildren(list);