/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let basicLikes = 0;
let basicCount;

function BasicApp(_props, ...children) {
  return document.createElement(
    document.getElementById("basic-jsx-app"),
    _props,
    ...children
  );
}

<BasicApp
  className="demo-surface jsx-surface"
  styles={{
    backgroundColor: "#fffebb",
  }}
>
  <div class="like-row">
    {basicCount = <strong>{basicLikes}</strong>}
    <span> likes</span>
  </div>
  <button
    class="like-button"
    type="button"
    onClick={() => {
      basicLikes++;
      basicCount.setText(basicLikes);
    }}
  >
    ♥ Like
  </button>
</BasicApp>
