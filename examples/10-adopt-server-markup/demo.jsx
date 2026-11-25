/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let count = 0;

const serverNode = document.getElementById("server-card");

// RECONCILE (not hydrate): we want to replace all server children
// (the <ul>, <script>, <p>) with the new reactive content, not preserve them.
// document.hydrateElement() would keep undescribed server markup untouched,
// which is not what this example wants.
const adopted = document.createElement(serverNode);

const card = document.createComponent((rerender) => (
  adopted.setChildren(
    <div className="demo-surface adoption-surface">
      <h3>Adopted title: {count}</h3>
      <p>This card was server-rendered, then adopted and made reactive.</p>
      <p id="adoption-status" className="status-note">
        Adopted existing DOM node: {adopted.node === serverNode ? "✓ Yes" : "✗ No"}
      </p>
      <button
        className="action-button"
        type="button"
        onClick={() => { count++; rerender(); }}
      >
        Increment
      </button>
    </div>
  )
));
