import compileJSX from "../compileJSX.js";
import runTest from "./helpers/runTest.js";

/**
 * FACTORY NAME - DEFAULT
 */

runTest(
  "JSX - basic element",
  compileJSX(`const x = <div>Hello</div>;`),
  `const x = d("div", null, "Hello");`
);

runTest(
  "JSX - element with className",
  compileJSX(`<div className="foo" />`),
  `d("div", { "className": "foo" })`
);

runTest(
  "JSX - self-closing with attributes",
  compileJSX(`<img src="x.png" alt="img" />`),
  `d("img", { "src": "x.png", "alt": "img" })`
);

runTest(
  "JSX - nested elements",
  compileJSX(`<div><span>A</span><span>B</span></div>`),
  `d("div", null, d("span", null, "A"), d("span", null, "B"))`
);

runTest(
  "JSX - expression child",
  compileJSX(`<h1>{title}</h1>`),
  `d("h1", null, title)`
);

runTest(
  "JSX - mixed children",
  compileJSX(`<div>Text <span>{val}</span></div>`),
  `d("div", null, "Text", d("span", null, val))`
);

runTest(
  "JSX - boolean attribute",
  compileJSX(`<input disabled />`),
  `d("input", { "disabled": true })`
);

runTest(
  "JSX - spread attributes",
  compileJSX(`<div {...props} />`),
  `d("div", { ...(props) })`
);

runTest(
  "JSX - spread attributes with whitespace after brace",
  compileJSX(`<StoryListItem { ...story } />`),
  `d(StoryListItem, { ...(story) })`
);

runTest(
  "JSX - spread attributes without whitespace after brace",
  compileJSX(`<StoryListItem {...story} />`),
  `d(StoryListItem, { ...(story) })`
);

runTest(
  "JSX - object expression attribute",
  compileJSX(`<button on={{ click: handler }}>Click</button>`),
  `d("button", { "on": { click: handler } }, "Click")`
);

runTest(
  "JSX - template literal expression",
  compileJSX('<strong>{`Count: ${count}`}</strong>'),
  'd("strong", null, `Count: ${count}`)'
);

runTest(
  "JSX - template literal in attribute",
  compileJSX('<div style={`color: red`} />'),
  'd("div", { "style": `color: red` })'
);

runTest(
  "JSX - JSX inside JS function",
  compileJSX(`
    return (
      <div>Hello</div>
    );
  `),
  `
    return (
      d("div", null, "Hello")
    );
  `
);

/**
 * COMPONENT FUNCTION INVOCATION (UPPERCASE TAG)
 */

runTest(
  "JSX - uppercase component without attributes",
  compileJSX(`<Item />`),
  `d(Item, null)`
);

runTest(
  "JSX - uppercase component with attributes",
  compileJSX(`<Item text="Hello" />`),
  `d(Item, { "text": "Hello" })`
);

runTest(
  "JSX - uppercase component with children",
  compileJSX(`<Item>text</Item>`),
  `d(Item, null, "text")`
);

runTest(
  "JSX - uppercase component with expression child",
  compileJSX(`<Item>{value}</Item>`),
  `d(Item, null, value)`
);

runTest(
  "JSX - mixed lowercase and uppercase",
  compileJSX(`<div><Item text="x" /></div>`),
  `d("div", null, d(Item, { "text": "x" }))`
);

runTest(
  "JSX - multi-word uppercase component",
  compileJSX(`<FooBar>text</FooBar>`),
  `d(FooBar, null, "text")`
);

runTest(
  "JSX - components as references with conditional and function call",
  compileJSX(`import elementBuilder from "./factories/elementBuilder.js";

function ProgressIndicator() {
  return (
    <>
      <div class="skeleton" />
      <div class="skeleton" />
      <div class="skeleton" />
    </>
  );
}

function renderGreeting() {
  return <h2>Alright, Mate?</h2>
}

function App() {
  return (
    <div>
      <h1>Hello, World!</h1>
      {isLoading ? <ProgressIndicator /> : renderGreeting()}
    </div>
  );
}
`, "elementBuilder"),
  `import elementBuilder from "./factories/elementBuilder.js";

function ProgressIndicator() {
  return (
    elementBuilder.fragment(elementBuilder("div", { "class": "skeleton" }), elementBuilder("div", { "class": "skeleton" }), elementBuilder("div", { "class": "skeleton" }))
  );
}

function renderGreeting() {
  return elementBuilder("h2", null, "Alright, Mate?")
}

function App() {
  return (
    elementBuilder("div", null, elementBuilder("h1", null, "Hello, World!"), isLoading ? elementBuilder(ProgressIndicator, null) : renderGreeting())
  );
}
`
);

/**
 * FACTORY NAME - CUSTOM PARAMETER
 */

runTest(
  "JSX - custom factory parameter",
  compileJSX(`<div />`, "h"),
  `h("div", null)`
);

runTest(
  "JSX - custom factory with children",
  compileJSX(`<div>Hello <span>x</span></div>`, "jsx"),
  `jsx("div", null, "Hello", jsx("span", null, "x"))`
);

/**
 * FACTORY NAME - @jsx PRAGMA
 */

runTest(
  "JSX - @jsx pragma parsed from source",
  compileJSX(`
    /** @jsx h */
    const x = <div />;
  `),
  `
    const x = h("div", null);
  `
);

runTest(
  "JSX - @jsx pragma with children",
  compileJSX(`
    /** @jsx h */
    <div>Hello</div>
  `),
  `
    h("div", null, "Hello")
  `
);

/**
 * FRAGMENTS
 */

runTest(
  "JSX - fragment",
  compileJSX(`<><div>A</div><div>B</div></>`),
  `d.fragment(d("div", null, "A"), d("div", null, "B"))`
);

runTest(
  "JSX - fragment with custom factory",
  compileJSX(`<><span>x</span></>`, "h"),
  `h.fragment(h("span", null, "x"))`
);

/**
 * ERROR HANDLING
 */

runTest(
  "JSX - unmatched closing tag",
  (() => {
    try {
      compileJSX(`<div></span>`);
      return "no error";
    } catch (e) {
      return "SyntaxError";
    }
  })(),
  "SyntaxError"
);

/**
 * COMMENTS INSIDE OPENING TAGS
 */

runTest(
  "JSX - line comment between attributes",
  compileJSX(`<input
  value={query}
  // TODO: use onInput for live search
  onInput={(e) => vm.search(e.target.value)}
/>`),
  `d("input", { "value": query, "onInput": (e) => vm.search(e.target.value) })`
);

runTest(
  "JSX - block comment between attributes",
  compileJSX(`<div /* layout */ className="x" />`),
  `d("div", { "className": "x" })`
);

runTest(
  "JSX - comment as first thing inside opening tag",
  compileJSX(`<div /* first */ className="x" />`),
  `d("div", { "className": "x" })`
);

runTest(
  "JSX - line comment as first thing inside opening tag",
  compileJSX(`<div // first
  className="x" />`),
  `d("div", { "className": "x" })`
);

runTest(
  "JSX - comment immediately before closing bracket",
  compileJSX(`<div className="x" /* end */>hi</div>`),
  `d("div", { "className": "x" }, "hi")`
);

runTest(
  "JSX - comment immediately before self-closing bracket",
  compileJSX(`<div className="x" /* end */ />`),
  `d("div", { "className": "x" })`
);

runTest(
  "JSX - line comment immediately before self-closing bracket",
  compileJSX(`<div className="x" // end
/>`),
  `d("div", { "className": "x" })`
);

runTest(
  "JSX - multiple consecutive comments separated by newlines",
  compileJSX(`<div
  // one
  // two
  /* three */
  className="x"
/>`),
  `d("div", { "className": "x" })`
);

runTest(
  "JSX - comment between spread and normal attribute",
  compileJSX(`<div {...props} /* spread */ className="x" />`),
  `d("div", { ...(props), "className": "x" })`
);

runTest(
  "JSX - line comment between spread and normal attribute",
  compileJSX(`<div {...props}
  // spread
  className="x" />`),
  `d("div", { ...(props), "className": "x" })`
);

runTest(
  "JSX - comment before spread attribute",
  compileJSX(`<div /* spread */ {...props} />`),
  `d("div", { ...(props) })`
);

runTest(
  "JSX - double slash in quoted attribute value is not a comment",
  compileJSX(`<div title="// not a comment" />`),
  `d("div", { "title": "// not a comment" })`
);

runTest(
  "JSX - block comment marker in quoted attribute value is not a comment",
  compileJSX(`<div title="/* not a comment */" />`),
  `d("div", { "title": "/* not a comment */" })`
);

runTest(
  "JSX - unterminated block comment raises SyntaxError",
  (() => {
    try {
      compileJSX(`<div /* unterminated className="x" />`);
      return "no error";
    } catch (e) {
      return e instanceof SyntaxError ? "SyntaxError" : "other error";
    }
  })(),
  "SyntaxError"
);

runTest(
  "JSX - comment expression child passes through unchanged",
  compileJSX(`<div>{/* a comment */}</div>`),
  `d("div", null, /* a comment */)`
);

/**
 * COMPLEX DEMO-LIKE
 */

runTest(
  "JSX - stateful component inside stateless view function",
  compileJSX(`
    function createView(viewModel) {
      const stateful = componentBuilder(() => (
        <div>
          <h3>{viewModel.count}</h3>
          <button onClick={() => viewModel.increment()}>
            UPDATE
          </button>
        </div>
      ));

      const container = (
        <div>
          <h2>Local stateful inside stateless</h2>
          <p>Outer container is static; inner subtree rerenders via componentBuilder.</p>
          {stateful.render()}
        </div>
      );

      viewModel.addListener(() => stateful.rerender());

      return container;
    }
  `),
  `
    function createView(viewModel) {
      const stateful = componentBuilder(() => (
        d("div", null, d("h3", null, viewModel.count), d("button", { "onClick": () => viewModel.increment() }, "UPDATE"))
      ));

      const container = (
        d("div", null, d("h2", null, "Local stateful inside stateless"), d("p", null, "Outer container is static; inner subtree rerenders via componentBuilder."), stateful.render())
      );

      viewModel.addListener(() => stateful.rerender());

      return container;
    }
  `
);

runTest(
  "JSX - card-like component",
  compileJSX(`
    function card(title, description, content) {
      return (
        <section className="card">
          <h2>{title}</h2>
          <small>{description}</small>
          {content}
        </section>
      );
    }
  `),
  `
    function card(title, description, content) {
      return (
        d("section", { "className": "card" }, d("h2", null, title), d("small", null, description), content)
      );
    }
  `,
  true
);
