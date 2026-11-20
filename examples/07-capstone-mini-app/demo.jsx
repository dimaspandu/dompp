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
    <div className="demo-surface component-surface">
      <h3>Capstone Mini App — Todo List</h3>
      <p>Components, state, conditional rendering, keyed lists, and fragments</p>
      <div className="message-form" style={{ marginTop: "16px" }}>
        <input
          id="todo-input"
          className="message-input"
          placeholder="New todo..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const text = e.target.value.trim();
              if (!text) return;
              todos = todos.concat({ id: nextId++, text, done: false });
              e.target.value = "";
              rerender();
            }
          }}
        />
        <button
          className="action-button"
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
      <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={showDone}
          onChange={(e) => { showDone = e.target.checked; rerender(); }}
        />
        <span>Show done</span>
      </label>
      <div className="keyed-list" style={{ marginTop: "16px" }}>
        {visible.map((todo) => (
          <div key={todo.id} className="keyed-item" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: todo.done ? "line-through" : "none", opacity: todo.done ? 0.6 : 1 }}>
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
            <span style={{ flex: 1 }}>{todo.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

const app = document.getElementById("app");
app.setChildren(appComponent);