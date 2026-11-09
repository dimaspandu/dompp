/** @jsx d */
/** @jsxRuntime classic */
/** @jsxFrag d.fragment */

const app = document.getElementById("app");


/**
 * d.js — Custom JSX factory.
 * The transpiler calls the factory in two ways:
 *   d(tag, props, ...children)
 *   d.fragment(...children) // for <></>
 */

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Tags that belong to the SVG namespace.
 * Ambiguous tags shared with HTML are intentionally excluded.
 */
const svgOnlyTags = new Set([
  "svg",
  "circle",
  "path",
  "rect",
  "line",
  "polyline",
  "polygon",
  "ellipse",
  "g",
  "defs",
  "use",
  "symbol",
  "text",
  "tspan",
  "textPath",
  "image",
  "foreignObject",
  "mask",
  "clipPath",
  "pattern",
  "linearGradient",
  "radialGradient",
  "stop",
  "filter",
  "feGaussianBlur",
  "feColorMatrix",
  "animate",
  "animateTransform",
  "animateMotion",
  "marker",
  "view",
  "switch",
]);

// JSX factory: d(tag, props, ...children)
function d(tag, props, ...children) {
  let node;

  // Custom components.
  if (typeof tag === "function") {
    return tag(props, ...children);
  }

  // Create the appropriate node.
  if (tag === "fragment" || tag === "Fragment") {
    node = document.createDocumentFragment();
  } else if (svgOnlyTags.has(tag)) {
    node = document.createElementNS(SVG_NS, tag);
  } else {
    node = document.createElement(tag);
  }

  if (props) {
    const attrs = {};
    const events = {};

    let style;
    let className;

    for (const [key, value] of Object.entries(props)) {
      const normalizedKey = key.toLowerCase();

      // Event props: onClick, onclick, ONCLICK, OnClick, etc.
      if (normalizedKey.startsWith("on")) {
        const eventName = normalizedKey.slice(2);

        if (eventName) {
          events[eventName] = value;
        }
      } else if (normalizedKey === "style") {
        style = value;
      } else if (
        normalizedKey === "classname" ||
        normalizedKey === "class"
      ) {
        className ??= value;
      } else {
        attrs[key] = value;
      }
    }

    if (className != null) {
      node.setAttributes({ class: className });
    }

    if (style != null) {
      node.setStyles(style);
    }

    if (Object.keys(events).length) {
      node.setEvents(events);
    }

    if (Object.keys(attrs).length) {
      node.setAttributes(attrs);
    }
  }

  // Append children.
  if (children.length) {
    node.setChildren(...children.flat());
  }

  return node;
}

/**
 * Fragment factory for JSX fragments:
 *   <></> -> d.fragment(...children)
 */
d.fragment = function fragment(...children) {
  const node = document.createDocumentFragment();

  if (children.length) {
    node.setChildren(...children.flat());
  }

  return node;
};

function card(title, description, content) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <small>{description}</small>
      {content}
    </section>
  );
}

function Something(props) {
  return (
    <div className="panel">
      <h3>{props.title}</h3>
      <p>{props.message}</p>
    </div>
  );
}

function demoBasicUsage() {
  return card(
    "Basic Usage",
    "DOM++ extends real DOM nodes with chainable helpers.",
    (
      <div>
        <h3>Hello DOM++</h3>
        <p>This is a DOM++ element created via JSX.</p>
      </div>
    )
  );
}

function demoComponent() {
  const props = {
    title: "Custom Component",
    message: "Props are passed to Something with JSX spread syntax."
  };

  return card(
    "Components",
    "A function component receives props and returns JSX.",
    <Something {...props} />
  );
}

function demoFragment() {
  return card(
    "Fragments",
    "A fragment groups multiple children without adding a wrapper element.",
    <>
      <p>This paragraph is inside a JSX fragment.</p>
      <p>The fragment factory returns a DocumentFragment.</p>
    </>
  );
}

function demoStatefulPanel() {
  const panel = <section className="panel" />;
  panel
    .setState({ total: 0 })
    .setChildren(({ state, setState }) => [
      <h3>{`Total: ${state.total}`}</h3>,
      <button onClick={() => setState(({ state }) => { state.total += 10000; })}>
        Donate 10k
      </button>
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
    .setChildren(({ state }) => [ <strong>{`Total: ${state.total}`}</strong> ]);

  return card(
    "Cross-Element Updates",
    "Buttons update another element's state via its setState method.",
    (
      <div>
        {summary}
        <div className="actions">
          <button onClick={() => { summary.setState(({ state }) => { state.total += 10000; }); }}>
            Donate 10k
          </button>
          <button className="secondary" onClick={() => { summary.setState(({ state }) => { state.total += 25000; }); }}>
            Donate 25k
          </button>
        </div>
      </div>
    )
  );
}

function demoFineGrained() {
  const [count, setCount] = document.createSignal(0);

  const display = <strong className="signal-count" />;

  display
    .setFineGrained()
    .setText(() => `Signal: ${count()}`);

  return card(
    "Fine-Grained Signals",
    "JSX node + setFineGrained + signal-driven setText (no setState).",
    (
      <div>
        {display}
        <div className="actions">
          <button onClick={() => setCount(count() + 1)}>+1</button>
          <button className="secondary" onClick={() => setCount(0)}>Reset</button>
        </div>
      </div>
    )
  );
}

app.setChildren(
  demoBasicUsage(),
  demoComponent(),
  demoFragment(),
  demoStatefulPanel(),
  demoCrossElement(),
  demoFineGrained()
);