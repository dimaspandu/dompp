/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let showPanel = false;
let renderCount = 0;

// A component may return an array. When rendered through createComponent,
// each slot is reconciled on rerender (a slot can become null and be removed).
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
      class="action-button"
      type="button"
      onClick={() => rerender(() => renderCount++)}
    >
      Rerender array slots
    </button>,
  ];
}

// Fragment-producing APIs (<>...</>, elementBuilder.fragment,
// document.createDocumentFragment(...)) return a flat child array that is
// inlined into the parent. As a component result it is reconciled per slot.
const inlineFragmentPanel = document.createComponent((rerender) =>
  document.createDocumentFragment(
    <strong>Inline fragment array</strong>,
    <p>Time: {new Date().toLocaleTimeString()}</p>,
    <button
      class="action-button"
      type="button"
      onClick={() => rerender(() => (showPanel = true))}
    >
      Open panel
    </button>,
    showPanel ? (
      <div className="conditional-panel" role="dialog" aria-label="Panel" style={{ marginTop: "10px" }}>
        <h4>Conditional slot</h4>
        <p>This slot is removed when it becomes null.</p>
        <button
          class="action-button"
          type="button"
          onClick={() => rerender(() => (showPanel = false))}
        >
          Close
        </button>
      </div>
    ) : null
  )
);

// The root view is a component so child array components can request rerenders.
const view = document.createComponent((rerender) => (
  <section className="demo-surface fragment-surface">
    <h3>Fragments and arrays</h3>
    <p>
      Fragment-producing forms (<code>{"<>"}...{"</>"}</code>,{" "}
      <code>elementBuilder.fragment</code>,{" "}
      <code>document.createDocumentFragment(...)</code>) return a flat child
      array that is inlined (no wrapper node). Use{" "}
      <code>{"<"}fragment{">"}</code> or{" "}
      <code>document.createElement("fragment")</code> for an explicit wrapper
      element.
    </p>

    <h4>{"<"}fragment{">"} wrapper element</h4>
    <p>
      <code>{"<"}fragment{">"}</code> creates a real wrapper element node that
      owns its children.
    </p>
    <div className="fragment-box">
      <strong>Parent</strong>
      <fragment>
        <div className="fragment-child fragment-child-a">Wrapped child one</div>
        <div className="fragment-child fragment-child-b">Wrapped child two</div>
      </fragment>
    </div>

    <h4>JSX fragment {"<"}{">"}...{"<"}/{">"} (inlined array)</h4>
    <p>Children are contributed directly to the parent with no wrapper.</p>
    <div className="fragment-box">
      <strong>Parent label</strong>
      <>
        <div className="fragment-child fragment-child-a">Inlined child one</div>
        <div className="fragment-child fragment-child-b">Inlined child two</div>
      </>
    </div>

    <h4>Array-returning component (per-slot rerender)</h4>
    <p>
      The component returns an array; each slot is compared and updated on
      rerender.
    </p>
    <div className="fragment-box">
      <strong>Parent label</strong>
      <ArrayChildList rerender={rerender} />
    </div>

    <h4>document.createDocumentFragment(...) child arrays</h4>
    <p>
      Returns/updates a flat child array. <code>.setChildren</code> and{" "}
      <code>.setText</code> mutate the array in place.
    </p>
    <div className="fragment-box">
      {document.createDocumentFragment(
        <strong>Static fragment array</strong>,
        <p>Two nodes inlined with no wrapper.</p>
      )}
      <h5 style={{ margin: "0.5rem 0" }}>
        {document.createDocumentFragment("Text-only fragment array")}
      </h5>
      {document.createDocumentFragment()
        .setChildren([
          <em key="set-children">Built via .setChildren([...])</em>,
        ])}
      <div style={{ marginTop: "0.5rem" }}>
        {inlineFragmentPanel}
      </div>
    </div>
  </section>
));

document.getElementById("fragment-array-app").setChildren(view);
