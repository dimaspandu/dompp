# Benchmark Suite (Experimental Paper Support)

This folder contains an executable benchmark design to move the DOMPP paper from proposal to evidence.

## Goals

* Run comparable experiments across `dompp`, `react`, `vue`, `solid`, and `svelte`.
* Produce machine-readable outputs (`.csv`) for runtime, authoring, and readability studies.
* Generate paper-ready summary artifacts from raw data.

## Folder Layout

* `benchmarks/PAPER_OUTLINE_EXPERIMENT.md`: paper structure with experiment sections.
* `benchmarks/HARNESS_DESIGN.md`: framework-neutral harness contract and workloads.
* `benchmarks/PROTOCOL.md`: runbook for fair and reproducible execution.
* `benchmarks/templates/`: CSV formats and table/plot templates.
* `benchmarks/scripts/`: Node scripts for validation and aggregation.
* `benchmarks/results/`: where raw and summarized outputs live.

## Quick Start

1. Copy templates into `benchmarks/results/` and start filling raw data.
2. Validate CSV shape:
   * `node benchmarks/scripts/validate-runtime-csv.mjs benchmarks/results/runtime_raw.csv`
3. Aggregate runtime metrics:
   * `node benchmarks/scripts/aggregate-runtime.mjs benchmarks/results/runtime_raw.csv benchmarks/results/runtime_summary.csv benchmarks/results/runtime_tables.md`

## Minimum Deliverables for Paper

* `runtime_raw.csv` + `runtime_summary.csv`
* `authoring_study.csv`
* `readability_study.csv`
* `runtime_tables.md` (auto-generated)

## Notes

* The harness is intentionally framework-agnostic.
* You can start with `dompp` only, then add frameworks incrementally.
* Keep all tests in production mode when possible.
