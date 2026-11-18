/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let showPanel = false;

const appComponent = document.createComponent((rerender) => (
  <div>
    <button
      type="button"
      onClick={() => { showPanel = !showPanel; rerender(); }}
    >
      {showPanel ? "Remove subtree" : "Add subtree"}
    </button>
    {showPanel ? (
      <div className="panel-box" style={{ padding: "12px", background: "#eef", borderRadius: "8px", marginTop: "8px" }}>
        <p>This subtree was added dynamically.</p>
        <button type="button" onClick={() => { showPanel = false; rerender(); }}>
          Remove
        </button>
      </div>
    ) : null}
  </div>
));

const app = document.getElementById("app");
app.setChildren(appComponent);
