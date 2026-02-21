# Benchmark Suite (Paper Artifacts)

This folder contains protocol/docs/templates/scripts, plus a runnable CDN-only harness under `benchmarks/apps-cdn/`.

## Goals

* Keep experiment formats consistent for the DOMPP paper.
* Produce machine-readable artifacts (`.csv`) for runtime, authoring, and readability studies.
* Provide a validation/aggregation pipeline that can already run now.

## Folder Layout

* `benchmarks/PAPER_OUTLINE_EXPERIMENT.md`: paper structure with experiment sections.
* `benchmarks/HARNESS_DESIGN.md`: framework-neutral harness contract and workloads.
* `benchmarks/PROTOCOL.md`: runbook for fair and reproducible execution.
* `benchmarks/apps-cdn/`: no-build browser apps for cross-framework runtime experiments.
* `benchmarks/apps-build-required/`: guidance for compile-first framework experiments.
* `benchmarks/templates/`: CSV formats and table/plot templates.
* `benchmarks/scripts/`: Node scripts for validation and aggregation.
* `benchmarks/results/`: run outputs (created as needed by scripts).

## Quick Start

1. Copy `runtime_raw_template.csv` to `benchmarks/results/runtime_raw.csv`.
2. Fill it with measured data.
3. Validate CSV shape:
   * `node benchmarks/scripts/validate-runtime-csv.mjs benchmarks/results/runtime_raw.csv`
4. Aggregate runtime metrics:
   * `node benchmarks/scripts/aggregate-runtime.mjs benchmarks/results/runtime_raw.csv benchmarks/results/runtime_summary.csv benchmarks/results/runtime_tables.md`

## Minimum Deliverables for Paper

* `runtime_raw.csv` + `runtime_summary.csv`
* `authoring_study.csv`
* `readability_study.csv`
* `runtime_tables.md` (auto-generated)

## Notes

* CDN-only harness currently targets: `dompp`, `react`, `vue`, `solid`.
* DOMPP includes reconcile variants for intra-framework comparison:
  * `counter-reconcile` (with `matchById`)
  * `counter-reconcile-no-match-by-id` (without `matchById`)
* `svelte` and modern `angular` are build-first toolchains; include them in a separate build-required track for fair comparison.
* Use production mode for fair runtime comparisons.
