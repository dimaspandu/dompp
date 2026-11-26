/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

let componentLikes = 0;

const likeComponent = document.createComponent((rerender) => (
  <section class="demo-surface component-surface">
    <div class="like-row">
      <strong>{componentLikes}</strong>
      <span> likes</span>
    </div>
    <button
      class="like-button"
      type="button"
      onClick={() => rerender(() => componentLikes++)}
    >
      ♥ Like
    </button>
  </section>
));

document.getElementById("component-app").setChildren(
  likeComponent
);
