import { el } from "../utils/dompp.js";

export function createFilters({ categories, statusOptions, onSearch, onCategory, onStatus }) {
  const filters = el("section").setAttributes({ class: "filters" });
  const searchInput = el("input").setAttributes({
    type: "search",
    placeholder: "Example: clean water, micro business, clinic...",
  });
  const categorySelect = el("select");
  const statusSelect = el("select");

  categorySelect.setChildren(
    ...categories.map((category) =>
      el("option").setAttributes({
        value: category,
      }).setText(category === "all" ? "All categories" : category)
    )
  );

  statusSelect.setChildren(
    ...statusOptions.map((option) =>
      el("option").setAttributes({ value: option.value }).setText(option.label)
    )
  );

  searchInput.setEvents({ input: (event) => onSearch(event.target.value) });
  categorySelect.setEvents({ change: (event) => onCategory(event.target.value) });
  statusSelect.setEvents({ change: (event) => onStatus(event.target.value) });

  filters.setChildren(
    el("div").setChildren(
      el("label").setText("Search campaigns"),
      searchInput
    ),
    el("div").setChildren(
      el("label").setText("Category"),
      categorySelect
    ),
    el("div").setChildren(
      el("label").setText("Funding status"),
      statusSelect
    )
  );

  return {
    filters,
    searchInput,
    categorySelect,
    statusSelect,
  };
}
