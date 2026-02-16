import { DOMPP_SETTERS } from "./dompp.js";

/**
 * DOM++ Stateful Addon
 *
 * Adds element-local state and binding support.
 *
 * DESIGN GOALS:
 * - Keep DOM++ core pure
 * - No proxies
 * - No dependency tracking
 * - Deterministic updates
 * - Extremely small runtime
 *
 * Allows setters to accept callbacks:
 *
 * element.setText(({ state }) => ...)
 *
 * Bindings automatically re-run when state changes.
 */

export function installDomppStateful() {

  /**
   * Ensure internal storage exists.
   */
  function ensure(el) {
    if (!el.__dompp_state) {
      el.__dompp_state = {};
      el.__dompp_bindings = new Set();
    }
  }

  /**
   * Register a binding runner.
   */
  function bind(el, runner) {
    el.__dompp_bindings.add(runner);
    runner(); // initial run
  }

  /**
   * Flush all bindings.
   *
   * Snapshotting avoids issues if bindings mutate during iteration.
   */
  function flush(el) {
    if (!el.__dompp_bindings) return;

    const runners = Array.from(el.__dompp_bindings);

    for (const run of runners) {
      run();
    }
  }

  /**
   * setState
   */
  Object.defineProperty(Element.prototype, "setState", {
    value: function (next) {

      ensure(this);

      if (typeof next === "function") {
        next({ state: this.__dompp_state });
      } else {
        Object.assign(this.__dompp_state, next);
      }

      flush(this);

      return this;
    },
    writable: false,
    configurable: true,
  });

  /**
   * Wrap callback-aware setters safely.
   */
  function wrapSetter(name) {

    const original = Element.prototype[name];

    if (!original) {
      throw new Error(
        `[DOM++ Stateful] Cannot wrap "${name}". Install dompp first.`
      );
    }

    // prevent double wrapping
    if (original.__dompp_wrapped) {
      return;
    }

    function wrapped(...args) {

      const first = args[0];

      // Fast path — normal usage
      if (typeof first !== "function") {
        return original.apply(this, args);
      }

      ensure(this);

      const runner = () => {

        const result = first({
          state: this.__dompp_state,
          el: this,
        });

        // normalize children
        if (name === "setChildren") {

          const children = Array.isArray(result)
            ? result
            : [result];

          original.call(this, ...children);
          return;
        }

        original.call(this, result);
      };

      bind(this, runner);

      return this;
    }

    // mark to prevent rewrap
    wrapped.__dompp_wrapped = true;

    Object.defineProperty(Element.prototype, name, {
      value: wrapped,
      writable: false,
      configurable: true,
    });
  }

  /**
   * Enable bindings for all setters.
   */
  DOMPP_SETTERS.forEach(wrapSetter);
}
