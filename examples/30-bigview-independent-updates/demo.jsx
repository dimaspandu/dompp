/** @jsx elementBuilder */

function BigView(props, ...children) {
  return elementBuilder(document.getElementById("big-view"), props, ...children);
}

let bigViewTitle;
let bigViewMenu;
let bigViewComponentA;
let bigViewComponentB;
let bigViewCountA = 0;
let bigViewCountB = 0;
let bigViewAlternateMenu = false;

bigViewComponentA = componentBuilder((rerender) => (
  <article style={{ border: "1px solid #cbd5e1", padding: "10px", margin: "8px 0" }}>
    <h4>Component A</h4>
    <p>Local count: {bigViewCountA}</p>
    <button type="button" onClick={() => rerender(() => { bigViewCountA += 1; })}>Update A only</button>{" "}
    <button type="button" onClick={() => { rerender(() => { bigViewCountA += 1; }); bigViewComponentB.rerender(() => { bigViewCountB += 1; }); }}>Update A and B</button>
  </article>
));

bigViewComponentB = componentBuilder((rerender) => (
  <article style={{ border: "1px solid #cbd5e1", padding: "10px", margin: "8px 0" }}>
    <h4>Component B</h4>
    <p>Local count: {bigViewCountB}</p>
    <button type="button" onClick={() => rerender(() => { bigViewCountB += 1; })}>Update B only</button>{" "}
    <button type="button" onClick={() => { rerender(() => { bigViewCountB += 1; }); bigViewComponentA.rerender(() => { bigViewCountA += 1; }); }}>Update B and A</button>
  </article>
));

const bigViewComponentABuilder = bigViewComponentA.render();
const bigViewComponentBBuilder = bigViewComponentB.render();

<BigView>
  {bigViewTitle = <h3>Independent updates inside a Big View</h3>}
  <p>The outer section is stable. Each control updates only the ElementBuilder or stateful component it targets.</p>
  {bigViewComponentABuilder}
  <p><em>Component A and B can rerender separately or together.</em></p>
  {bigViewComponentBBuilder}
  <div style={{ border: "1px dashed #94a3b8", marginTop: "10px", padding: "10px" }}>
    <strong>A directly managed menu</strong>
    {bigViewMenu = (
      <ul aria-label="Big view menu">
        <li key="overview">Overview</li>
        <li key="settings">Settings</li>
      </ul>
    )}
    <button type="button" onClick={() => {
      bigViewAlternateMenu = !bigViewAlternateMenu;
      const labels = bigViewAlternateMenu
        ? [{ id: "profile", label: "Profile" }, { id: "help", label: "Help" }]
        : [{ id: "overview", label: "Overview" }, { id: "settings", label: "Settings" }];
      bigViewMenu
        .setStyles({ listStyle: "square", paddingLeft: "28px" })
        .setAttributes({ "aria-label": bigViewAlternateMenu ? "Secondary menu" : "Big view menu" })
        .setChildren(labels.map((item) => <li key={item.id}>{item.label}</li>));
    }}>Update menu only</button>
  </div>
  <div style={{ marginTop: "10px" }}>
    <button type="button" onClick={() => bigViewTitle.setText("Title updated directly")}>Update title only</button>
  </div>
</BigView>