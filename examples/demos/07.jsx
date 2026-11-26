/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let nextId = 4;
let items = [
  { id: 1, label: "Alpha", tag: "article" },
  { id: 2, label: "Bravo", tag: "article" },
  { id: 3, label: "Charlie", tag: "article" },
];

const keyedList = document.createComponent((rerender) => (
  <section className="demo-surface keyed-surface">
    <h3>Keyed child reconciliation</h3>
    <p>
      Stable keys preserve item nodes when the list order changes.
      Changing an item's tag intentionally replaces its node.
    </p>
    <div className="keyed-controls">
      <button
        class="keyed-button"
        type="button"
        onClick={() => {
          const id = nextId++;
          items = [...items, { id, label: `Item ${id}`, tag: "article" }];
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
          items = [{ id, label: `Item ${id}`, tag: "article" }, ...items];
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
          items = items.slice(1);
          rerender();
        }}
      >
        REMOVE FIRST
      </button>
      <button
        class="keyed-button"
        type="button"
        onClick={() => {
          if (items.length) {
            const [first, ...remaining] = items;
            items = [{
              ...first,
              tag: first.tag === "article" ? "p" : "article",
            }, ...remaining];
            rerender();
          }
        }}
      >
        CHANGE FIRST TAG
      </button>
    </div>
    <div className="keyed-list">
      {items.map((item) => {
        const Tag = item.tag;
        return (
          <Tag key={item.id} className="keyed-item">
            {item.label} (key: {item.id})
          </Tag>
        );
      })}
    </div>
  </section>
));

document.getElementById("keyed-list-app").setChildren(
  keyedList,
);
