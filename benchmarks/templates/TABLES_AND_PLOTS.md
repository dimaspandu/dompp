# Tables and Plots Template

## Table T1: Runtime Latency by Scenario (p50 / p95)

| Scenario | Framework | p50 (ms) | p95 (ms) | Mean (ms) | Stddev (ms) |
|---|---|---:|---:|---:|---:|
| counter_burst | dompp |  |  |  |  |
| counter_burst | react |  |  |  |  |
| counter_burst | vue |  |  |  |  |
| counter_burst | solid |  |  |  |  |
| counter_burst | svelte |  |  |  |  |

## Table T2: Memory and Long Tasks

| Scenario | Framework | Mean Heap (MB) | Long Tasks (count) |
|---|---|---:|---:|
| editable_list | dompp |  |  |
| editable_list | react |  |  |
| editable_list | vue |  |  |
| editable_list | solid |  |  |
| editable_list | svelte |  |  |

## Table T3: Bundle Size

| Framework | Raw JS (KB) | Gzip (KB) | Notes |
|---|---:|---:|---|
| dompp |  |  |  |
| react |  |  |  |
| vue |  |  |  |
| solid |  |  |  |
| svelte |  |  |  |

## Table T4: Authoring Study

| Framework | Mean Time (min) | Mean Defects | Completion Rate |
|---|---:|---:|---:|
| dompp |  |  |  |
| react |  |  |  |
| vue |  |  |  |
| solid |  |  |  |
| svelte |  |  |  |

## Table T5: Readability Study

| Framework | Accuracy (%) | Mean Time (sec) | Mean Confidence (1-5) |
|---|---:|---:|---:|
| dompp |  |  |  |
| react |  |  |  |
| vue |  |  |  |
| solid |  |  |  |
| svelte |  |  |  |

## Plot Plan

* `P1`: grouped bar chart, p95 latency by framework/scenario.
* `P2`: box plot, per-iteration update latency distribution.
* `P3`: scatter, memory vs latency (tradeoff view).
* `P4`: bar chart, authoring time and defects.
* `P5`: bar chart, readability accuracy and completion time.

## Figure Captions Template

* Figure X: "Latency distribution across frameworks for [scenario], measured over [n] runs after [warmup] warm-up iterations."
* Figure Y: "Memory-latency tradeoff indicates [insight], with DOMPP showing [measured behavior]."
