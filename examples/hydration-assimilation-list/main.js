import "../../src/index.js";
import { installDomppHydration } from "../../src/addons/hydration.addon.js";

installDomppHydration();

const catalog = document.getElementById("catalog");
const selected = new Set();

catalog.hydrateChildren(({ children }) => {
  const [, filterInput, listEl, summaryEl] = children;
  const rows = Array.from(listEl.children);

  const updateSummary = () => {
    summaryEl.setText(`Selected: ${selected.size}`);
  };

  const applyFilter = () => {
    const keyword = String(filterInput.value ?? "").trim().toLowerCase();

    rows.forEach((row) => {
      const name = String(row.dataset.name ?? "").toLowerCase();
      row.setStyles({
        display: name.includes(keyword) ? "flex" : "none"
      });
    });
  };

  rows.forEach((row) => {
    const productName = row.dataset.name ?? "";
    const actionButton = row.querySelector("button");

    if (!actionButton) {
      return;
    }

    const renderRow = () => {
      const isSelected = selected.has(productName);

      row.setAttributes({
        "data-selected": isSelected
      });

      actionButton.setText(isSelected ? "Unselect" : "Select");
    };

    actionButton.setEvents({
      click() {
        if (selected.has(productName)) {
          selected.delete(productName);
        } else {
          selected.add(productName);
        }

        renderRow();
        updateSummary();
      }
    });

    renderRow();
  });

  filterInput.setEvents({
    input() {
      applyFilter();
    }
  });

  applyFilter();
  updateSummary();

  return children;
});

