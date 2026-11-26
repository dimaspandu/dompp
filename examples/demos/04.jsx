/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

function LikeViewModel() {
  let likes = 0;
  const listeners = new Set();

  return {
    get likes() {
      return likes;
    },

    like() {
      likes++;
      listeners.forEach(listener => listener(likes));
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

const viewModel = LikeViewModel();
const likeComponent = document.createComponent(() => (
  <section class="demo-surface mvvm-surface">
    <div class="like-row">
      <strong>{viewModel.likes}</strong>
      <span> likes</span>
    </div>
    <button
      class="like-button"
      type="button"
      onClick={() => viewModel.like()}
    >
      ♥ Like
    </button>
  </section>
));

// Example without using setChildren.
document.createElement(
  document.getElementById("mvvm-app"),
  null,
  likeComponent
);

viewModel.subscribe(() => likeComponent.rerender());
