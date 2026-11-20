/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let showPanel = false;

const appComponent = document.createComponent((rerender) => (
  <div className="demo-surface conditional-surface">
    <h3>Add and Remove Subtree</h3>
    <p>Dynamically mount and unmount subtrees while preserving identity of remaining nodes.</p>
    <button
      className="action-button"
      type="button"
      onClick={() => { showPanel = !showPanel; rerender(); }}
    >
      {showPanel ? "Remove subtree" : "Add subtree"}
    </button>
    {showPanel ? (
      <div className="conditional-panel" role="dialog" aria-label="Dynamic panel">
        <h4>Dynamic Subtree</h4>
        <p>This subtree was added dynamically. Click Remove to unmount it.</p>
        <button className="action-button" type="button" onClick={() => { showPanel = false; rerender(); }}>
          Remove
        </button>
      </div>
    ) : null}
  </div>
));

const app = document.getElementById("app");
app.setChildren(appComponent);