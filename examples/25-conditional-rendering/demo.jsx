/** @jsx elementBuilder */

// Conditionally add or remove a dialog during rerender.
// Returning null means there is no dialog node in the current virtual tree.
function Validator() {
  let confirming = false;

  return componentBuilder((rerender) => {
    return (
      <div className="card">
        <h3>Conditional child reconciliation</h3>
        <p>The dialog is added or removed by rerendering only this component.</p>
        <button
          type="button"
          onClick={() => {
            confirming = true;
            rerender();
          }}
        >
          OPEN
        </button>
        {confirming ? (
          <dialog style={{
            bottom: 0,
            display: "block",
            height: "100vh",
            left: 0,
            position: "fixed",
            right: 0,
            top: 0,
            width: "100%",
          }}>
            <h4>Are you sure?</h4>
            <button
              type="button"
              class="secondary"
              onClick={() => {
                confirming = false;
                rerender();
              }}
            >
              CLOSE
            </button>
          </dialog>
        ) : null}
      </div>
    );
  }).render();
}

function App(props, ...children) {
  return elementBuilder(document.getElementById("app-jsx"), props, ...children);
}

<App>
  <Validator />
</App>