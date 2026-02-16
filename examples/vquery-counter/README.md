# VQuery Counter

A minimal counter demonstrating DOM++ with the VQuery addon.

## Concepts

### Retained DOM
Elements are created once and mutated afterward.  
No virtual DOM and no subtree replacement.

### Stable References
Node references remain stable for the lifetime of the app.

### Direct Mutation
Only the text node is updated when state changes.

## Why VQuery?

VQuery is a tiny helper inspired by jQuery ergonomics without introducing abstraction overhead.

It provides:

- `$()` → safe element selection
- `v()` → element creation shorthand

Nothing more.

## Architecture Style

This example reflects how low-level UI engines typically operate:

- explicit node creation  
- explicit mutation  
- zero diffing  

## When to Use This Pattern

Ideal for:

- small UI engines  
- embedded widgets  
- performance-critical surfaces  
- framework experimentation  

Not intended to replace full frameworks.
