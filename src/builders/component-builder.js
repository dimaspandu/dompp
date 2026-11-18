/**
 * Foundation: ComponentBuilder and componentBuilder factory.
 * Stateful component render/rerender primitives.
 */

export function createComponentBuilder({
  ElementBuilder,
  reconcileSlot,
  attachedEventsByNode,
}) {
/*
* ComponentBuilder owns the render function and current virtual tree.
* It renders immediately and returns the rendered result directly:
* an ElementBuilder for element-producing components, or a reconciled child
* array for array-producing components. The returned result is extended with
* .rerender(callback?) to patch in place and enable cross-component updates.
*/
function ComponentBuilder(builder) {
  let component = null;
  let isArrayComponent = false;
  let nodes = [];

  const materializeArray = (items) => {
    const nextItems = (Array.isArray(items) ? items : [items]).flat(Infinity);
    const oldNodes = nodes.slice();
    const nextNodes = [];

    let parent = null;
    let anchorAfter = null;
    for (let i = oldNodes.length - 1; i >= 0; i--) {
      const oldNode = oldNodes[i];
      if (oldNode && oldNode.parentNode) {
        parent = oldNode.parentNode;
        anchorAfter = oldNode.nextSibling;
        break;
      }
    }

    for (let i = 0; i < nextItems.length; i++) {
      const raw = nextItems[i];
      const nextChild =
        raw == null || typeof raw === "boolean" ? null : raw;
      const prev = Array.isArray(component) ? component[i] : undefined;
      const prevNode = oldNodes[i] || null;

      if (nextChild == null) {
        if (prevNode && prevNode.parentNode) {
          prevNode.parentNode.removeChild(prevNode);
        }
        nextItems[i] = null;
        nextNodes[i] = null;
        continue;
      }

      const slot = reconcileSlot(prev, nextChild, prevNode);
      nextItems[i] = slot.child;
      nextNodes[i] = slot.node;
    }

    for (let i = nextItems.length; i < oldNodes.length; i++) {
      const oldNode = oldNodes[i];
      if (oldNode && oldNode.parentNode) {
        oldNode.parentNode.removeChild(oldNode);
      }
    }

    if (parent) {
      let anchor = anchorAfter;
      for (let i = nextNodes.length - 1; i >= 0; i--) {
        const node = nextNodes[i];
        if (!node) {
          continue;
        }
        if (node.parentNode !== parent || node.nextSibling !== anchor) {
          parent.insertBefore(node, anchor);
        }
        anchor = node;
      }
    }

    // Keep a stable array identity so embedded references stay valid.
    if (Array.isArray(component)) {
      component.length = 0;
      component.push(...nextItems);
    } else {
      component = nextItems;
    }
    nodes = nextNodes;
    return component;
  };

  const instance = Object.freeze({
    render() {
      if (!component) {
        const result = builder((callback) => instance.rerender(callback));
        if (Array.isArray(result)) {
          isArrayComponent = true;
          component = [];
          materializeArray(result);
        } else {
          component = result;
        }
      }

      return component;
    },

    rerender(callback) {
      // Apply an optional state mutation before constructing the next tree.
      if (typeof callback === "function") {
        callback();
      }

      if (!component) {
        return component;
      }

      const next = builder((nextCallback) => instance.rerender(nextCallback));

      if (isArrayComponent || Array.isArray(next) || Array.isArray(component)) {
        isArrayComponent = true;
        materializeArray(next);
        return component;
      }

      if (component.node && component.node === next.node) {
        // elementBuilder already synchronized this existing root in place.
        component.struct = next.struct;
        component._attachedEvents = next._attachedEvents;
        return component;
      }

      if (component.struct.tag === next.struct.tag) {
        component._patchFrom(next);
      } else {
        const nextNode = next.toNode();
        if (component.node?.parentNode) {
          component.node.parentNode.replaceChild(nextNode, component.node);
        }
        // Keep the returned element identity stable so external references and
        // any attached .rerender() continue to target the live component root.
        component.node = nextNode;
        component.struct = next.struct;
        component._attachedEvents = next._attachedEvents || {};
        attachedEventsByNode.set(component.node, component._attachedEvents);
      }

      return component;
    },
  });

  const renderedElement = instance.render();

  Object.defineProperty(renderedElement, "rerender", {
    value: instance.rerender,
    configurable: true,
    writable: true,
  });

  return renderedElement;
}

// Public helper for creating a stateful component instance. (use for later as a library)
function componentBuilder(builder) {
  return new ComponentBuilder(builder);
}

  return {
    ComponentBuilder,
    componentBuilder,
  };
}
