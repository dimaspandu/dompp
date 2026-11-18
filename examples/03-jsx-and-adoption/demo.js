/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let likes = 0;
let count;

function Counter(_props, ...children) {
  return document.createElement(
    document.getElementById("app"),
    _props,
    ...children
  );
}

<Counter className="surface" styles={{ backgroundColor: "#fffebb" }}>
  <div className="like-row">
    {count = <strong>{likes}</strong>}
    <span> likes</span>
  </div>
  <button
    className="like-button"
    type="button"
    onClick={() => {
      likes++;
      count.setText(likes);
    }}
  >
    Like
  </button>
</Counter>
