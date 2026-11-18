# Enhancement Flow (High Level)

## Installation

```mermaid
flowchart TD
    A[installDOMPP doc] --> B[createBuilders doc]
    B --> C[installFragmentEnhancements]
    B --> D[installElementEnhancements]
    B --> E[installDocumentEnhancements]
    C --> F[DocumentFragment.prototype.setChildren/setText]
    D --> G[Element.prototype setters]
    E --> H[Document.prototype.createComponent]
    E --> I[Document.prototype.createElement override]
    E --> J[Document.prototype.createDocumentFragment override]
    B --> K[return API object]
```

## Per-Document Builder Resolution

Enhancements store builders on `doc.__domppBuilders`. Prototype methods resolve builders from `target.ownerDocument` (or the document itself), so the same prototypes work across documents.

```mermaid
sequenceDiagram
    participant U as User code
    participant D as Document
    participant P as Prototype method
    participant B as Builders

    U->>D: document.createElement(tag, props, ...children)
    D->>P: createElement override
    P->>D: getBuilders(this)
    D-->>P: builders
    P->>B: elementBuilder(...)
    B-->>U: ElementBuilder
```

## createElement Routing

```mermaid
flowchart TD
    A[createElement tagName, options, rest] --> B{builders installed?}
    B -- no --> C[native createElement]
    B -- yes --> D{tagName function?}
    D -- yes --> E[elementBuilder function component]
    D -- no --> F{tagName is element node?}
    F -- yes --> G[elementBuilder adopt]
    F -- no --> H{options plain object without is?}
    H -- yes --> I[elementBuilder with props]
    H -- no --> J{rest.length > 0?}
    J -- yes --> K[elementBuilder with children]
    J -- no --> C
```

## createComponent

`document.createComponent(builder)` returns a rendered `ElementBuilder` (or flat array) extended with `.rerender(callback?)`.

```mermaid
flowchart TD
    A[createComponent builder] --> B[new ComponentBuilder]
    B --> C[render immediately]
    C --> D{result is array?}
    D -- yes --> E[materializeArray]
    D -- no --> F[return ElementBuilder]
    E --> G[flat child array + .rerender]
    F --> H[.rerender attached]
```
