import compileJSX from "../compileJSX.js";
import runTest from "./helpers/runTest.js";

/**
 * FACTORY NAME - DEFAULT
 */

runTest(
  "JSX - basic element",
  compileJSX(`const x = <div>Hello</div>;`),
  `const x = document.createElement("div", null, "Hello");`
);

runTest(
  "JSX - element with className",
  compileJSX(`<div className="foo" />`),
  `document.createElement("div", { "className": "foo" })`
);

runTest(
  "JSX - self-closing with attributes",
  compileJSX(`<img src="x.png" alt="img" />`),
  `document.createElement("img", { "src": "x.png", "alt": "img" })`
);

runTest(
  "JSX - nested elements",
  compileJSX(`<div><span>A</span><span>B</span></div>`),
  `document.createElement("div", null, document.createElement("span", null, "A"), document.createElement("span", null, "B"))`
);

runTest(
  "JSX - expression child",
  compileJSX(`<h1>{title}</h1>`),
  `document.createElement("h1", null, title)`
);

runTest(
  "JSX - mixed children",
  compileJSX(`<div>Text <span>{val}</span></div>`),
  `document.createElement("div", null, "Text", document.createElement("span", null, val))`
);

runTest(
  "JSX - boolean attribute",
  compileJSX(`<input disabled />`),
  `document.createElement("input", { "disabled": true })`
);

runTest(
  "JSX - spread attributes",
  compileJSX(`<div {...props} />`),
  `document.createElement("div", { ...(props) })`
);

runTest(
  "JSX - spread attributes with whitespace after brace",
  compileJSX(`<StoryListItem { ...story } />`),
  `document.createElement(StoryListItem, { ...(story) })`
);

runTest(
  "JSX - spread attributes without whitespace after brace",
  compileJSX(`<StoryListItem {...story} />`),
  `document.createElement(StoryListItem, { ...(story) })`
);

runTest(
  "JSX - object expression attribute",
  compileJSX(`<button on={{ click: handler }}>Click</button>`),
  `document.createElement("button", { "on": { click: handler } }, "Click")`
);

runTest(
  "JSX - template literal expression",
  compileJSX('<strong>{`Count: ${count}`}</strong>'),
  'document.createElement("strong", null, `Count: ${count}`)'
);

runTest(
  "JSX - template literal in attribute",
  compileJSX('<div style={`color: red`} />'),
  'document.createElement("div", { "style": `color: red` })'
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
      document.createElement("div", null, "Hello")
    );
  `
);

/**
 * COMPONENT FUNCTION INVOCATION (UPPERCASE TAG)
 */

runTest(
  "JSX - uppercase component without attributes",
  compileJSX(`<Item />`),
  `document.createElement(Item, null)`
);

runTest(
  "JSX - uppercase component with attributes",
  compileJSX(`<Item text="Hello" />`),
  `document.createElement(Item, { "text": "Hello" })`
);

runTest(
  "JSX - uppercase component with children",
  compileJSX(`<Item>text</Item>`),
  `document.createElement(Item, null, "text")`
);

runTest(
  "JSX - uppercase component with expression child",
  compileJSX(`<Item>{value}</Item>`),
  `document.createElement(Item, null, value)`
);

runTest(
  "JSX - mixed lowercase and uppercase",
  compileJSX(`<div><Item text="x" /></div>`),
  `document.createElement("div", null, document.createElement(Item, { "text": "x" }))`
);

runTest(
  "JSX - multi-word uppercase component",
  compileJSX(`<FooBar>text</FooBar>`),
  `document.createElement(FooBar, null, "text")`
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
 * FACTORY NAME - @jsx PRAGMA WITH DOTTED PATH
 */

runTest(
  "JSX - @jsx pragma with dotted path factory",
  compileJSX(`/** @jsx document.createElement */<div />`),
  `document.createElement("div", null)`
);

runTest(
  "JSX - @jsx pragma with dotted path factory and children",
  compileJSX(`/** @jsx document.createElement */<div>Hello</div>`),
  `document.createElement("div", null, "Hello")`
);

/**
 * FACTORY NAME - @jsxRUNTIME PRAGMA
 */

runTest(
  "JSX - @jsxRuntime classic pragma",
  compileJSX(`/** @jsxRuntime classic */<div />`),
  `document.createElement("div", null)`
);

runTest(
  "JSX - @jsxRuntime classic pragma strips comment",
  compileJSX(`/** @jsxRuntime classic */\n<div />`),
  `\ndocument.createElement("div", null)`
);

/**
 * FACTORY NAME - @jsxFRAG PRAGMA
 */

runTest(
  "JSX - @jsxFrag pragma with dotted path",
  compileJSX(`/** @jsxFrag document.createDocumentFragment */<><div /></>`),
  `document.createDocumentFragment(document.createElement("div", null))`
);

runTest(
  "JSX - @jsxFrag pragma without @jsx uses default factory for element",
  compileJSX(`/** @jsxFrag document.createDocumentFragment */<><div /></>`),
  `document.createDocumentFragment(document.createElement("div", null))`
);

/**
 * FACTORY NAME - COMBINED PRAGMAS
 */

runTest(
  "JSX - all three pragmas combined",
  compileJSX(`/** @jsxRuntime classic */ /** @jsx document.createElement */ /** @jsxFrag document.createDocumentFragment */ <><div>A</div></>`),
  `document.createDocumentFragment(document.createElement("div", null, "A"))`
);

/**
 * FACTORY NAME - OBJECT PARAMETER
 */

runTest(
  "JSX - object factory parameter",
  compileJSX(`<div />`, { jsx: "h", jsxFrag: "h.fragment" }),
  `h("div", null)`
);

runTest(
  "JSX - object factory parameter with children",
  compileJSX(`<div>Hello</div>`, { jsx: "jsx" }),
  `jsx("div", null, "Hello")`
);

runTest(
  "JSX - object factory parameter with custom fragment",
  compileJSX(`<><span>x</span></>`, { jsx: "h", jsxFrag: "h.fragment" }),
  `h.fragment(h("span", null, "x"))`
);

runTest(
  "JSX - object factory parameter with dotted paths",
  compileJSX(`<div>Hello</div>`, { jsx: "document.createElement", jsxFrag: "document.createDocumentFragment" }),
  `document.createElement("div", null, "Hello")`
);

runTest(
  "JSX - object factory parameter fragment uses jsxFrag",
  compileJSX(`<><div>A</div></>`, { jsx: "document.createElement", jsxFrag: "document.createDocumentFragment" }),
  `document.createDocumentFragment(document.createElement("div", null, "A"))`
);

runTest(
  "JSX - object factory parameter only jsx specified",
  compileJSX(`<div />`, { jsx: "custom" }),
  `custom("div", null)`
);

runTest(
  "JSX - object factory parameter only jsxFrag specified",
  compileJSX(`<><div /></>`, { jsxFrag: "frag" }),
  `frag(document.createElement("div", null))`
);

/**
 * FRAGMENTS
 */

runTest(
  "JSX - fragment",
  compileJSX(`<><div>A</div><div>B</div></>`),
  `document.createDocumentFragment(document.createElement("div", null, "A"), document.createElement("div", null, "B"))`
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
  `document.createElement("input", { "value": query, "onInput": (e) => vm.search(e.target.value) })`
);

runTest(
  "JSX - block comment between attributes",
  compileJSX(`<div /* layout */ className="x" />`),
  `document.createElement("div", { "className": "x" })`
);

runTest(
  "JSX - comment as first thing inside opening tag",
  compileJSX(`<div /* first */ className="x" />`),
  `document.createElement("div", { "className": "x" })`
);

runTest(
  "JSX - line comment as first thing inside opening tag",
  compileJSX(`<div // first
  className="x" />`),
  `document.createElement("div", { "className": "x" })`
);

runTest(
  "JSX - comment immediately before closing bracket",
  compileJSX(`<div className="x" /* end */>hi</div>`),
  `document.createElement("div", { "className": "x" }, "hi")`
);

runTest(
  "JSX - comment immediately before self-closing bracket",
  compileJSX(`<div className="x" /* end */ />`),
  `document.createElement("div", { "className": "x" })`
);

runTest(
  "JSX - line comment immediately before self-closing bracket",
  compileJSX(`<div className="x" // end
/>`),
  `document.createElement("div", { "className": "x" })`
);

runTest(
  "JSX - multiple consecutive comments separated by newlines",
  compileJSX(`<div
  // one
  // two
  /* three */
  className="x"
/>`),
  `document.createElement("div", { "className": "x" })`
);

runTest(
  "JSX - comment between spread and normal attribute",
  compileJSX(`<div {...props} /* spread */ className="x" />`),
  `document.createElement("div", { ...(props), "className": "x" })`
);

runTest(
  "JSX - line comment between spread and normal attribute",
  compileJSX(`<div {...props}
  // spread
  className="x" />`),
  `document.createElement("div", { ...(props), "className": "x" })`
);

runTest(
  "JSX - comment before spread attribute",
  compileJSX(`<div /* spread */ {...props} />`),
  `document.createElement("div", { ...(props) })`
);

runTest(
  "JSX - double slash in quoted attribute value is not a comment",
  compileJSX(`<div title="// not a comment" />`),
  `document.createElement("div", { "title": "// not a comment" })`
);

runTest(
  "JSX - block comment marker in quoted attribute value is not a comment",
  compileJSX(`<div title="/* not a comment */" />`),
  `document.createElement("div", { "title": "/* not a comment */" })`
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
  `document.createElement("div", null, /* a comment */)`
);

/**
 * COMMENTS AT TOP LEVEL (OUTSIDE JSX)
 */

runTest(
  "JSX - block comment before JSX is ignored",
  compileJSX(`/* a plain block comment */
const x = <div>Hi</div>;`),
  `/* a plain block comment */
const x = document.createElement("div", null, "Hi");`
);

runTest(
  "JSX - line comment before JSX is ignored",
  compileJSX(`// a plain line comment
const x = <div>Hi</div>;`),
  `// a plain line comment
const x = document.createElement("div", null, "Hi");`
);

runTest(
  "JSX - apostrophe inside block comment does not swallow JSX",
  compileJSX(`/*
 * The stateless createView builds a container and embeds a componentBuilder
 * instance. The ViewModel notifies listeners; the view's listener calls
 */
function createView(viewModel) {
  return <div>{viewModel.count}</div>;
}`),
  `/*
 * The stateless createView builds a container and embeds a componentBuilder
 * instance. The ViewModel notifies listeners; the view's listener calls
 */
function createView(viewModel) {
  return document.createElement("div", null, viewModel.count);
}`
);

runTest(
  "JSX - apostrophe inside line comment does not swallow JSX",
  compileJSX(`// the view's listener calls
const x = <div>Hi</div>;`),
  `// the view's listener calls
const x = document.createElement("div", null, "Hi");`
);

runTest(
  "JSX - multiple top-level comments before JSX",
  compileJSX(`/* first */
// second
/* third */
const x = <div>Hi</div>;`),
  `/* first */
// second
/* third */
const x = document.createElement("div", null, "Hi");`
);

runTest(
  "JSX - block comment between two JSX elements",
  compileJSX(`const a = <div>A</div>;
/* the view's listener */
const b = <div>B</div>;`),
  `const a = document.createElement("div", null, "A");
/* the view's listener */
const b = document.createElement("div", null, "B");`
);

runTest(
  "JSX - apostrophe in string before JSX is still skipped",
  compileJSX(`const name = "view's listener";
const x = <div>{name}</div>;`),
  `const name = "view's listener";
const x = document.createElement("div", null, name);`
);

runTest(
  "JSX - double slash inside block comment is not a line comment",
  compileJSX(`/* see https://example.com/docs */
const x = <div>Hi</div>;`),
  `/* see https://example.com/docs */
const x = document.createElement("div", null, "Hi");`
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
        document.createElement("div", null, document.createElement("h3", null, viewModel.count), document.createElement("button", { "onClick": () => viewModel.increment() }, "UPDATE"))
      ));

      const container = (
        document.createElement("div", null, document.createElement("h2", null, "Local stateful inside stateless"), document.createElement("p", null, "Outer container is static; inner subtree rerenders via componentBuilder."), stateful.render())
      );

      viewModel.addListener(() => stateful.rerender());

      return container;
    }
  `
);

runTest(
  "JSX - card-like component",
  compileJSX(`
    function cardocument.createElement(title, description, content) {
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
    function cardocument.createElement(title, description, content) {
      return (
        document.createElement("section", { "className": "card" }, document.createElement("h2", null, title), document.createElement("small", null, description), content)
      );
    }
  `,
  true
);
