/*
 * ComponentBuilder owns the render function and current virtual tree.
 * render() returns the initial ElementBuilder; the parent materializes it.
 * rerender() builds and diffs the next tree while keeping matching DOM nodes.
 */
function ComponentBuilder(builder) {
  let component = null;

  const instance = {
    render() {
      if (!component) {
        component = builder((callback) => instance.rerender(callback));
      }

      // why do we need to return the node?! It's supposed to be always return the ElementBuidler
      return component;
    },

    rerender(callback) {
      // Apply an optional state mutation before constructing the next tree.
      if (typeof callback === "function") {
        callback();
      }

      if (!component) {
        return instance;
      }

      const next = builder((nextCallback) => instance.rerender(nextCallback));
      if (component.node && component.node === next.node) {
        // elementBuilder already synchronized this existing root in place.
        component.struct = next.struct;
        component._attachedEvents = next._attachedEvents;
        return instance;
      }

      if (component.struct.tag === next.struct.tag) {
        component._patchFrom(next);
      } else {
        const nextNode = next.toNode();
        if (component.node?.parentNode) {
          component.node.parentNode.replaceChild(nextNode, component.node);
        }
        component.node = nextNode;
        component.struct = next.struct;
      }

      return instance;
    },
  };

  return Object.freeze(instance);
}

// Public helper for creating a stateful component instance.
function componentBuilder(builder) {
  return new ComponentBuilder(builder);
}

export { ComponentBuilder, componentBuilder };
