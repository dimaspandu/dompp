import { schedule } from "./scheduler.js";

/**
 * DOM++ Signal
 *
 * A minimal reactive state primitive.
 *
 * Characteristics:
 * - Explicit subscriptions
 * - Batched updates via scheduler
 * - Deterministic disposal
 * - No proxies
 * - No dependency magic
 *
 * Designed to be a foundational building block
 * for higher-level reactive constructs.
 */

export function createSignal(initial) {

  let value = initial;
  const subscribers = new Set();

  /**
   * Read current value.
   */
  function get() {
    return value;
  }

  /**
   * Update signal value.
   *
   * Uses Object.is to prevent unnecessary updates.
   */
  function set(next) {

    if (Object.is(value, next)) {
      return;
    }

    value = next;

    for (const sub of subscribers) {
      schedule(sub);
    }
  }

  /**
   * Subscribe to changes.
   *
   * The subscriber runs immediately once
   * to establish initial state.
   *
   * Returns a dispose function.
   */
  get.subscribe = function (fn) {

    function run() {
      fn(value);
    }

    subscribers.add(run);

    // initial run
    fn(value);

    return function dispose() {
      subscribers.delete(run);
    };
  };

  return [get, set];
}
