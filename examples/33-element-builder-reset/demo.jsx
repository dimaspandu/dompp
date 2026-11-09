/** @jsx elementBuilder */

function Home() {
  return (
    <section className="page page--home">
      <h3>Home</h3>
      <p>Home route content with <code>elementBuilder</code> + <code>.reset()</code>.</p>
      <div className="home-only" data-route="home">
        This div has class="home-only" and data-route="home"
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="page page--about">
      <h3>About</h3>
      <p>About route content (no home-only class or data-route).</p>
      <div className="about-only" data-route="about">
        This div has class="about-only" and data-route="about"
      </div>
    </section>
  );
}

const host = document.getElementById("outlet");
const status = document.getElementById("status");
if (!host || !status) {
  throw new Error("Missing #outlet or #status elements");
}

function describeHost() {
  const attrs = Array.from(host.attributes).map((a) => `${a.name}="${a.value}"`).join(" ") || "(none)";
  const style = host.getAttribute("style") || "(none)";
  const children = Array.from(host.children)
    .map(
      (c) =>
        `${c.tagName.toLowerCase()}${c.className ? "." + c.className.split(" ").join(".") : ""}${c.id ? "#" + c.id : ""}`
    )
    .join(", ") || "(none)";
  return `attrs: [${attrs}]; style: "${style}"; children: [${children}]`;
}

function renderReset(path) {
  const view = path === "/about" ? <About /> : <Home />;
  elementBuilder(host, { class: path === "/about" ? "page page--about" : "page page--home", id: "outlet" })
    .reset()
    .setChildren(view);
  status.textContent = `elementBuilder + reset() → ${path}: ${describeHost()}`;
}

elementBuilder(
  document.getElementById("controls"),
  null,
  <div>
    <button type="button" onClick={() => renderReset("/")}>
      Route "/" (Home)
    </button>
    <button type="button" onClick={() => renderReset("/about")}>
      Route "/about" (About)
    </button>
  </div>
);

renderReset("/");