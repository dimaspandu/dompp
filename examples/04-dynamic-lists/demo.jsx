/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let items = [
  { id: 1, text: "Alpha" },
  { id: 2, text: "Beta" },
  { id: 3, text: "Gamma" },
];
let showList = true;

const listComponent = document.createComponent((rerender) => (
  <div>
    <button
      type="button"
      onClick={() => { showList = !showList; rerender(); }}
    >
      {showList ? "Hide" : "Show"}
    </button>
    {showList
      ? items.map((item) => (
          <div key={item.id} style={{ padding: "4px 0" }}>
            {item.text}
          </div>
        ))
      : null}
  </div>
));

const app = document.getElementById("app");
app.setChildren(listComponent);
