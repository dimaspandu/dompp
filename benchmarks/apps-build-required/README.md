# Build-Required Experiment Apps

This track is reserved for frameworks that are compilation-first and should be benchmarked using their normal production build pipelines.

## Planned Frameworks

- `svelte`
- `angular`

## Why Separate Track

Running compile-first frameworks through in-browser runtime compilation via CDN is possible, but it introduces tooling overhead that is not representative of real production usage.

For fair comparisons:

- keep these frameworks in a dedicated `build_required` track
- run production builds
- report results separately from `cdn_only` track

## Workload Spec (same as CDN track)

- `counter`
- `ordered-list-keyed`

Behavioral contract:

- counter supports increment/decrement/reset
- ordered list prepends a new item on refresh
- keyed identity is preserved according to each framework idiom
- apply `"(UPDATED!)"` to topmost even position (item #2) only when total items > 5

