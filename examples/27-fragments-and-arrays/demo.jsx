/** @jsx elementBuilder */

// An array-returning component contributes sibling nodes directly to its parent
// without creating an extra wrapper.
function ArrayChildComponent() {
  return [
    <div key="array-first" style={{ padding: "8px", backgroundColor: "#eef6ff" }}>
      Array child one
    </div>,
    <div key="array-second" style={{ padding: "8px", backgroundColor: "#f1f8ed" }}>
      Array child two
    </div>,
    <button key="array-action" type="button">Array child button</button>,
  ];
}

// A fragment is one wrapper node; an array component contributes each returned
// node directly to the parent child list.
function FragmentAndArrayExample() {
  return (
    <section className="card">
      <h3>Fragments and array components</h3>
      <h4>Literal fragment wrapper</h4>
      <p>
        The bordered parent has two direct children: its label and one literal fragment node.
        That fragment node owns the two nested div children.
      </p>
      <div style={{ border: "1px solid #ddd", padding: "10px" }}>
        <strong>Fragment parent</strong>
        <>
          <div style={{ padding: "6px", backgroundColor: "#eef6ff" }}>
            Nested fragment child one
          </div>
          <div style={{ padding: "6px", backgroundColor: "#f1f8ed" }}>
            Nested fragment child two
          </div>
        </>
      </div>

      <h4>Array-returning component</h4>
      <p>
        The component returns three nodes. The parent receives its label, paragraph, and the three returned nodes.
      </p>
      <div style={{ border: "1px solid #ddd", padding: "10px" }}>
        <strong>Array parent heading</strong>
        <p>Array parent paragraph</p>
        <ArrayChildComponent />
      </div>
    </section>
  );
}

function App(props, ...children) {
  return elementBuilder(document.getElementById("app-jsx"), props, ...children);
}

<App>
  <FragmentAndArrayExample />
</App>