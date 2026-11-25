/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let showPanel = false;
let renderCount = 0;

// Array-returning component: each slot reconciled on rerender.
function ArrayChildList({ rerender }) {
  return [
    <div key="a" className="fragment-child fragment-child-a">
      Array child A
    </div>,
    <div key="b" className="fragment-child fragment-child-b">
      Array child B (renders: {renderCount})
    </div>,
    <button
      key="action"
      className="action-button"
      type="button"
      onClick={() => rerender(() => renderCount++)}
    >
      Rerender array slots
    </button>,
  ];
}

const fragmentComponent = document.createComponent((rerender) => (
  <div className="demo-surface fragment-surface">
    <h4>&lt;fragment&gt; wrapper element</h4>
    <p>
      <code>&lt;fragment&gt;</code> creates a real wrapper element node that owns
      its children. Inspect the DOM: there is a <code>&lt;fragment&gt;</code>
      node between the parent and the children.
    </p>
    <div className="fragment-box">
      <strong>Parent</strong>
      {document.createElement("fragment", null,
        <div className="fragment-child fragment-child-a">Wrapped child one</div>,
        <div className="fragment-child fragment-child-b">Wrapped child two</div>
      )}
    </div>
    <button
      className="action-button"
      type="button"
      onClick={() => rerender(() => (showPanel = true))}
    >
      Open inline fragment panel
    </button>
    {showPanel ? (
      <div className="conditional-panel" role="dialog" aria-label="Panel">
        <h4>&lt;&gt;...&lt;/&gt; JSX fragment (inlined array)</h4>
        <p>
          <code>&lt;&gt;...&lt;/&gt;</code> contributes children directly to the
          parent with no wrapper node.
        </p>
        <div className="fragment-box">
          <strong>Parent label</strong>
          <>
            <div className="fragment-child fragment-child-a">Inlined child one</div>
            <div className="fragment-child fragment-child-b">Inlined child two</div>
          </>
        </div>
        <button
          className="action-button"
          type="button"
          onClick={() => rerender(() => (showPanel = false))}
        >
          Close
        </button>
      </div>
    ) : null}
  </div>
));

const arrayComponent = document.createComponent(() => (
  <div className="demo-surface fragment-surface">
    <h4>Array-returning component (per-slot rerender)</h4>
    <p>
      The component returns an array; each slot is compared and updated on
      rerender.
    </p>
    <div className="fragment-box">
      <strong>Parent label</strong>
      <ArrayChildList rerender={fragmentComponent.rerender} />
    </div>
  </div>
));

document.getElementById("app").setChildren([
  fragmentComponent,
  arrayComponent,
]);
