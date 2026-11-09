const input = document.createElement("input").setAttributes({ placeholder: "Type here..." });
const list = document.createElement("ul");

const container = document.createElement("div")
  .setState({ items: ["A", "B", "C"] })
  .setChildren(({ state, setState }) => [
    input,
    document.createElement("button").setText("Re-render list").setEvents({ click() { setState({ items: [...state.items].sort(() => Math.random() - 0.5) }); } }),
    list.setChildren(state.items.map(item => document.createElement("li").setText(item)))
  ]);

app.setChildren(container);
// Input focus is preserved across list re-renders