import { el } from "../utils/dompp.js";

export function createToast() {
  const toast = el("div")
    .setAttributes({ class: "toast", hidden: true })
    .setState({ message: "", visible: false });

  toast.setChildren(({ state }) => {
    toast.setAttributes({ hidden: !state.visible });

    return [
      el("strong").setAttributes({ id: "toast-title" }).setText("Saved"),
      el("p").setAttributes({ id: "toast-message" }).setText(state.message || ""),
      { matchById: true }
    ];
  });

  return toast;
}
