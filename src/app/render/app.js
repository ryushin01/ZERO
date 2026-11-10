import { sortDeck } from "#features/run/index.js";
import { announce, morphChildren } from "#shared/lib/index.js";
import { closeDialogs } from "#shared/ui/index.js";
import { openCardDetail } from "#widgets/card-detail/index.js";
import { openDeckView } from "#widgets/deck-view/index.js";
import { siteHeader } from "#widgets/site-header/index.js";

import { codexPage } from "#pages/codex/index.js";
import { guidePage } from "#pages/guide/index.js";
import { newRunPage } from "#pages/new-run/index.js";
import { notFoundPage } from "#pages/not-found/index.js";
import { runPage } from "#pages/run/index.js";
import { titlePage } from "#pages/title/index.js";

import { createStore } from "../model/store.js";
import { navigate, parseRoute } from "../routing/router.js";

/**
 * 화면(page) 규약
 * @typedef {ReturnType<typeof makeContext>} PageContext
 * @typedef {{
 *   title: (ctx: PageContext) => string,
 *   view: (ctx: PageContext) => Node | Node[],
 *   surface?: (ctx: PageContext) => "dark" | "light",
 *   screen?: (ctx: PageContext) => string,
 *   context?: (ctx: PageContext) => string,
 *   redirect?: (ctx: PageContext) => string | null,
 *   actions?: Record<string, (ctx: PageContext, el: HTMLElement, event: Event) => void>,
 *   inputs?: Record<string, (ctx: PageContext, el: HTMLInputElement, event: Event) => void>,
 *   keydown?: (ctx: PageContext, event: KeyboardEvent) => void,
 *   mount?: (ctx: PageContext, main: HTMLElement) => (() => void) | void,
 *   afterRender?: (ctx: PageContext, main: HTMLElement) => void,
 * }} Page
 */

/** @type {Record<string, Page>} */
const PAGES = {
  title: titlePage,
  new: newRunPage,
  run: runPage,
  codex: codexPage,
  guide: guidePage,
  "not-found": notFoundPage,
};

/** @param {ReturnType<typeof createStore>} store @param {{ name: string, params: string[] }} route @param {string} uiKey */
function makeContext(store, route, uiKey) {
  const { state } = store;
  return {
    route,
    run: state.run,
    settings: state.settings,
    records: state.records,
    ui: state.ui[uiKey] ?? {},
    /** @param {Record<string, any>} patch */
    setUi: (patch) => store.setUi(uiKey, patch),
    setRun: store.setRun,
    setSettings: store.setSettings,
    resetRecords: store.resetRecords,
    navigate,
    announce,
    /** @param {string} cardId */
    openCard: (cardId) => openCardDetail(cardId),
    /** @param {string} title @param {{ uid: string, id: string, up: boolean }[]} cards @param {string} [empty] */
    openDeck: (title, cards, empty) => openDeckView({ title, cards, empty, onSelect: openCardDetail }),
  };
}

/** @param {{ header: HTMLElement, main: HTMLElement }} roots */
export function createApp({ header, main }) {
  const store = createStore();
  let lastScreen = "";
  /** @type {(() => void) | void} */
  let cleanup;
  /** @type {{ page: Page, ctx: PageContext } | null} */
  let current = null;

  function resolve() {
    const route = parseRoute();
    const page = PAGES[route.name] ?? notFoundPage;
    const probe = makeContext(store, route, route.name);
    const screen = page.screen ? page.screen(probe) : [route.name, ...route.params].join("/");
    return { route, page, screen, ctx: makeContext(store, route, screen) };
  }

  function render() {
    const { page, screen, ctx } = resolve();
    const redirect = page.redirect?.(ctx);
    if (redirect) {
      window.location.replace(redirect);
      return;
    }
    current = { page, ctx };

    document.body.dataset.surface = page.surface?.(ctx) ?? "dark";
    document.body.dataset.motion = ctx.settings.motion;
    document.title = `${page.title(ctx)} — ZERO`;

    const fragment = document.createDocumentFragment();
    fragment.append(
      ...siteHeader({
        route: ctx.route.name,
        context: page.context?.(ctx) ?? "",
        deckCount: ctx.run && ctx.route.name === "run" ? ctx.run.deck.length : null,
      }),
    );
    morphChildren(header, fragment);

    const view = page.view(ctx);
    const nodes = Array.isArray(view) ? view : [view];
    if (screen !== lastScreen) {
      const first = lastScreen === "";
      lastScreen = screen;
      if (typeof cleanup === "function") cleanup();
      closeDialogs();
      main.replaceChildren(...nodes);
      window.scrollTo({ top: 0 });
      // 화면이 바뀌면 제목으로 초점을 옮겨 화면 낭독기가 새 화면을 알게 합니다. (첫 진입은 제외)
      if (!first) {
        const heading = main.querySelector("h1");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
        } else main.focus({ preventScroll: true });
      }
      cleanup = page.mount?.(ctx, main);
    } else {
      const next = document.createDocumentFragment();
      next.append(...nodes);
      morphChildren(main, next);
    }
    page.afterRender?.(ctx, main);
  }

  /** @type {Record<string, (ctx: PageContext) => void>} */
  const globalActions = {
    "open-deck": (ctx) => {
      if (ctx.run) ctx.openDeck("내 덱", sortDeck(ctx.run.deck));
    },
  };

  document.addEventListener("click", (event) => {
    if (!current) return;
    const el = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (event.target).closest?.("[data-action]"));
    if (!el || el.closest("dialog")) return;
    const name = /** @type {string} */ (el.dataset.action);
    const handler = current.page.actions?.[name] ?? globalActions[name];
    if (!handler) return;
    event.preventDefault();
    handler(current.ctx, el, event);
  });

  const onInput = (event) => {
    if (!current) return;
    const el = /** @type {HTMLInputElement} */ (event.target);
    const name = el.dataset?.input;
    if (name) current.page.inputs?.[name]?.(current.ctx, el, event);
  };
  document.addEventListener("input", onInput);
  document.addEventListener("change", onInput);

  document.addEventListener("keydown", (event) => {
    if (!current || document.querySelector("dialog[open]")) return;
    current.page.keydown?.(current.ctx, event);
  });

  store.subscribe(render);
  window.addEventListener("hashchange", render);
  render();
  return store;
}
