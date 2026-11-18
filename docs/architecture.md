# DOM++ Architecture (High Level)

```mermaid
flowchart TB
    subgraph Entry["Entry"]
        A[installDOMPP / createDOMPP]
        B[window.DOMPP]
    end

    subgraph Builders["Builders (src/builders)"]
        EB[createElementBuilder]
        CB[createComponentBuilder]
        CB2[createBuilders]
    end

    subgraph Enhancements["Enhancements (src/enhancements)"]
        FE[fragment.js]
        EE[element.js]
        DE[document.js]
    end

    subgraph Core["Core Engine"]
        EB2[ElementBuilder]
        CB3[ComponentBuilder]
        REC[Reconciliation]
        NORM[normalizeChildren]
    end

    A --> CB2
    CB2 --> EB
    CB2 --> CB
    EB --> EB2
    CB --> CB3
    CB2 --> FE
    CB2 --> EE
    CB2 --> DE
    FE --> EB2
    EE --> EB2
    DE --> EB2
    DE --> CB3
    EB2 --> REC
    CB3 --> REC
    REC --> NORM
```

## Layers

- **Entry**: `installDOMPP(doc)` installs builders and enhancements onto a document; browser entry auto-installs `window.DOMPP`.
- **Builders**: pure factories (`createElementBuilder`, `createComponentBuilder`, `createBuilders`) with no global dependency.
- **Enhancements**: patch `Document`, `Element`, and `DocumentFragment` prototypes to delegate to builders.
- **Core Engine**: `ElementBuilder` (virtual descriptor + reconciliation), `ComponentBuilder` (render/rerender boundary).

## Key Invariants

- DOM nodes are real browser nodes; no virtual DOM wrapper.
- `ElementBuilder` holds a `struct` descriptor and a live `node`.
- Component render returns the rendered result directly (element or flat array) with a non-enumerable `.rerender`.
- Fragments and array-returning components produce flat child arrays (per-slot reconciliation).
