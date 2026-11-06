/** @jsx elementBuilder */

// Stable keys preserve item nodes during append, prepend, reorder, and removal.
// Changing an element tag intentionally replaces its node.
function KeyedListExample() {
  let nextId = 4;
  let items = [
    { id: 1, label: "Alpha", tag: "article" },
    { id: 2, label: "Bravo", tag: "article" },
    { id: 3, label: "Charlie", tag: "article" },
  ];

  return componentBuilder((rerender) => (
    <section className="card">
      <h3>Keyed child reconciliation</h3>
      <p>Stable keys preserve item nodes when the list order changes. Changing an item's tag replaces its node.</p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
        <button type="button" onClick={() => {
          const id = nextId++;
          items = [...items, { id, label: `Item ${id}`, tag: "article" }];
          rerender();
        }}>APPEND</button>
        <button type="button" onClick={() => {
          const id = nextId++;
          items = [{ id, label: `Item ${id}`, tag: "article" }, ...items];
          rerender();
        }}>PREPEND</button>
        <button type="button" onClick={() => {
          items = [...items].reverse();
          rerender();
        }}>REVERSE</button>
        <button type="button" onClick={() => {
          items = items.slice(1);
          rerender();
        }}>REMOVE FIRST</button>
        <button type="button" onClick={() => {
          if (items.length) {
            const [first, ...remaining] = items;
            items = [{
              ...first,
              tag: first.tag === "article" ? "p" : "article",
            }, ...remaining];
            rerender();
          }
        }}>CHANGE FIRST TAG</button>
      </div>
      <div className="keyed-list">
        {items.map((item) => elementBuilder(
          item.tag,
          {
            key: item.id,
            style: {
              border: "1px solid #ccc",
              margin: "6px 0",
              padding: "8px",
            },
          },
          `${item.label} (key: ${item.id})`
        ))}
      </div>
    </section>
  )).render();
}

function App(props, ...children) {
  return elementBuilder(document.getElementById("app-jsx"), props, ...children);
}

<App>
  <KeyedListExample />
</App>