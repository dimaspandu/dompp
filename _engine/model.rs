//! DOM++ JavaScript API data models.
//!
//! This module describes the input and descriptor shapes used by the DOM++
//! JavaScript APIs. Runtime-specific V8 handles and DOM node references are
//! represented by stable IDs so the models remain independent from the runtime.

use std::collections::HashMap;

/// Stable identifier for a node registered by the browser runtime.
pub type NodeId = u32;

/// Stable identifier for a JavaScript function retained by the runtime.
pub type FunctionId = u32;

/// A value that can cross the JavaScript-to-Rust model boundary.
#[derive(Debug, Clone, PartialEq)]
pub enum DomValue {
    Null,
    Boolean(bool),
    Number(f64),
    String(String),
    Object(HashMap<String, DomValue>),
    Array(Vec<DomValue>),
    Node(NodeId),
    Function(FunctionId),
}

/// A key used by child reconciliation.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum ElementKey {
    String(String),
    Number(i64),
}

/// Properties extracted from the `props` argument of `document.createElement`.
///
/// `class` / `className`, `style` / `styles`, and `key` are normalized into
/// their dedicated fields. Event props are stored separately from attributes.
#[derive(Debug, Clone, Default)]
pub struct ElementProps {
    pub attributes: HashMap<String, DomValue>,
    pub styles: HashMap<String, DomValue>,
    pub events: HashMap<String, FunctionId>,
    pub key: Option<ElementKey>,
}

/// The source passed as the first argument to `document.createElement`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ElementSource {
    /// An HTML or SVG tag name, such as `div` or `svg`.
    Tag(String),

    /// A registered JavaScript component function.
    Component(FunctionId),

    /// An existing DOM element to adopt.
    ExistingNode(NodeId),
}

/// A normalized child value stored in an element descriptor.
///
/// Nested arrays are flattened before reconciliation. `Null` and `Boolean`
/// are included here to describe raw input; normalization removes them.
#[derive(Debug, Clone, PartialEq)]
pub enum ChildDescriptor {
    Element(Box<ElementDescriptor>),
    ExistingNode(NodeId),
    Text(String),
    Number(f64),
    Array(Vec<ChildDescriptor>),
    Null,
    Boolean(bool),
}

/// The virtual descriptor maintained by the DOM++ element builder.
#[derive(Debug, Clone, Default)]
pub struct ElementDescriptor {
    pub tag: String,
    pub key: Option<ElementKey>,
    pub attributes: HashMap<String, DomValue>,
    pub styles: HashMap<String, DomValue>,
    pub events: HashMap<String, FunctionId>,
    pub children: Vec<ChildDescriptor>,
    pub adopted_node: Option<NodeId>,
}

/// Arguments accepted by the DOM++ `document.createElement` API.
#[derive(Debug, Clone)]
pub struct CreateElementInput {
    pub source: ElementSource,
    pub props: Option<ElementProps>,
    pub children: Vec<ChildDescriptor>,
}

/// Arguments accepted by `document.createComponent`.
///
/// The builder is a JavaScript function retained by the runtime. Its rendered
/// result can be either one element descriptor or a list of child descriptors.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CreateComponentInput {
    pub builder: FunctionId,
}

/// The output shape of a component render.
#[derive(Debug, Clone, PartialEq)]
pub enum ComponentRenderOutput {
    Element(ElementDescriptor),
    Fragment(Vec<ChildDescriptor>),
}

/// A component instance descriptor retained between render operations.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ComponentDescriptor {
    pub builder: FunctionId,
    pub is_array_component: bool,
    pub root_node: Option<NodeId>,
}

/// A fragment is represented by a flat list of children in the supplied
/// JavaScript implementation, rather than a materialized native fragment node.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct FragmentDescriptor {
    pub children: Vec<ChildDescriptor>,
}

/// Arguments accepted by `document.createDocumentFragment`.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct CreateDocumentFragmentInput {
    pub children: Vec<ChildDescriptor>,
}

/// Arguments accepted by `document.hydrateElement`.
///
/// The target must refer to an existing element node. Described children are
/// attached to the existing server-rendered children; unspecified children are
/// retained.
#[derive(Debug, Clone, PartialEq)]
pub struct HydrateElementInput {
    pub target: NodeId,
    pub props: Option<ElementProps>,
    pub children: Vec<ChildDescriptor>,
}

/// The four public DOM++ document APIs represented by this model.
#[derive(Debug, Clone, PartialEq)]
pub enum DocumentApiInput {
    CreateElement(CreateElementInput),
    CreateComponent(CreateComponentInput),
    CreateDocumentFragment(CreateDocumentFragmentInput),
    HydrateElement(HydrateElementInput),
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn element_descriptor_can_hold_attributes_styles_events_and_children() {
        let mut descriptor = ElementDescriptor {
            tag: "button".to_string(),
            ..ElementDescriptor::default()
        };

        descriptor.attributes.insert(
            "type".to_string(),
            DomValue::String("button".to_string()),
        );
        descriptor.styles.insert(
            "backgroundColor".to_string(),
            DomValue::String("#222".to_string()),
        );
        descriptor.events.insert("click".to_string(), 7);
        descriptor
            .children
            .push(ChildDescriptor::Text("Save".to_string()));

        assert_eq!(descriptor.tag, "button");
        assert_eq!(descriptor.events.get("click"), Some(&7));
        assert_eq!(descriptor.children.len(), 1);
    }

    #[test]
    fn fragment_model_holds_children_without_a_native_node_id() {
        let fragment = FragmentDescriptor {
            children: vec![
                ChildDescriptor::Text("Hello".to_string()),
                ChildDescriptor::ExistingNode(12),
            ],
        };

        assert_eq!(fragment.children.len(), 2);
    }

    #[test]
    fn hydration_model_requires_a_target_node_id() {
        let input = HydrateElementInput {
            target: 42,
            props: None,
            children: vec![ChildDescriptor::Text("Enhanced".to_string())],
        };

        assert_eq!(input.target, 42);
    }
}
