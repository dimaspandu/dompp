// =====================================
// DOM++ Browser Build
// Stateful Included By Default
// Vanilla-Friendly
// =====================================

(function () {

  // =====================================
  // Utilities
  // =====================================

  const isNodeLike = (value) =>
    typeof Node !== "undefined" &&
    value instanceof Node;

  const toCamelCase = (cssProp) =>
    cssProp.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());

  const readInlineStyles = (node) => {
    const styles = {};
    const styleDecl = node.style;

    for (let i = 0; i < styleDecl.length; i += 1) {
      const prop = styleDecl[i];

      styles[toCamelCase(prop)] =
        styleDecl.getPropertyValue(prop);
    }

    return styles;
  };

  const readAttributes = (node) => {
    const attributes = {};

    for (const attr of Array.from(node.attributes ?? [])) {
      attributes[attr.name] = attr.value;
    }

    return attributes;
  };

  const readEvents = (node) => ({
    ...(node.__dompp_handlers ?? {})
  });

  const toNodeList = (values) => {
    const out = [];

    const pushOne = (value) => {

      if (
        value == null ||
        value === false
      ) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach(pushOne);
        return;
      }

      if (isNodeLike(value)) {
        out.push(value);
        return;
      }

      out.push(
        document.createTextNode(String(value))
      );
    };

    values.forEach(pushOne);

    return out;
  };

  // =====================================
  // Context
  // =====================================

  function createDomppContext(node) {
    return {
      el: node,
      children: Array.from(node.children ?? []),
      childNodes: Array.from(node.childNodes ?? []),
      firstChild: node.firstChild ?? null,
      lastChild: node.lastChild ?? null
    };
  }

  function createDomppSetterContext(
    node,
    setterName
  ) {

    const dom = createDomppContext(node);

    if (setterName === "setText") {
      return {
        ...dom,
        text: node.textContent ?? ""
      };
    }

    if (setterName === "setStyles") {
      return {
        ...dom,
        styles: readInlineStyles(node)
      };
    }

    if (setterName === "setAttributes") {
      return {
        ...dom,
        attributes: readAttributes(node)
      };
    }

    if (setterName === "setEvents") {
      return {
        ...dom,
        events: readEvents(node)
      };
    }

    if (setterName === "setState") {
      return {
        ...dom,
        state: node.__dompp_state ?? {}
      };
    }

    return dom;
  }

  // =====================================
  // Internal State
  // =====================================

  function ensureState(el) {

    if (!el.__dompp_state) {

      el.__dompp_state = {};
      el.__dompp_bindings = new Set();
      el.__dompp_flushScheduled = false;
    }
  }

  function flushBindings(el) {

    el.__dompp_flushScheduled = false;

    if (!el.__dompp_bindings) {
      return;
    }

    const runners =
      Array.from(el.__dompp_bindings);

    for (const run of runners) {
      run();
    }
  }

  function scheduleFlush(el) {

    if (el.__dompp_flushScheduled) {
      return;
    }

    el.__dompp_flushScheduled = true;

    queueMicrotask(() => {
      flushBindings(el);
    });
  }

  // =====================================
  // Prototype Installer
  // =====================================

  function defineOn(proto, name, fn) {

    if (!proto[name]) {

      Object.defineProperty(proto, name, {
        value: fn,
        writable: false,
        configurable: true
      });
    }
  }

  // =====================================
  // Core Setters
  // =====================================

  function setText(text) {

    const nextText =
      typeof text === "function"
        ? text(
            createDomppSetterContext(
              this,
              "setText"
            )
          )
        : text;

    this.textContent = nextText;

    return this;
  }

  function setChildren(...children) {

    let nextChildren = children;

    if (
      children.length === 1 &&
      typeof children[0] === "function"
    ) {

      const resolved = children[0](
        createDomppSetterContext(
          this,
          "setChildren"
        )
      );

      nextChildren = Array.isArray(resolved)
        ? resolved
        : [resolved];
    }

    this.replaceChildren(
      ...toNodeList(nextChildren)
    );

    return this;
  }

  // =====================================
  // Install Base Setters
  // =====================================

  defineOn(
    Element.prototype,
    "setText",
    setText
  );

  defineOn(
    Element.prototype,
    "setChildren",
    setChildren
  );

  defineOn(
    Element.prototype,
    "setStyles",
    function (styles = {}) {

      const nextStyles =
        typeof styles === "function"
          ? styles(
              createDomppSetterContext(
                this,
                "setStyles"
              )
            )
          : styles;

      Object.assign(
        this.style,
        nextStyles ?? {}
      );

      return this;
    }
  );

  defineOn(
    Element.prototype,
    "setAttributes",
    function (attrs = {}) {

      const nextAttrs =
        typeof attrs === "function"
          ? attrs(
              createDomppSetterContext(
                this,
                "setAttributes"
              )
            )
          : attrs;

      for (const k in (nextAttrs ?? {})) {

        const v = nextAttrs[k];

        if (
          v === false ||
          v == null
        ) {

          this.removeAttribute(k);

        } else {

          this.setAttribute(
            k,
            v === true ? "" : v
          );
        }
      }

      return this;
    }
  );

  defineOn(
    Element.prototype,
    "setEvents",
    function (events = {}) {

      const nextEvents =
        typeof events === "function"
          ? events(
              createDomppSetterContext(
                this,
                "setEvents"
              )
            )
          : events;

      this.__dompp_handlers ??= {};

      for (const e in (nextEvents ?? {})) {

        if (this.__dompp_handlers[e]) {

          this.removeEventListener(
            e,
            this.__dompp_handlers[e]
          );
        }

        this.addEventListener(
          e,
          nextEvents[e]
        );

        this.__dompp_handlers[e] =
          nextEvents[e];
      }

      return this;
    }
  );

  defineOn(
    Element.prototype,
    "setState",
    function (next) {

      ensureState(this);

      let changed = false;

      if (typeof next === "function") {

        const prev = {
          ...this.__dompp_state
        };

        next({
          state: this.__dompp_state,
          setState: (n) => this.setState(n),
          ...createDomppContext(this)
        });

        for (const key in this.__dompp_state) {

          if (
            !Object.is(
              prev[key],
              this.__dompp_state[key]
            )
          ) {
            changed = true;
            break;
          }
        }

      } else {

        for (const key in next) {

          if (
            !Object.is(
              this.__dompp_state[key],
              next[key]
            )
          ) {
            changed = true;
            break;
          }
        }

        if (changed) {
          Object.assign(
            this.__dompp_state,
            next
          );
        }
      }

      if (changed) {
        scheduleFlush(this);
      }

      return this;
    }
  );

  // =====================================
  // Fragment Support
  // =====================================

  defineOn(
    DocumentFragment.prototype,
    "setText",
    setText
  );

  defineOn(
    DocumentFragment.prototype,
    "setChildren",
    setChildren
  );

  // =====================================
  // Reactive Wrappers
  // =====================================

  function wrapSetterForState(name) {

    const original =
      Element.prototype[name];

    if (
      !original ||
      original.__dompp_wrapped
    ) {
      return;
    }

    function wrapped(...args) {

      const first = args[0];

      // Fast path

      if (typeof first !== "function") {
        return original.apply(this, args);
      }

      ensureState(this);

      let previousResult;

      const runner = () => {

        const context = {
          state: this.__dompp_state,
          setState: (n) => this.setState(n),

          ...createDomppContext(this),

          ...createDomppSetterContext(
            this,
            name
          )
        };

        const nextResult =
          first(context);

        // Memoization

        if (
          Object.is(
            previousResult,
            nextResult
          )
        ) {
          return;
        }

        previousResult = nextResult;

        // Children normalization

        if (name === "setChildren") {

          const children =
            Array.isArray(nextResult)
              ? nextResult
              : [nextResult];

          original.call(
            this,
            ...children
          );

          return;
        }

        original.call(
          this,
          nextResult
        );
      };

      this.__dompp_bindings.add(
        runner
      );

      runner();

      return this;
    }

    wrapped.__dompp_wrapped = true;

    Object.defineProperty(
      Element.prototype,
      name,
      {
        value: wrapped,
        writable: false,
        configurable: true
      }
    );
  }

  [
    "setText",
    "setChildren",
    "setStyles",
    "setAttributes",
    "setEvents"
  ].forEach(wrapSetterForState);

  // =====================================
  // Global
  // =====================================

  window.DOMPP = {
    version: "1.0.0",
    createDomppContext,
    createDomppSetterContext
  };

})();