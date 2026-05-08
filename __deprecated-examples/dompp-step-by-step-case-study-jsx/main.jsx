/** @jsx d */
const app = document.getElementById("app");

// JSX factory: d(tag, props, ...children)
function d(tag, props, ...children) {
  const node = document.createElement(tag);

  if (props) {
    const { style, className, class: classAttr, on, ...attrs } = props;

    if (className) {
      node.setAttributes({ class: className });
    }

    if (style) {
      node.setStyles(style);
    }

    if (on) {
      node.setEvents(on);
    }

    if (Object.keys(attrs).length) {
      node.setAttributes(attrs);
    }
  }

  if (children.length) {
    node.setChildren(...children.flat());
  }

  return node;
}

function card(title, description, content) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <small>{description}</small>
      {content}
    </section>
  );
}

function demoBasicUsage() {
  return card(
    "Basic Usage",
    "DOM++ extends real DOM nodes with chainable helpers.",
    (
      <div>
        <h3>Hello DOM++</h3>
        <p>This is a DOM++ element with chained mutations.</p>
      </div>
    )
  );
}

function demoStatefulPanel() {
  const panel = <section className="panel" />;
  panel
    .setState({ total: 0 })
    .setChildren(({ state, setState }) => [
      <h3>{`Total: ${state.total}`}</h3>,
      <button on={{
        click: () => setState(({ state }) => {
          state.total += 10000;
        })
      }}>Donate 10k</button>
    ]);

  return card(
    "Stateful Panel",
    "State lives on the element; setChildren re-runs when state changes.",
    panel
  );
}

function demoCrossElement() {
  const summary = <div />;
  summary
    .setState({ total: 0 })
    .setChildren(({ state }) => [
      <strong>{`Total: ${state.total}`}</strong>
    ]);

  return card(
    "Cross-Element Updates",
    "Buttons update the summary element via its setState prototype method.",
    (
      <div>
        {summary}
        <div className="actions">
          <button on={{
            click: () => {
              summary.setState(({ state }) => {
                state.total += 10000;
              });
            }
          }}>Donate 10k</button>
          <button className="secondary" on={{
            click: () => {
              summary.setState(({ state }) => {
                state.total += 25000;
              });
            }
          }}>Donate 25k</button>
        </div>
      </div>
    )
  );
}

function demoMatchById() {
  const counter = <div />;
  counter
    .setState({ count: 0 })
    .setChildren(({ state, setState }) => [
      <h3 id="counter-title">{`Count: ${state.count}`}</h3>,
      <button id="counter-btn" on={{
        click: () => setState(({ state }) => {
          state.count += 1;
        })
      }}>Increment</button>,
      { matchById: true }
    ]);

  return card(
    "matchById Preservation",
    "Reconcile keeps DOM identity stable while setChildren reruns.",
    (
      <div>
        {counter}
        <div className="note">Stable ids + matchById preserve DOM nodes across updates.</div>
      </div>
    )
  );
}

app.setChildren(
  demoBasicUsage(),
  demoStatefulPanel(),
  demoCrossElement(),
  demoMatchById()
);







