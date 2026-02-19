import { DOMPP_SETTERS } from "../dom/dompp.js";

/**
 * DOM++ Stateful Addon
 *
 * Adds element-local state with deterministic binding updates.
 *
 * ARCHITECTURE GOALS:
 *
 * - Preserve DOM++ minimalism
 * - Avoid proxies and dependency graphs
 * - Guarantee predictable execution
 * - Batch DOM writes
 * - Prevent unnecessary mutations
 *
 * This addon allows setters to accept a callback:
 *
 * element.setText(({ state }) => ...)
 *
 * When state changes, bindings re-run automatically.
 *
 * Additionally, setter-level memoization prevents DOM writes
 * if the computed value has not changed.
 */

export function installDomppStateful() {

  /**
   * Ensures the element has internal storage.
   *
   * __dompp_state
   *   Holds the local state object.
   *
   * __dompp_bindings
   *   Stores reactive runners.
   *
   * __dompp_flushScheduled
   *   Prevents duplicate microtask scheduling.
   */
  function ensure(el) {
    if (!el.__dompp_state) {
      el.__dompp_state = {};
      el.__dompp_bindings = new Set();
      el.__dompp_flushScheduled = false;
    }
  }

  /**
   * Registers a reactive binding.
   *
   * The runner executes immediately once
   * to establish the initial DOM state.
   */
  function bind(el, runner) {
    el.__dompp_bindings.add(runner);
    runner();
  }

  /**
   * Executes bindings safely.
   *
   * Snapshotting prevents iteration issues
   * if bindings mutate the set.
   */
  function flush(el) {

    el.__dompp_flushScheduled = false;

    if (!el.__dompp_bindings) return;

    const runners = Array.from(el.__dompp_bindings);

    for (const run of runners) {
      run();
    }
  }

  /**
   * Schedules a batched flush using microtasks.
   *
   * Multiple setState calls inside the same tick
   * result in a single DOM update pass.
   */
  function scheduleFlush(el) {

    if (el.__dompp_flushScheduled) return;

    el.__dompp_flushScheduled = true;

    queueMicrotask(() => flush(el));
  }

  /**
   * setState
   *
   * Performs shallow change detection.
   * Avoids scheduling a flush when nothing changed.
   */
  Object.defineProperty(Element.prototype, "setState", {
    value: function (next) {

      ensure(this);

      let changed = false;

      if (typeof next === "function") {

        const prev = { ...this.__dompp_state };

        next({
          state: this.__dompp_state,
          el: this
        });

        for (const key in this.__dompp_state) {
          if (!Object.is(prev[key], this.__dompp_state[key])) {
            changed = true;
            break;
          }
        }

      } else {

        for (const key in next) {
          if (!Object.is(this.__dompp_state[key], next[key])) {
            changed = true;
            break;
          }
        }

        if (changed) {
          Object.assign(this.__dompp_state, next);
        }
      }

      if (changed) {
        scheduleFlush(this);
      }

      return this;
    },
    writable: false,
    configurable: true,
  });

  /**
   * Wraps setters to support reactive callbacks.
   *
   * Adds setter-level memoization:
   *
   * If the computed result is identical,
   * the DOM write is skipped entirely.
   */
  function wrapSetter(name) {

    const original = Element.prototype[name];

    if (!original) {
      throw new Error(
        `[DOM++ Stateful] Cannot wrap "${name}". Install dompp first.`
      );
    }

    if (original.__dompp_wrapped) {
      return;
    }

    function wrapped(...args) {

      const first = args[0];

      // Fast path for non-reactive usage.
      if (typeof first !== "function") {
        return original.apply(this, args);
      }

      ensure(this);

      let previousResult;

      const runner = () => {

        const nextResult = first({
          state: this.__dompp_state,
          el: this,
        });

        /**
         * Memoization check.
         *
         * Skips DOM mutation if output is identical.
         */
        if (Object.is(previousResult, nextResult)) {
          return;
        }

        previousResult = nextResult;

        // Normalize children output.
        if (name === "setChildren") {

          const children = Array.isArray(nextResult)
            ? nextResult
            : [nextResult];

          original.call(this, ...children);
          return;
        }

        original.call(this, nextResult);
      };

      bind(this, runner);

      return this;
    }

    wrapped.__dompp_wrapped = true;

    Object.defineProperty(Element.prototype, name, {
      value: wrapped,
      writable: false,
      configurable: true,
    });
  }

  /**
   * Enable reactive bindings for all DOM++ setters.
   */
  DOMPP_SETTERS.forEach(wrapSetter);
}
