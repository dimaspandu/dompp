# Experimental Protocol (Reproducibility)

Current status:

* Runtime CSV schema validation is automated via `benchmarks/scripts/validate-runtime-csv.mjs`.
* Runtime statistics aggregation (mean/stddev/p50/p95/min/max) is automated via `benchmarks/scripts/aggregate-runtime.mjs`.
* CDN-only browser harness is available at `benchmarks/apps-cdn/` for `dompp`, `react`, `vue`, and `solid`.
* `svelte` and modern `angular` should be evaluated in a separate build-required track.

## 0. Track Definition (Fairness)

Use two explicit tracks:

* Track A (`cdn_only`): frameworks that can run fairly without local build tooling in this repo.
* Track B (`build_required`): frameworks that normally require compile/build pipelines.

Do not mix Track A and Track B values in one aggregate ranking table.

## 1. Environment Lock

Record:

* OS and version
* CPU model / RAM
* Browser and version
* Node.js version
* Commit hash

Use the same machine for all runs when possible.

## 2. Build Mode

* Use production build for every framework.
* Disable source maps if they affect runtime behavior.
* Keep equivalent feature flags.
* For Track A, use production CDN bundles when available (e.g., Vue prod global build).
* For Track B, use each framework's production compiler/build output.

## 3. Warm-Up and Run Count

* Warm-up: 5 runs per scenario/framework.
* Measured runs: minimum 30 runs per scenario/framework.
* Randomize framework execution order to reduce thermal/time bias.

## 4. Measurement Procedure

For each framework + scenario + operation:

1. Reset page state.
2. Run warm-up passes.
3. Run measured passes.
4. Append per-iteration rows to `runtime_raw.csv`.
5. Save any anomalies in `notes`.

## 5. Statistical Reporting

Report at least:

* `n`
* mean
* stddev
* p50
* p95
* min
* max

For inferential comparisons, include 95% CI where feasible.

## 6. Authoring Study Protocol

* Same feature specification per participant.
* Same time cap (e.g., 45 minutes).
* Defects judged by predefined rubric.
* Record:
  * completion time
  * defects count
  * completion status

## 7. Readability Study Protocol

* Mutation-heavy snippets with equal task difficulty.
* Timed comprehension questions.
* Record:
  * correctness score
  * completion time
  * confidence score (optional)

## 8. Data Integrity

* Validate CSV schema before aggregation.
* Keep raw data immutable; write summaries to separate files.
* Version every artifact under `benchmarks/results/`.
