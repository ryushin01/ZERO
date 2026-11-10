import { cardFace, getCard } from "#entities/card/index.js";
import { h } from "#shared/lib/index.js";
import { openDialog } from "#shared/ui/index.js";

import "./deck-view.css";

/**
 * 카드 묶음(덱, 뽑을 카드, 버린 카드 등)을 대화상자로 보여 줍니다. 카드를 누르면 자세한 정보가 열립니다.
 * @param {{ title: string, cards: { uid: string, id: string, up: boolean }[], empty?: string, onSelect?: (cardId: string) => void }} options
 */
export function openDeckView({ title, cards, empty = "카드가 없습니다.", onSelect }) {
  const content = cards.length
    ? h(
        "ul",
        { class: "deck-view" },
        cards.map((instance) => {
          const card = getCard(instance.id, instance.up);
          return h("li", null, cardFace(card, { tag: "button", size: "s", attrs: { "data-card-id": instance.id } }));
        }),
      )
    : h("p", { class: "muted" }, empty);
  const dialog = openDialog({ title: `${title} ${cards.length}장`, content, wide: true });
  dialog.addEventListener("click", (event) => {
    const button = /** @type {HTMLElement} */ (event.target).closest("[data-card-id]");
    if (button && onSelect) onSelect(/** @type {string} */ (button.getAttribute("data-card-id")));
  });
  return dialog;
}
