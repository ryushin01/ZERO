import { ARMAMENT_SLOTS, ARMAMENTS, HIDDEN_ARMAMENTS } from "#entities/armament/index.js";
import { getCard } from "#entities/card/index.js";
import { withJosa } from "#shared/lib/index.js";

/**
 * 지도 위 '사건' 칸에서 만나는 신화 속 장소들.
 * 장소마다 Ark의 신 한 명을 그림과 함께 보여 주어, 카드 밖에서도 세계관이 이어지게 합니다.
 *
 * @typedef {import("./run.js").Run} Run
 * @typedef {{
 *   roll: (fn: (rng: ReturnType<typeof import("#shared/lib/index.js").createRng>) => any) => any,
 *   makeCard: (id: string, up?: boolean) => import("./combat.js").CardInstance,
 *   rollCards: (tier: "normal" | "elite" | "boss", options?: { pantheon?: string, count?: number }) => string[],
 *   rollRelics: (count: number) => string[],
 *   gainRelic: (id: string) => void,
 *   pickPantheon: () => { slug: string, name: string },
 * }} EventTools
 * @typedef {{ id: string, label: string, result: string, available?: (run: Run) => boolean, apply: (run: Run, tools: EventTools) => void }} EventChoice
 * @typedef {{ id: string, title: string, en: string, figure?: string, card?: string, text: string[], choices: EventChoice[] }} EventDef
 */

/** @param {Run} run @param {number} amount */
const loseHp = (run, amount) => {
  run.hp = Math.max(1, run.hp - amount);
};

/** 기본 카드(필봉·서가)인지 @param {{ id: string }} card */
const isBasic = (card) => card.id === "quill" || card.id === "shelf";

/** 무구 자리(3점)에 빈 곳이 있는지. 히든 무구는 자리와 따로 듭니다. @param {Run} run */
const hasArmSlot = (run) =>
  run.armaments.filter((id) => !HIDDEN_ARMAMENTS.some((a) => a.id === id)).length < ARMAMENT_SLOTS;

/** @param {Run} run @param {string} title @param {import("./run.js").Reward["cards"]} cards */
const offerCards = (run, title, cards) => {
  run.phase = "reward";
  run.reward = { title, cards, relics: [], relicPick: false, cardTaken: false, relicTaken: false };
};

const leave = { id: "leave", label: "지나간다", result: "", apply: () => {} };

/** @type {EventDef[]} */
export const EVENTS = [
  {
    id: "oracle",
    title: "델포이의 신탁",
    en: "THE ORACLE AT DELPHI",
    figure: "apollo",
    text: [
      "월계수 연기 너머에서 무녀 피티아가 아폴론의 말을 전합니다.",
      "신탁은 언제나 값을 치르게 합니다. 대신 앞으로 올 일을 미리 보여 줍니다.",
    ],
    choices: [
      {
        id: "listen",
        label: "신탁을 듣는다 · 체력 6을 잃고 무작위 카드 2장 강화",
        result: "신탁의 말이 카드에 새겨졌습니다.",
        apply(run, { roll }) {
          loseHp(run, 6);
          const candidates = run.deck.filter((c) => !c.up).map((c) => c.uid);
          const chosen = roll((rng) => rng.sample(candidates, 2));
          run.deck = run.deck.map((c) => (chosen.includes(c.uid) ? { ...c, up: true } : c));
        },
      },
      leave,
    ],
  },
  {
    id: "mimir",
    title: "미미르의 샘",
    en: "MIMIR'S WELL",
    figure: "odin",
    text: [
      "세계수 뿌리 아래, 지혜가 고인 샘입니다. 오딘은 이 물 한 모금에 한쪽 눈을 내주었습니다.",
      "샘지기의 머리가 묻습니다. 무엇을 내놓겠느냐고.",
    ],
    choices: [
      {
        id: "drink",
        label: "샘물을 마신다 · 최대 체력 6을 바치고 전설 카드 하나 고르기",
        result: "",
        available: (run) => run.maxHp > 20,
        apply(run, { rollCards }) {
          run.maxHp -= 6;
          run.hp = Math.min(run.hp, run.maxHp);
          offerCards(run, "미미르의 샘에서 얻은 지혜", rollCards("boss", { count: 3 }));
        },
      },
      leave,
    ],
  },
  {
    id: "library",
    title: "잃어버린 서가",
    en: "THE LOST SHELF",
    figure: "thoth",
    text: [
      "망각의 안개 속에서 Ark의 서가 하나가 떠올랐습니다. 문자의 신 토트의 표식이 남아 있습니다.",
      "한 계열의 기록이 아직 온전합니다. 한 장을 골라 덱에 옮겨 적을 수 있습니다.",
    ],
    choices: [
      {
        id: "read",
        label: "서가를 펼친다 · 한 신화 계열의 카드 가운데 하나 고르기",
        result: "",
        apply(run, { rollCards, pickPantheon }) {
          const pantheon = pickPantheon();
          offerCards(run, `잃어버린 서가: ${pantheon.name}`, rollCards("elite", { pantheon: pantheon.slug, count: 3 }));
        },
      },
      leave,
    ],
  },
  {
    id: "lethe",
    title: "레테의 강",
    en: "THE RIVER LETHE",
    figure: "hades",
    text: [
      "하데스의 땅을 흐르는 망각의 강입니다. 죽은 이들은 이 물을 마시고 지난 삶을 잊습니다.",
      "덱의 무게를 덜 수 있습니다. 다만 무엇을 잊을지는 골라야 합니다.",
    ],
    choices: [
      {
        id: "sip",
        label: "한 모금 마신다 · 카드 1장 지우기",
        result: "",
        available: (run) => run.deck.length > 5,
        apply(run) {
          run.phase = "pick";
          run.pick = { purpose: "remove", count: 1, title: "레테의 강에 흘려보낼 카드", then: "map" };
        },
      },
      {
        id: "gulp",
        label: "깊이 마신다 · 체력 8을 잃고 기본 카드 2장을 무작위로 지우기",
        result: "기본 카드 2장이 강물에 씻겨 나갔습니다.",
        available: (run) => run.deck.filter((c) => c.id === "quill" || c.id === "shelf").length >= 2,
        apply(run, { roll }) {
          loseHp(run, 8);
          const basics = run.deck.filter((c) => c.id === "quill" || c.id === "shelf").map((c) => c.uid);
          const chosen = roll((rng) => rng.sample(basics, 2));
          run.deck = run.deck.filter((c) => !chosen.includes(c.uid));
        },
      },
      leave,
    ],
  },
  {
    id: "forge",
    title: "일마리넨의 대장간",
    en: "THE FORGE OF ILMARINEN",
    figure: "ilmarinen",
    text: [
      "하늘의 궁창을 두드려 만들었다는 대장장이의 화덕이 아직 따뜻합니다.",
      "불은 쇠를 단단하게 하지만, 다루는 손도 데게 합니다.",
    ],
    choices: [
      {
        id: "forge",
        label: "카드를 벼린다 · 체력 7을 잃고 카드 1장 강화",
        result: "",
        available: (run) => run.deck.some((c) => !c.up),
        apply(run) {
          run.phase = "pick";
          run.pick = { purpose: "upgrade", count: 1, title: "화덕에서 벼릴 카드", then: "map", cost: { hp: 7 } };
        },
      },
      leave,
    ],
  },
  {
    id: "bari",
    title: "서천의 생명수",
    en: "THE WATER OF LIFE",
    figure: "bari",
    text: [
      "버려진 일곱째 공주 바리는 저승 끝까지 걸어가 부모를 살릴 생명수를 길어 왔습니다.",
      "그 길에 흘린 물이 아직 고여 있습니다.",
    ],
    choices: [
      {
        id: "heal",
        label: "생명수를 마신다 · 체력 25 회복",
        result: "몸에 온기가 돕니다.",
        apply(run) {
          run.hp = Math.min(run.maxHp, run.hp + 25);
        },
      },
      {
        id: "keep",
        label: "생명수를 담아 간다 · 최대 체력 5 증가",
        result: "최대 체력이 늘었습니다.",
        apply(run) {
          run.maxHp += 5;
          run.hp += 5;
        },
      },
    ],
  },
  {
    id: "inanna",
    title: "이난나의 일곱 문",
    en: "THE SEVEN GATES OF INANNA",
    figure: "ishtar",
    text: [
      "하늘의 여왕 이난나(이슈타르)는 언니 에레쉬키갈이 다스리는 저승으로 내려가며, 일곱 문을 지날 때마다 왕관과 장신구를 하나씩 내려놓았습니다.",
      "가진 것을 내려놓은 자만이 저승에서 돌아옵니다.",
    ],
    choices: [
      {
        id: "descend",
        label: "일곱 문을 지난다 · 체력의 절반을 잃고 덱의 기본 카드를 모두 강화",
        result: "저승에서 돌아오자 기본 카드가 모두 단단해졌습니다.",
        available: (run) => run.hp > 10 && run.deck.some((c) => isBasic(c) && !c.up),
        apply(run) {
          loseHp(run, Math.floor(run.hp / 2));
          run.deck = run.deck.map((c) => (isBasic(c) ? { ...c, up: true } : c));
        },
      },
      leave,
    ],
  },
  {
    id: "houyi",
    title: "후예의 활",
    en: "THE BOW OF HOU YI",
    figure: "hou-yi",
    text: [
      "하늘에 해가 열 개 떠올라 땅이 타들어 가자, 명궁 후예는 아홉 개의 해를 쏘아 떨어뜨렸습니다.",
      "그 활이 아직 붉게 달아오른 채 바위에 기대어 있습니다.",
    ],
    choices: [
      {
        id: "bow",
        label: "활을 든다 · 무구 후예의 활 얻기 (이미 있으면 다른 무구)",
        result: "",
        available: (run) => hasArmSlot(run) && ARMAMENTS.some((a) => !run.armaments.includes(a.id)),
        apply(run, { roll }) {
          const unowned = ARMAMENTS.filter((a) => !run.armaments.includes(a.id));
          const arm = unowned.find((a) => a.id === "yi-bow") ?? roll((rng) => rng.pick(unowned));
          run.armaments.push(arm.id);
          run.notice = `무구 ${withJosa(arm.name, "을/를")} 얻었습니다.`;
        },
      },
      {
        id: "sun",
        label: "남은 해 아래에서 쉰다 · 체력 15 회복",
        result: "남은 해 하나가 몸을 데워 줍니다.",
        apply(run) {
          run.hp = Math.min(run.maxHp, run.hp + 15);
        },
      },
    ],
  },
  {
    id: "maui",
    title: "마우이의 낚싯바늘",
    en: "THE HOOK OF MAUI",
    figure: "maui",
    text: [
      "꾀 많은 반신 마우이는 할머니의 턱뼈로 만든 낚싯바늘로 바다 밑에서 섬을 끌어 올렸습니다.",
      "바늘을 드리우면 바다는 무엇이든 다른 것으로 바꾸어 돌려줍니다.",
    ],
    choices: [
      {
        id: "fish",
        label: "바늘을 드리운다 · 체력 5를 잃고 기본 카드 1장을 무작위 신·영웅 카드로 바꾸기",
        result: "",
        available: (run) => run.deck.some(isBasic),
        apply(run, { roll, makeCard, rollCards }) {
          const [id] = rollCards("elite", { count: 1 });
          if (!id) return;
          loseHp(run, 5);
          const basics = run.deck.filter(isBasic);
          const lost = roll((rng) => rng.pick(basics));
          const caught = makeCard(id);
          run.deck = run.deck.map((c) => (c.uid === lost.uid ? caught : c));
          run.notice = `${getCard(lost.id).name} 한 장이 바다에서 ${withJosa(getCard(id).name, "으로/로")} 바뀌어 올라왔습니다.`;
        },
      },
      leave,
    ],
  },
  {
    id: "loki",
    title: "로키의 내기",
    en: "LOKI'S WAGER",
    figure: "loki",
    text: [
      "모습을 바꾸는 신이 웃으며 판을 펼칩니다. 이기면 보물을, 지면 피를 걸자고 합니다.",
      "로키의 내기에서 공정한 것은 하나도 없지만, 판돈은 진짜입니다.",
    ],
    choices: [
      {
        id: "bet",
        label: "내기를 받는다 · 반반의 확률로 유물을 얻거나 체력 12를 잃기",
        result: "",
        apply(run, { roll, rollRelics, gainRelic }) {
          const win = roll((rng) => rng.float() < 0.5);
          const [relic] = rollRelics(1);
          if (win && relic) gainRelic(relic);
          else loseHp(run, 12);
          run.notice = win && relic ? "내기에 이겨 유물을 얻었습니다." : "내기에 져 체력 12를 잃었습니다.";
        },
      },
      leave,
    ],
  },
];

/**
 * 히든 사건. 사건 칸에서 드물게(HIDDEN_EVENT_CHANCE) 열리며, 유신과 영혼의 검을 얻습니다.
 * @type {EventDef}
 */
export const HIDDEN_EVENT = {
  id: "crimson",
  title: "붉은 방",
  en: "THE CRIMSON ROOM",
  card: "yushin",
  text: [
    "서가 사이에 없던 문이 열리고, 온통 붉은 방이 나옵니다. 검은 도포를 입은 사내가 눈을 감은 채 긴 칼에 손을 얹고 서 있습니다.",
    "“기록되지 않은 자는 지워지지도 않지.” 사내의 이름은 Ark 어디에도 없습니다.",
  ],
  choices: [
    {
      id: "follow",
      label: "사내와 함께 간다 · 최대 체력 10을 잃고 유신 카드와 무구 영혼의 검 얻기",
      result: "유신이 영혼의 검을 들고 덱에 들어왔습니다.",
      apply(run, { makeCard }) {
        run.maxHp = Math.max(1, run.maxHp - 10);
        run.hp = Math.min(run.hp, run.maxHp);
        run.deck.push(makeCard("yushin"));
        // 무구 자리(3점)를 넘어도 함께 듭니다.
        if (!run.armaments.includes("soul-sword")) run.armaments.push("soul-sword");
      },
    },
    { ...leave, label: "문을 닫는다" },
  ],
};

/** 사건 칸에서 히든 사건이 열릴 확률 (덱에 유신이 없을 때) */
export const HIDDEN_EVENT_CHANCE = 0.08;

const BY_ID = new Map([...EVENTS, HIDDEN_EVENT].map((e) => [e.id, e]));

/** 지금 있는 사건인지. 저장된 판이 가리키는 사건을 확인할 때 씁니다. @param {unknown} id */
export const hasEvent = (id) => typeof id === "string" && BY_ID.has(id);

/** @param {string} id */
export function getEvent(id) {
  const event = BY_ID.get(id);
  if (!event) throw new Error(`알 수 없는 사건: ${id}`);
  return event;
}
