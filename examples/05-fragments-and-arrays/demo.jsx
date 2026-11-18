/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let showExtra = false;

const fragmentComponent = document.createComponent((rerender) => (
  <>
    <strong>Item A</strong>
    <strong>Item B</strong>
    {showExtra ? <strong>Item C</strong> : null}
  </>
));

const arrayComponent = document.createComponent((rerender) => [
  <em>X</em>,
  <em>Y</em>,
]);

const app = document.getElementById("app");
app.setChildren(
  <button
    type="button"
    onClick={() => { showExtra = !showExtra; fragmentComponent.rerender(); }}
  >
    Toggle extra
  </button>,
  fragmentComponent,
  arrayComponent
);
