# Setters Flow

## Chainable Setters

All setters return the same `ElementBuilder` for fluent composition.

```mermaid
flowchart LR
    C[createElement] --> EB[ElementBuilder]
    EB --> SA[setAttributes]
    EB --> SS[setStyles]
    EB --> SE[setEvents]
    EB --> SC[setChildren]
    EB --> ST[setText]
    SA --> EB
    SS --> EB
    SE --> EB
    SC --> EB
    ST --> EB
```

## setChildren Reconciliation

```mermaid
flowchart TD
    A[setChildren invoked] --> B[normalizeChildren]
    B --> C{node exists?}
    C -- no --> D[store in struct.children]
    C -- yes --> E[_reconcileChildren]
    E --> F{previous child?}
    F -- ElementBuilder + same tag --> G[patch in place]
    F -- ElementBuilder + diff tag --> H[replace node]
    F -- text node --> I[update nodeValue]
    F -- none --> J[create & insert]
    G --> K[update children array]
    H --> K
    I --> K
    J --> K
```

## setText

`setText(text)` is `setChildren([text])` — normalizes to a single text child and reconciles.

## Security Guards (setAttributes)

```mermaid
flowchart TD
    A[setAttributes] --> B{attr name?}
    B -- on* --> C[throw: inline events disabled]
    B -- srcdoc --> D[throw: srcdoc disabled]
    B -- style --> E[throw: use setStyles]
    B -- URL attr --> F[validate protocol]
    B -- other --> G[setAttribute]
    F -- unsafe --> H[throw]
    F -- safe --> G
```
