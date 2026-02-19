# Mini Post

This example demonstrates a retained-DOM pattern for a simple post feed:

* nodes are created once, then mutated directly
* new posts are inserted with `prepend` without re-rendering the full list
* edit actions mutate the same node (view/editor swap) instead of rebuilding subtrees
* data is still stored in a signal as the source of truth

## What It Demonstrates

* Integration of DOM++ setters: `setChildren`, `setText`, `setEvents`
* Clear separation between UI mutation path and store update path
* List operations without diffing or virtual DOM

## How to Run

From the project root:

```bash
node examples/serve.js
```

Open:

`http://localhost:3000/examples/mini-post/`
