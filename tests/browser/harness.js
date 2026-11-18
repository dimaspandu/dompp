(function () {
  const results = [];
  let chain = Promise.resolve();

  function record(ok, name, detail) {
    results.push({ ok, name, detail: detail || "" });
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message || "Assertion failed");
  }

  function equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error((message ? message + ": " : "") + "expected " + String(expected) + " but got " + String(actual));
    }
  }

  function notEqual(actual, expected, message) {
    if (actual === expected) {
      throw new Error((message ? message + ": " : "") + "expected values to differ, both " + String(actual));
    }
  }

  function deepEqual(actual, expected, message) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) {
      throw new Error((message ? message + ": " : "") + "expected " + e + " but got " + a);
    }
  }

  function ok(value, message) {
    assert(!!value, message || "Expected truthy value");
  }

  function throws(fn, message) {
    let threw = false;
    try {
      fn();
    } catch (_) {
      threw = true;
    }
    if (!threw) throw new Error(message || "Expected function to throw");
  }

  function test(name, fn) {
    const run = chain.then(async () => {
      try {
        await fn();
        record(true, name);
      } catch (err) {
        record(false, name, err && (err.stack || err.message || String(err)));
      }
    });
    // keep chain alive even if a test throws unexpectedly outside handling
    chain = run.catch(() => {});
    return run;
  }

  async function done() {
    await chain;
    const summary = {
      total: results.length,
      passed: results.filter(r => r.ok).length,
      failed: results.filter(r => !r.ok).length,
      results,
    };
    window.__TEST_RESULTS__ = summary;
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "dompp-test-results", summary }, "*");
      }
    } catch (_) {}
    if (document && document.body) {
      let pre = document.getElementById("test-results");
      if (!pre) {
        pre = document.createElement("pre");
        pre.id = "test-results";
        document.body.appendChild(pre);
      }
      pre.textContent = JSON.stringify(summary, null, 2);
    }
    document.title = (summary.failed ? "FAIL " : "PASS ") + summary.passed + "/" + summary.total;
    return summary;
  }

  window.harness = { test, assert, equal, notEqual, deepEqual, ok, throws, done, record };
})();
