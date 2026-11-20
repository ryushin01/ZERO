import { afterLoadIdle, announce, morphChildren } from "#shared/lib/index.js";
import { closeDialogs } from "#shared/ui/index.js";
import { siteHeader } from "#widgets/site-header/index.js";

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
 *   stableUi?: boolean,
 * }} Page
 * stableUi: 화면(screen)이 바뀌어도 같은 ui 상태를 씁니다. 화면 이름을 ui 상태에서 정하는 page(2인 듀얼)에 씁니다.
 */

/**
 * 화면별 코드 분할: 처음 화면만 첫 화면 묶음에 넣고, 나머지 화면은 그 화면에 처음 들어갈 때 받습니다.
 * 판 진행(전투 화면 등)·도감·도움말·듀얼은 각자 따로 받는 묶음이 됩니다.
 * @type {Record<string, () => Promise<Page>>}
 */
const PAGE_LOADERS = {
  new: () => import("#pages/new-run/index.js").then((m) => m.newRunPage),
  run: () => import("#pages/run/index.js").then((m) => m.runPage),
  codex: () => import("#pages/codex/index.js").then((m) => m.codexPage),
  guide: () => import("#pages/guide/index.js").then((m) => m.guidePage),
  duel: () => import("#pages/duel/index.js").then((m) => m.duelPage),
  "not-found": () => import("#pages/not-found/index.js").then((m) => m.notFoundPage),
};

/** 받아 둔 화면 @type {Record<string, Page>} */
const PAGES = { title: titlePage };

/** 카드 상세·덱 보기는 처음 열 때 받습니다. */
const loadCardDetail = () => import("#widgets/card-detail/index.js");

/** @param {string} cardId */
const openCard = (cardId) => void loadCardDetail().then(({ openCardDetail }) => openCardDetail(cardId));

/** @param {string} title @param {{ uid: string, id: string, up: boolean }[]} cards @param {string} [empty] */
const openDeck = (title, cards, empty) =>
  void Promise.all([import("#widgets/deck-view/index.js"), loadCardDetail()]).then(
    ([{ openDeckView }, { openCardDetail }]) => openDeckView({ title, cards, empty, onSelect: openCardDetail }),
  );

/**
 * 따로 받는 묶음을 받지 못하면(새 배포로 옛 묶음이 사라진 탭 등) 한 번만 새로 고칩니다.
 * 같은 탭에서 연달아 실패하면 새로 고치지 않고 알립니다.
 */
const RELOADED = "zero:chunk-reload";
function recoverFromChunkError() {
  if (sessionStorage.getItem(RELOADED)) {
    announce("화면을 받지 못했습니다. 연결을 확인하고 새로 고쳐 주세요.");
    return;
  }
  sessionStorage.setItem(RELOADED, "1");
  window.location.reload();
}
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  recoverFromChunkError();
});

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
    /** 여러 변경을 묶어 한 번만 다시 그립니다. @param {() => void} fn */
    batch: store.batch,
    setSettings: store.setSettings,
    setRecords: store.setRecords,
    resetRecords: store.resetRecords,
    navigate,
    announce,
    openCard,
    openDeck,
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

  /** 받는 중인 화면 @type {Record<string, Promise<void>>} */
  const loading = {};

  /** @param {string} name */
  function loadPage(name) {
    loading[name] ??= PAGE_LOADERS[name]()
      .then((page) => {
        PAGES[name] = page;
        sessionStorage.removeItem(RELOADED);
        render();
      })
      .catch(() => {
        delete loading[name];
        recoverFromChunkError();
      });
  }

  /** 지금 주소의 화면. 아직 받지 않은 화면이면 받기 시작하고 null을 돌려줍니다. */
  function resolve() {
    const route = parseRoute();
    const name = route.name in PAGES || route.name in PAGE_LOADERS ? route.name : "not-found";
    const page = PAGES[name];
    if (!page) {
      loadPage(name);
      return null;
    }
    const probe = makeContext(store, route, route.name);
    const screen = page.screen ? page.screen(probe) : [route.name, ...route.params].join("/");
    return { route, page, screen, ctx: makeContext(store, route, page.stableUi ? route.name : screen) };
  }

  function render() {
    const resolved = resolve();
    // 화면을 받는 동안에는 지금 화면을 그대로 두고(첫 진입이면 빈 본문), 받은 뒤 다시 그립니다.
    if (resolved === null) main.setAttribute("aria-busy", "true");
    else main.removeAttribute("aria-busy");
    if (!resolved) return;
    const { page, screen, ctx } = resolved;
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
      // 판의 화면(지도·전투·보상 등)은 떠나면 다시 쓰지 않으므로 그 임시 상태를 지웁니다. 도감 거르기처럼 주소별 상태는 남깁니다.
      if (lastScreen.startsWith("run:")) store.dropUi(lastScreen);
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
      const { run } = ctx;
      if (run) void import("#features/run/index.js").then(({ sortDeck }) => ctx.openDeck("내 덱", sortDeck(run.deck)));
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
  // 자주 가는 화면(새 기록·판·도감)은 첫 화면 뒤 한가할 때 미리 받아 두어, 처음 들어갈 때도 바로 그립니다.
  afterLoadIdle(
    () => {
      for (const name of ["new", "run", "codex"]) void PAGE_LOADERS[name]().catch(() => undefined);
    },
    { delay: 3000 },
  );
  return store;
}
