let todos = [
  { id: 1, text: "Learn DOM++", done: false },
  { id: 2, text: "Build components", done: false },
];
let nextId = 3;
let showDone = true;

const appComponent = document.createComponent((rerender) => {
  const visible = showDone ? todos : todos.filter((t) => !t.done);
  return document.createElement("div").setChildren(
    document.createElement("div").setChildren(
      document.createElement("input").setAttributes({ id: "todo-input", placeholder: "New todo" }),
      document.createElement("button")
        .setText("Add")
        .setAttributes({ type: "button" })
        .setEvents({
          click() {
            const input = document.getElementById("todo-input");
            const text = input.value.trim();
            if (!text) return;
            todos = todos.concat({ id: nextId++, text, done: false });
            input.value = "";
            rerender();
          },
        })
    ),
    document.createElement("label").setChildren(
      document.createElement("input")
        .setAttributes({ type: "checkbox" })
        .setEvents({ change(e) { showDone = e.target.checked; rerender(); } }),
      document.createElement("span").setText(" Show done")
    ),
    visible.map((todo) =>
      document.createElement("div")
        .setAttributes({ key: todo.id })
        .setStyles({ textDecoration: todo.done ? "line-through" : "none", padding: "4px 0" })
        .setChildren(
          document.createElement("input")
            .setAttributes({ type: "checkbox", checked: todo.done })
            .setEvents({
              change() {
                todos = todos.map((t) =>
                  t.id === todo.id ? { ...t, done: !t.done } : t
                );
                rerender();
              },
            }),
          document.createElement("span").setText(" " + todo.text)
        )
    )
  );
});

const app = document.getElementById("app");
app.setChildren(appComponent);
