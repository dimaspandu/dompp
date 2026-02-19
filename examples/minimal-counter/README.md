# Minimal Counter

This is the smallest possible DOM++ application.

No addons.  
No abstractions.  
No virtual DOM.  
No framework.

Just direct DOM mutation.

---

## What This Example Teaches

DOM++ follows a **retained DOM architecture**:

1. Create elements once
2. Keep references
3. Mutate only what changes
4. Never re-render entire subtrees

This results in:

- lower memory pressure
- fewer garbage collections
- predictable performance
- zero diffing overhead

---

## Why This Matters

Many modern UI frameworks recreate large portions of the DOM on every state change.

DOM++ takes the opposite approach:

> The DOM is not the enemy.  
> Unnecessary allocation is.

---

## How to Run

Because this example uses native ES Modules, you must serve it with a local server.

From the project root:

```bash
node examples/serve.js
```

Then open `http://localhost:3000` and select the example from the index.
