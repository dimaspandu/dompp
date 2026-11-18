/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let todos = [
  { id: 1, text: "Learn DOM++", done: false },
  { id: 2, text: "Build components", done: false },
];
let nextId = 3;
let showDone = true;

const appComponent = document.createComponent((rerender) => {
  const visible = showDone ? todos : todos.filter((t) => !t.done);
  return (
    <div>
      <div>
        <input id="todo-input" placeholder="New todo" />
        <button
          type="button"
          onClick={() => {
            const input = document.getElementById("todo-input");
            const text = input.value.trim();
            if (!text) return;
            todos = todos.concat({ id: nextId++, text, done: false });
            input.value = "";
            rerender();
          }}
        >
          Add
        </button>
      </div>
      <label>
        <input
          type="checkbox"
          onChange={(e) => { showDone = e.target.checked; rerender(); }}
        />
        <span> Show done</span>
      </label>
      {visible.map((todo) => (
        <div key={todo.id} style={{ textDecoration: todo.done ? "line-through" : "none", padding: "4px 0" }}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => {
              todos = todos.map((t) =>
                t.id === todo.id ? { ...t, done: !t.done } : t
              );
              rerender();
            }}
          />
          <span> {todo.text}</span>
        </div>
      ))}
    </div>
  );
});

const app = document.getElementById("app");
app.setChildren(appComponent);
