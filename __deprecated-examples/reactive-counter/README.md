# Reactive Counter

A minimal demonstration of DOM++ fine-grained reactivity.

## Architecture

This example highlights a rendering model based on:

- retained DOM nodes  
- direct mutation  
- signal-driven updates  

No virtual DOM is involved.

## Update Strategy

When the signal changes:

1. Subscribers are scheduled
2. Updates are batched in a microtask
3. Only the affected node mutates

No subtree replacement occurs.

## Why This Matters

This approach avoids:

- reconciliation overhead  
- component re-execution  
- diffing costs  

and enables predictable performance.

## When to Use

Ideal for:

- UI engines  
- embedded widgets  
- performance-sensitive surfaces  
- experimental renderers
