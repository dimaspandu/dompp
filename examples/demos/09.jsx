/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let nextId = 4;
let items = [
  { id: 1, label: "Alpha" },
  { id: 2, label: "Bravo" },
  { id: 3, label: "Charlie" },
];

const keyedFragment = document.createComponent((rerender) => (
  <section className="demo-surface keyed-surface">
    <h3>Keyed list inside a fragment</h3>
    <p>
      The list items are produced inside a real fragment array via{" "}
      <code>document.createDocumentFragment(...)</code> (not the{" "}
      <code>{"<"}fragment{">"}</code> wrapper element). The fragment inlines its
      children into the container while stable keys preserve item identity
      across updates.
    </p>
    <div className="keyed-controls">
      <button
        class="keyed-button"
        type="button"
        onClick={() => {
          const id = nextId++;
          items = [...items, { id, label: `Item ${id}` }];
          rerender();
        }}
      >
        APPEND
      </button>
      <button
        class="keyed-button"
        type="button"
        onClick={() => {
          const id = nextId++;
          items = [{ id, label: `Item ${id}` }, ...items];
          rerender();
        }}
      >
        PREPEND
      </button>
      <button
        class="keyed-button"
        type="button"
        onClick={() => {
          items = [...items].reverse();
          rerender();
        }}
      >
        REVERSE
      </button>
      <button
        class="keyed-button"
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
      {document.createDocumentFragment(
        ...items.map((item) => (
          <div key={item.id} className="keyed-item">
            {item.label} (key: {item.id})
          </div>
        ))
      )}
    </div>
  </section>
));

document.getElementById("keyed-fragment-app").setChildren(keyedFragment);
