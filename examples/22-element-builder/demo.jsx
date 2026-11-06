/** @jsx elementBuilder */
function App(props, ...children) {
  return elementBuilder(
    document.getElementById("app-jsx"),
    props,
    ...children
  );
}

let count = 0;
let countEl;
let buttonEl;

<App>
  <div className="card">
    <h3>Direct element updates</h3>
    <p>Update a node with ElementBuilder setters without rerendering its parent.</p>
    {countEl = <p className="counter-value" style={{
      backgroundColor: count % 2 === 0 ? "purple" : "fuchsia",
      color: "white",
    }}>{count}</p>}
    {buttonEl = <button
      class="secondary"
      onClick={() => {
        count += 1;
        countEl
          .setStyles({
            backgroundColor: count % 2 === 0 ? "purple" : "fuchsia",
            color: "white",
          })
          .setText(count);
        if (count === 10) {
          buttonEl.setAttributes({ disabled: true });
        }
      }}
    >UPDATE</button>}
    <hr />
    <>Hello, I'm just a Fragment!</>
  </div>
</App>
