/** @jsx elementBuilder */

// Shared state for the rerender(callback) example.
let count = 0;

function App(props, ...children) {
  return elementBuilder(
    document.getElementById("app-jsx"),
    props,
    ...children
  );
}

// rerender(callback) combines a state update with a view update.
// The callback runs first, so the render function reads the new count.
const rerenderCallbackCounter = componentBuilder((rerender) => {
  return (
    <div
      className="card"
      style={{
        backgroundColor: count % 2 === 0 ? "purple" : "fuchsia",
        color: "white",
      }}
    >
      <h3 style={{ color: "white" }}>ComponentBuilder rerender</h3>
      <p className="counter-value" style={{ color: "white" }}>{count}</p>
      <p style={{ color: "white" }}>
        <code>rerender(callback)</code> runs the state update before rebuilding this view.
      </p>
      <button
        class="secondary"
        disabled={count === 10}
        onClick={() => {
          rerender(() => {
            count += 1;
          });
        }}
      >
        UPDATE
      </button>
    </div>
  );
});

const counterView = rerenderCallbackCounter.render();

<App>
  {counterView}
</App>