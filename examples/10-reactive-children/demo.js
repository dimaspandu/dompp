const list = document.createElement("div")
  .setAttributes({ class: "card" })
  .setState({ items: ["Apple", "Banana", "Cherry"] })
  .setChildren(({ state, setState }) => [
    document.createElement("h3").setText("Items: " + state.items.length),
    document.createElement("ul").setChildren(
      state.items.map((item, i) =>
        document.createElement("li")
          .setText(item)
          .setEvents({ click() { setState({ items: state.items.filter((_, idx) => idx !== i) }); }) })
    ),
    document.createElement("button")
      .setText("Add Item")
      .setEvents({ click() { setState({ items: [...state.items, "Item " + (state.items.length + 1)] }); } })
  ]);

app.setChildren(list);