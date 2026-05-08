/**
 * DOM++ Reactive Scheduler
 *
 * A minimal microtask-based job scheduler.
 *
 * Design goals:
 * - Deduplicate jobs
 * - Batch updates
 * - Prevent recursive flush
 * - Stay extremely small
 *
 * This is a foundational primitive used by signals,
 * computed values, and effects.
 */

let queue = new Set();
let scheduled = false;

/**
 * Schedule a job to run in the next microtask.
 *
 * Jobs are deduplicated automatically.
 */
export function schedule(job) {

  queue.add(job);

  if (!scheduled) {

    scheduled = true;

    queueMicrotask(flush);
  }
}

/**
 * Flush the job queue.
 *
 * Snapshotting protects against mutations
 * during iteration.
 */
function flush() {

  const jobs = queue;

  queue = new Set();
  scheduled = false;

  for (const job of jobs) {
    job();
  }
}

/**
 * Batch multiple mutations into a single flush.
 *
 * Currently this is just a passthrough,
 * but it future-proofs the API.
 *
 * Later you could support:
 * - nested batching
 * - sync flushing
 * - priority lanes
 */
export function batch(fn) {
  fn();
}
