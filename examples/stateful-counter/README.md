# Stateful Counter Example

This example demonstrates DOM++ element-local state.

Unlike the reactive example, state does not live in signals or external stores.  
Each element manages its own state and automatically updates when that state changes.

## What This Shows

- Element-owned state via `setState`
- Automatic setter re-execution
- Mutation-driven UI
- No virtual DOM
- No dependency tracking
- No global reactivity

## Why This Matters

This pattern encourages highly predictable UI behavior:

- State is colocated with the element that uses it
- Updates are explicit
- Rendering stays cheap
- Mental overhead is minimal

## When to Prefer Stateful Elements

Use this approach when:

- State is local to a component
- You want extremely low runtime cost
- You value explicit mutations
- You do not need cross-component reactivity

## Running the Example

From the project root:

```bash
node examples/serve.js
