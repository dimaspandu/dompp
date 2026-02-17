import "../../src/index.js";
import { installDomppStateful } from "../../src/dom/stateful.js";
import { createSignal } from "../../src/reactive/signal.js";

installDomppStateful();

/**
 * COLLECTION SIGNAL
 *
 * This signal acts strictly as a data store.
 * It is NOT used to drive rendering.
 *
 * The UI in this example follows a retained DOM model:
 * - Nodes are created once
 * - Nodes are mutated directly
 * - No list rerendering occurs
 *
 * Why keep the signal?
 * It provides a single source of truth for:
 * - persistence
 * - debugging
 * - snapshots
 * - server sync
 * - devtools
 *
 * IMPORTANT:
 * Do not assume that every signal must trigger DOM updates.
 */
const [posts, setPosts] = createSignal([]);

/**
 * ROOT CONTAINER
 *
 * setChildren replaces all children in a single operation.
 * This avoids incremental DOM writes during boot.
 */
const root = document.body.setChildren(
  document.createElement("div")
    .setStyles({
      maxWidth: "640px",
      margin: "40px auto",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    })
);

/**
 * INPUT AREA
 */
const textarea = document.createElement("textarea")
  .setAttributes({
    placeholder: "Write something..."
  })
  .setStyles({
    minHeight: "90px",
    padding: "10px",
    fontSize: "14px"
  });

/**
 * FEED CONTAINER
 *
 * This container is mutated directly.
 * Posts are prepended without rerendering the list.
 */
const feed = document.createElement("div")
  .setStyles({
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  });

/**
 * CREATE POST NODE
 *
 * This function builds a retained node.
 *
 * Design rules:
 * - The node is created exactly once
 * - It is never recreated
 * - Updates happen via direct mutation
 *
 * This eliminates:
 * - diffing
 * - reconciliation
 * - unnecessary allocations
 */
function createPostNode(post) {

  /**
   * Fragment prevents intermediate reflows
   * while assembling the subtree.
   */
  const frag = document.createDocumentFragment();

  const text = document.createElement("div")
    .setText(post.text);

  const editBtn = document.createElement("button")
    .setText("Edit");

  const deleteBtn = document.createElement("button")
    .setText("Delete");

  const controls = document.createElement("div")
    .setChildren(editBtn, deleteBtn)
    .setStyles({
      display: "flex",
      gap: "8px"
    });

  const card = document.createElement("div")
    .setChildren(text, controls)
    .setStyles({
      background: "#fff",
      border: "1px solid #e5e5e5",
      borderRadius: "8px",
      padding: "12px"
    });

  /**
   * DELETE HANDLER
   *
   * Mutation order matters:
   * 1. Remove DOM node
   * 2. Update store
   *
   * Keeping both paths synchronized is critical
   * in retained architectures.
   */
  deleteBtn.setEvents({
    click() {

      card.remove();

      setPosts(p =>
        p.filter(x => x.id !== post.id)
      );
    }
  });

  /**
   * EDIT HANDLER
   *
   * Performs inline mutation instead of rerendering.
   *
   * The card temporarily swaps its children
   * to show an editor.
   */
  editBtn.setEvents({
    click() {

      const editor = document.createElement("textarea")
        .setText(post.text)
        .setStyles({
          width: "100%",
          minHeight: "70px"
        });

      const save = document.createElement("button")
        .setText("Save");

      save.setEvents({
        click() {

          /**
           * Avoid mutating the object directly.
           * Instead, produce a new object so the signal
           * remains structurally reliable for future subscribers.
           */
          setPosts(p =>
            p.map(x =>
              x.id === post.id
                ? { ...x, text: editor.value }
                : x
            )
          );

          /**
           * Direct DOM mutation.
           * No rerender required.
           */
          text.setText(editor.value);

          /**
           * Restore original layout.
           */
          card.setChildren(text, controls);
        }
      });

      /**
       * Swap view -> editor
       */
      card.setChildren(editor, save);
    }
  });

  frag.appendChild(card);

  return frag;
}

/**
 * POST BUTTON
 *
 * Creates a retained node and prepends it.
 * This is an O(1) operation.
 *
 * No list diffing occurs.
 */
const postBtn = document.createElement("button")
  .setText("Post")
  .setStyles({
    padding: "10px",
    cursor: "pointer"
  })
  .setEvents({
    click() {

      const value = textarea.value.trim();
      if (!value) return;

      const post = {
        id: crypto.randomUUID(),
        text: value
      };

      textarea.value = "";

      /**
       * DOM mutation first.
       * Instant visual response.
       */
      feed.prepend(
        createPostNode(post)
      );

      /**
       * Store update second.
       */
      setPosts(p => [post, ...p]);
    }
  });

/**
 * FINAL COMPOSITION
 */
root.append(
  textarea,
  postBtn,
  feed
);
