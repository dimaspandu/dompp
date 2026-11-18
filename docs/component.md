# Component Rerender Flow

## Render and Rerender

```mermaid
sequenceDiagram
    participant U as User
    participant C as ComponentBuilder
    participant R as Render fn
    participant EB as ElementBuilder
    participant DOM as DOM

    U->>C: createComponent(builder)
    C->>R: builder(rerender)
    R-->>C: tree
    C->>EB: create/reconcile
    EB->>DOM: create nodes
    C-->>U: rendered result + .rerender

    U->>C: result.rerender(callback)
    C->>R: apply callback
    C->>R: builder(rerender) -> next tree
    C->>EB: reconcile (patch in place)
    EB->>DOM: patch nodes
    C-->>U: same identity
```

## Element Root Tag Change

When a component's root tag changes between renders, identity is preserved by replacing the node but keeping the same `ElementBuilder` instance.

```mermaid
flowchart TD
    A[rerender] --> B{same node?}
    B -- yes --> C[sync struct/events]
    B -- no --> D{same tag?}
    D -- yes --> E[_patchFrom]
    D -- no --> F[create nextNode]
    F --> G[replaceChild in DOM]
    G --> H[update node/struct/events]
    H --> I[keep identity]
    C --> I
    E --> I
```

## Array Component Reconciliation

```mermaid
flowchart TD
    A[materializeArray next] --> B[flatten next items]
    B --> C[for each slot]
    C --> D{nextChild null?}
    D -- yes --> E[remove old node]
    D -- no --> F[reconcileSlot prev, next, oldNode]
    F --> G[update slot node]
    C --> H[remove extra old nodes]
    H --> I[reorder nodes in DOM]
    I --> J[update flat array in place]
```
