import { h } from "../lib/dom.js";

import "./dialog.css";

/**
 * 네이티브 <dialog>로 모달을 엽니다. 닫으면 연 요소로 초점을 돌려주고 DOM에서 지웁니다.
 * @param {{ title: string, content: Node | Node[], wide?: boolean }} options
 * @returns {HTMLDialogElement}
 */
export function openDialog({ title, content, wide = false }) {
  const opener = /** @type {HTMLElement | null} */ (document.activeElement);
  const titleId = `dialog-title-${Math.random().toString(36).slice(2, 8)}`;
  const dialog = /** @type {HTMLDialogElement} */ (
    h(
      "dialog",
      { class: ["dialog", wide && "dialog--wide"], "aria-labelledby": titleId, "data-surface": "light" },
      h(
        "div",
        { class: "dialog__head" },
        h("h2", { id: titleId, class: "dialog__title" }, title),
        h("button", { type: "button", class: "button dialog__close", "data-dialog-close": "" }, "닫기"),
      ),
      h("div", { class: "dialog__body" }, content),
    )
  );
  dialog.addEventListener("click", (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    // 바깥 배경을 누르거나 닫기 버튼을 누르면 닫습니다.
    if (target === dialog || target.closest("[data-dialog-close]")) dialog.close();
  });
  dialog.addEventListener("close", () => {
    dialog.remove();
    if (opener?.isConnected) opener.focus();
  });
  document.body.append(dialog);
  dialog.showModal();
  return dialog;
}

/** 열려 있는 대화상자를 모두 닫습니다 (화면을 옮길 때) */
export function closeDialogs() {
  for (const dialog of document.querySelectorAll("dialog.dialog")) {
    /** @type {HTMLDialogElement} */ (dialog).close();
  }
}
