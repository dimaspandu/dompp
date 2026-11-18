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
  document.createElement("em").setText("X"),
  document.createElement("em").setText("Y"),
]);

const app = document.getElementById("app");
app.setChildren(
  document.createElement("button")
    .setText("Toggle extra")
    .setAttributes({ type: "button" })
    .setEvents({ click() { showExtra = !showExtra; fragmentComponent.rerender(); } }),
  fragmentComponent,
  arrayComponent
);
