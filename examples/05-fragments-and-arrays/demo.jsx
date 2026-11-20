/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let showExtra = false;

const fragmentComponent = document.createComponent((rerender) => (
  <div className="demo-surface fragment-surface">
    <h4>Fragment (inlined children)</h4>
    <div className="fragment-box">
      <strong className="fragment-child fragment-child-a">Item A</strong>
      <strong className="fragment-child fragment-child-b">Item B</strong>
      {showExtra ? <strong className="fragment-child fragment-child-a">Item C</strong> : null}
    </div>
  </div>
));

const arrayComponent = document.createComponent((rerender) => (
  <div className="demo-surface fragment-surface">
    <h4>Array-returning component</h4>
    <div className="fragment-box">
      <em className="fragment-child fragment-child-a">X</em>
      <em className="fragment-child fragment-child-b">Y</em>
    </div>
  </div>
));

const app = document.getElementById("app");
app.setChildren(
  <button
    className="action-button"
    type="button"
    onClick={() => { showExtra = !showExtra; fragmentComponent.rerender(); }}
  >
    Toggle extra (Item C)
  </button>,
  fragmentComponent,
  arrayComponent
);