/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let items = [
  { id: 1, text: "Alpha" },
  { id: 2, text: "Beta" },
  { id: 3, text: "Gamma" },
];
let showList = true;

document.getElementById("app").setChildren(
  document.createComponent((rerender) => (
    <div className="demo-surface keyed-surface">
      <h3>Dynamic List</h3>
      <p>Toggle list visibility and preserve item identity</p>
      <button
        className="action-button"
        type="button"
        onClick={() => {
          showList = !showList;
          rerender();
        }}
      >
        {showList ? "Hide List" : "Show List"}
      </button>
      {showList ? (
        <div className="keyed-list">
          {items.map((item) => (
            <div key={item.id} className="keyed-item">
              {item.text}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  ))
);
