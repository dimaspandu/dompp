/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let countA = 0;
let countB = 0;

const componentA = document.createComponent((rerender) => (
  <section className="cross-card">
    <h4>Component A</h4>
    <p className="cross-count">Count: {countA}</p>
    <div className="cross-actions">
      <button class="action-button" type="button" onClick={() => rerender(() => countA++)}>
        +1 A (self)
      </button>
      <button class="action-button" type="button" onClick={() => { countB++; componentB.rerender(); }}>
        +1 B (from A)
      </button>
    </div>
  </section>
));

const componentB = document.createComponent((rerender) => (
  <section className="cross-card">
    <h4>Component B</h4>
    <p className="cross-count">Count: {countB}</p>
    <div className="cross-actions">
      <button class="action-button" type="button" onClick={() => rerender(() => countB++)}>
        +1 B (self)
      </button>
      <button class="action-button" type="button" onClick={() => { countA++; componentA.rerender(); }}>
        +1 A (from B)
      </button>
    </div>
  </section>
));

document.getElementById("cross-update-app").setChildren([componentA, componentB]);
