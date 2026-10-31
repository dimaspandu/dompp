/** @jsx elementBuilder */
import "../../src/1.2.0/dompp-builders.js";

const elementBuilder = document.elementBuilder.bind(document);
const componentBuilder = document.componentBuilder.bind(document);

const app = document.getElementById("app");

function ArrayChildren() {
  return [
    <div key="first" className="row">Array child one</div>,
    <div key="second" className="row">Array child two</div>,
  ];
}

let count = 0;
const counter = componentBuilder((rerender) => (
  <section className="card">
    <h2>componentBuilder counter</h2>
    <p>Count: {count}</p>
    <button onClick={() => {
      count += 1;
      rerender();
    }}>Increment</button>
  </section>
));

let items = [
  { id: 1, label: "Alpha" },
  { id: 2, label: "Bravo" },
  { id: 3, label: "Charlie" },
];
let nextId = 4;

const keyedList = componentBuilder((rerender) => (
  <section className="card">
    <h2>Keyed list</h2>
    <p>Append, prepend, reverse, remove, or change a tag. Same key and tag keeps the DOM node.</p>
    <div className="actions">
      <button onClick={() => {
        const id = nextId++;
        items = [...items, { id, label: `Item ${id}` }];
        rerender();
      }}>Append</button>
      <button className="secondary" onClick={() => {
        const id = nextId++;
        items = [{ id, label: `Item ${id}` }, ...items];
        rerender();
      }}>Prepend</button>
      <button className="secondary" onClick={() => {
        items = [...items].reverse();
        rerender();
      }}>Reverse</button>
      <button className="secondary" onClick={() => {
        items = items.slice(1);
        rerender();
      }}>Remove first</button>
      <button className="secondary" onClick={() => {
        if (items.length) {
          const [first, ...rest] = items;
          items = [{ ...first, tag: first.tag === "article" ? "p" : "article" }, ...rest];
          rerender();
        }
      }}>Change first tag</button>
    </div>
    <div className="rows">
      {items.map((item) => elementBuilder(
        item.tag || "article",
        { key: item.id, className: "row" },
        `${item.label} (key ${item.id})`
      ))}
    </div>
  </section>
));

const composition = (
  <section className="card">
    <h2>Fragments and array components</h2>
    <p>A fragment is a literal wrapper node to preserve the tree boundary.</p>
    <div className="row">
      <strong>Fragment parent</strong>
      <>
        <div className="row">Fragment child one</div>
        <div className="row">Fragment child two</div>
      </>
    </div>
    <p>An array-returning component adds siblings without an extra wrapper.</p>
    <div className="row">
      <strong>Array parent label</strong>
      <ArrayChildren />
    </div>
  </section>
);

document.elementBuilder(
  app,
  null,
  counter.render(),
  keyedList.render(),
  composition
);
