/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let count = 0;

const serverNode = document.getElementById("server-card");
const adopted = document.createElement(serverNode);

const card = document.createComponent((rerender) => (
  adopted.setChildren(
    <h3>Adopted title: {count}</h3>,
    <p>Adopted text</p>,
    <button
      type="button"
      onClick={() => { count++; rerender(); }}
    >
      Increment
    </button>
  )
));

const app = document.getElementById("app");
app.setChildren(card);
