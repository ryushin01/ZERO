import { armamentIllustration, describeArmament, getArmament } from "#entities/armament/index.js";
import { battlefieldCard } from "#entities/battlefield/index.js";
import { getCard } from "#entities/card/index.js";
import { getPantheon } from "#entities/figure/index.js";
import { describePerk, factionStatus, TIERS } from "#entities/faction/index.js";
import { ACT_INFO, LANES, NODE_INFO, reachableNodes } from "#entities/map/index.js";
import { getRelic } from "#entities/relic/index.js";
import { currentField, enterNode, guideName } from "#features/run/index.js";
import { h } from "#shared/lib/index.js";

import "./map-view.css";

/** @typedef {import("#app/render/app.js").PageContext} Ctx */

const MARK = { battle: "戰", elite: "勇", event: "?", rest: "休", shrine: "祠", rift: "裂", boss: "零" };

/** 다음 층으로 이어지는 선 @param {import("#entities/map/index.js").ActMap} map @param {number} row @param {Set<string>} path */
function links(map, row, path) {
  const nodes = map.rows[row];
  const next = map.rows[row + 1];
  if (!next) return null;
  const x = (lane) => ((lane + 0.5) / LANES) * 300;
  const lines = [];
  for (const node of nodes) {
    for (const lane of node.next) {
      const target = next.find((n) => n.lane === lane);
      const walked = target && path.has(node.id) && path.has(target.id);
      lines.push(
        `<line x1="${x(node.lane)}" y1="0" x2="${x(lane)}" y2="100" class="${walked ? "walked" : ""}" vector-effect="non-scaling-stroke"/>`,
      );
    }
  }
  return h("span", {
    class: "floor__links",
    "aria-hidden": "true",
    html: `<svg viewBox="0 0 300 100" preserveAspectRatio="none">${lines.join("")}</svg>`,
  });
}

/** 덱의 세력: 같은 계열 3장이면 1단계, 5장이면 2단계 @param {NonNullable<Ctx["run"]>} run */
function factionList(run) {
  const status = factionStatus(run.deck.map((c) => getCard(c.id).pantheonSlug)).slice(0, 4);
  if (!status.length)
    return h("p", { class: "muted map__none" }, "같은 신화 계열의 신을 3장 모으면 세력의 힘이 깨어납니다.");
  return h(
    "ul",
    { class: "map__factions" },
    status.map((f) =>
      h(
        "li",
        { "data-key": f.pantheon, class: f.tier ? "is-active" : null },
        h("strong", null, `${f.name} · ${f.title}`),
        h(
          "span",
          null,
          f.tier
            ? `${f.tier}단계: ${describePerk(f.perk, f.values[f.tier - 1])}`
            : `${f.count}/${TIERS[0]}장 — ${describePerk(f.perk, f.values[0])}`,
        ),
      ),
    ),
  );
}

/** @param {Ctx} ctx */
export function mapView(ctx) {
  const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
  const act = ACT_INFO[run.act];
  const reachable = new Set(reachableNodes(run.map, run.position).map((n) => n.id));
  const path = new Set(run.path);
  const currentId = run.path[run.path.length - 1];
  const field = currentField(run);

  return h(
    "section",
    { class: "map" },
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "display", lang: "en" }, act.en),
      h("h1", null, `${run.act}장 · ${act.title}`),
      h("p", null, "갈 수 있는 칸을 골라 나아가세요. 마지막 칸에서 이 장의 보스가 기다립니다."),
    ),
    h(
      "section",
      { class: "map__field", "aria-label": "이 장의 전장" },
      battlefieldCard(field, {
        heading: "h2",
        compact: true,
        pantheonNames: field.pantheons.map((slug) => getPantheon(slug)?.name).filter((name) => Boolean(name)),
      }),
    ),
    run.notice ? h("p", { class: "notice" }, run.notice) : null,
    h(
      "div",
      { class: "map__layout" },
      h(
        "aside",
        { class: "map__side", "aria-labelledby": "map-status" },
        h("h2", { id: "map-status", class: "label muted" }, "사서의 상태"),
        h(
          "dl",
          { class: "map__stats" },
          h("dt", null, "체력"),
          h("dd", null, `${run.hp} / ${run.maxHp}`),
          h("dt", null, "덱"),
          h(
            "dd",
            null,
            h(
              "button",
              { type: "button", class: "map__deck", "data-action": "open-deck" },
              `${run.deck.length}장 보기`,
            ),
          ),
          h("dt", null, "길잡이"),
          h("dd", null, guideName(run)),
          h("dt", null, "지나온 칸"),
          h("dd", null, `${run.stats.floors}칸`),
        ),
        h("h2", { class: "label muted" }, `무구 ${run.armaments.length}`),
        h(
          "ul",
          { class: "map__arms" },
          run.armaments.map((id) => {
            const arm = getArmament(id);
            return h(
              "li",
              { "data-key": id },
              h("img", { src: armamentIllustration(arm), alt: "", width: 200, height: 260 }),
              h(
                "span",
                null,
                h("strong", null, arm.name),
                h("span", null, `에너지 ${arm.cost} · ${describeArmament(arm).join(", ")}`),
              ),
            );
          }),
        ),
        h("h2", { class: "label muted" }, "세력"),
        factionList(run),
        h("h2", { class: "label muted" }, `유물 ${run.relics.length}`),
        run.relics.length
          ? h(
              "ul",
              { class: "map__relics" },
              run.relics.map((id) => {
                const relic = getRelic(id);
                return h("li", { "data-key": id }, h("strong", null, relic.name), h("span", null, relic.text));
              }),
            )
          : h("p", { class: "muted map__none" }, "정예와 보스를 쓰러뜨리면 신화 속 보물을 얻습니다."),
      ),
      h(
        "ol",
        { class: "map__floors", "aria-label": `${run.act}장 지도` },
        run.map.rows.map((nodes, row) =>
          h(
            "li",
            { class: "floor", "data-key": `row-${row}` },
            h("h2", { class: "floor__label label muted" }, row === run.map.rows.length - 1 ? "보스" : `${row + 1}층`),
            h(
              "ul",
              { class: "floor__nodes", style: { "--lanes": LANES } },
              nodes.map((node) => {
                const info = NODE_INFO[node.type];
                const state =
                  node.id === currentId
                    ? "current"
                    : path.has(node.id)
                      ? "visited"
                      : reachable.has(node.id)
                        ? "open"
                        : "closed";
                const content = [
                  h("span", { class: "node__mark", "aria-hidden": "true" }, MARK[node.type]),
                  h("span", { class: "node__label" }, info.label),
                ];
                const status = {
                  current: " (지금 있는 곳)",
                  visited: " (지나온 곳)",
                  closed: " (지금은 갈 수 없음)",
                  open: "",
                }[state];
                return h(
                  "li",
                  {
                    class: ["node", `node--${node.type}`, `node--${state}`],
                    style: { "--lane": node.lane },
                    "data-key": node.id,
                  },
                  state === "open"
                    ? h(
                        "button",
                        {
                          type: "button",
                          class: "node__button",
                          "data-action": "enter",
                          "data-node": node.id,
                          "aria-describedby": `hint-${node.id}`,
                        },
                        content,
                      )
                    : h("span", { class: "node__button" }, content, h("span", { class: "sr-only" }, status)),
                  state === "open" ? h("span", { class: "sr-only", id: `hint-${node.id}` }, info.hint) : null,
                );
              }),
            ),
            links(run.map, row, path),
          ),
        ),
      ),
    ),
  );
}

/** @type {Record<string, (ctx: Ctx, el: HTMLElement) => void>} */
export const mapActions = {
  enter(ctx, el) {
    const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
    ctx.setRun(enterNode(run, /** @type {string} */ (el.dataset.node)));
  },
};
