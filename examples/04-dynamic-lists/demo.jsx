/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let nextId = 4;
let items = [
  { id: 1, text: "Alpha" },
  { id: 2, text: "Beta" },
  { id: 3, text: "Gamma" },
];

const keyedList = document.createComponent((rerender) => (
  <div className="demo-surface keyed-surface">
    <h3>Dynamic List</h3>
    <p>Stable keys preserve item identity across append, prepend, reverse, and remove.</p>
    <div className="keyed-controls">
      <button
        className="keyed-button"
        type="button"
        onClick={() => {
          const id = nextId++;
          items = [...items, { id, text: `Item ${id}` }];
          rerender();
        }}
      >
        APPEND
      </button>
      <button
        className="keyed-button"
        type="button"
        onClick={() => {
          const id = nextId++;
          items = [{ id, text: `Item ${id}` }, ...items];
          rerender();
        }}
      >
        PREPEND
      </button>
      <button
        className="keyed-button"
        type="button"
        onClick={() => {
          items = [...items].reverse();
          rerender();
        }}
      >
        REVERSE
      </button>
      <button
        className="keyed-button"
        type="button"
        onClick={() => {
          if (items.length) {
            items = items.slice(1);
            rerender();
          }
        }}
      >
        REMOVE FIRST
      </button>
    </div>
    <div className="keyed-list">
      {items.map((item) => (
        <div key={item.id} className="keyed-item">
          {item.text} (key: {item.id})
        </div>
      ))}
    </div>
  </div>
));

document.getElementById("app").setChildren([keyedList]);
