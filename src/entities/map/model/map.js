import { createRng } from "#shared/lib/index.js";

/**
 * 장마다 갈림길 지도를 만듭니다.
 * 층(row)마다 칸(lane) 세 개가 있고, 각 칸은 다음 층의 같은 칸과 이웃 칸으로 이어집니다.
 * 마지막 층 다음에는 보스 하나가 있습니다.
 *
 * @typedef {"battle" | "elite" | "event" | "rest" | "shrine" | "rift" | "boss"} NodeType
 * @typedef {{ id: string, row: number, lane: number, type: NodeType, next: number[] }} MapNode
 * @typedef {{ act: number, rows: MapNode[][] }} ActMap
 */

export const LANES = 3;
/** 보스 앞까지의 층 수 */
export const FLOORS = 7;

/** @type {Record<NodeType, { label: string, en: string, hint: string }>} */
export const NODE_INFO = {
  battle: { label: "전투", en: "BATTLE", hint: "괴물과 싸우고 카드를 얻습니다." },
  elite: { label: "정예", en: "ELITE", hint: "강한 괴물입니다. 이기면 유물을 얻습니다." },
  event: { label: "사건", en: "EVENT", hint: "신화 속 장소에서 선택을 합니다." },
  rest: { label: "쉼터", en: "REST", hint: "체력을 회복하거나 카드를 강화합니다." },
  shrine: { label: "성소", en: "SHRINE", hint: "카드를 덜어 내거나 강화합니다." },
  rift: {
    label: "균열",
    en: "RIFT",
    hint: "이차원의 균열. 다른 영역의 전장이 겹친 곳에서 정예와 싸우고 큰 보상을 얻습니다.",
  },
  boss: { label: "보스", en: "BOSS", hint: "장의 끝을 지키는 괴물입니다." },
};

/** @param {number} row @param {ReturnType<typeof createRng>} rng @returns {NodeType} */
function typeFor(row, rng) {
  if (row === 0) return "battle";
  if (row === FLOORS - 1) return "rest";
  if (row === 1) return rng.weighted({ battle: 3, event: 2 });
  // 보스 바로 앞 층은 늘 쉼터이므로, 그 앞 층에는 쉼터를 두지 않습니다.
  if (row === FLOORS - 2) return rng.weighted({ battle: 45, event: 20, elite: 20, shrine: 15 });
  // 이차원의 균열은 가운데 층에 드물게 열립니다.
  return rng.weighted({ battle: 44, event: 19, elite: 13, rest: 9, shrine: 11, rift: 4 });
}

/**
 * @param {number} act
 * @param {number} seed
 * @returns {ActMap}
 */
export function generateMap(act, seed) {
  const rng = createRng(seed ^ (act * 0x9e3779b1));
  /** @type {MapNode[][]} */
  const rows = [];
  for (let row = 0; row < FLOORS; row += 1) {
    const nodes = [];
    for (let lane = 0; lane < LANES; lane += 1) {
      nodes.push({ id: `${act}-${row}-${lane}`, row, lane, type: typeFor(row, rng), next: [] });
    }
    // 한 층이 모두 정예가 되지 않게 합니다.
    if (nodes.every((n) => n.type === "elite")) nodes[1].type = "battle";
    rows.push(nodes);
  }
  for (let row = 0; row < FLOORS - 1; row += 1) {
    for (const node of rows[row]) {
      const next = new Set([node.lane]);
      const side = node.lane + (rng.float() < 0.5 ? -1 : 1);
      if (side >= 0 && side < LANES && rng.float() < 0.6) next.add(side);
      node.next = [...next].sort();
    }
  }
  const bossRow = FLOORS;
  for (const node of rows[FLOORS - 1]) node.next = [1];
  rows.push([{ id: `${act}-${bossRow}-1`, row: bossRow, lane: 1, type: "boss", next: [] }]);
  return { act, rows };
}

/**
 * 지금 고를 수 있는 칸. 아직 이 장에서 아무 곳도 가지 않았다면 첫 층 전체입니다.
 * @param {ActMap} map
 * @param {{ row: number, lane: number } | null} position
 * @returns {MapNode[]}
 */
export function reachableNodes(map, position) {
  if (!position) return map.rows[0];
  const current = map.rows[position.row]?.find((n) => n.lane === position.lane);
  if (!current) return [];
  const nextRow = map.rows[position.row + 1] ?? [];
  return nextRow.filter((n) => current.next.includes(n.lane));
}

/** @param {ActMap} map @param {string} id */
export const findNode = (map, id) => map.rows.flat().find((n) => n.id === id);

export const ACT_INFO = {
  1: { title: "성역", en: "SANCTUARY" },
  2: { title: "신역", en: "DIVINE REALM" },
  3: { title: "아우터 유니버스", en: "OUTER UNIVERSE" },
};
