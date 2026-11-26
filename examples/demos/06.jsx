/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let confirming = false;

const validator = document.createComponent((rerender) => (
  <section className="demo-surface conditional-surface">
    <h3>Conditional child reconciliation</h3>
    <p>
      The panel is added or removed by rerendering only this component.
      A <code>null</code> branch leaves no node in the virtual tree.
    </p>
    <button
      class="action-button"
      type="button"
      onClick={() => {
        if (!confirming) {
          confirming = true;
          rerender();
        }
      }}
    >
      OPEN
    </button>
    {confirming ? (
      <div className="conditional-panel" role="dialog" aria-label="Confirm">
        <h4>Are you sure?</h4>
        <button
          class="action-button"
          type="button"
          onClick={() => {
            confirming = false;
            rerender();
          }}
        >
          CLOSE
        </button>
      </div>
    ) : null}
  </section>
));

document.getElementById("conditional-app").setChildren(
  validator,
);
