# Contributing

Thanks for contributing to DOMPP. This project prioritizes clarity, minimalism, and predictable behavior.

## Architecture First

Please keep the separation between modules intact:

* `src/dom` handles mutation only
* `src/reactive` handles scheduling and state propagation
* `src/addons` is optional ergonomics on top of core behavior

If a change blurs these boundaries, it probably belongs in a different module.

## Design Principles

* Prefer explicit behavior over convenience
* Avoid hidden state or implicit dependency tracking
* Keep APIs small and easy to reason about
* Do not add features that require a framework mindset

## Prototype Safety

DOMPP extends native prototypes. Changes here affect all elements globally.

* Never override existing methods
* Favor collision-resistant names
* Keep methods deterministic and side-effect free

## Examples

Examples should be short and focused on one concept.

If you add a new example, also add a README for it under `examples/<name>/README.md`.

## Running Examples

Run the example server:

```bash
node examples/serve.js
```

This serves the repository root and builds a list of examples automatically.

