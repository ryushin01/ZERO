import { ASPECT_DOMAINS, ASPECTS, KEYWORDS } from "#entities/card/index.js";
import { ARMAMENTS } from "#entities/armament/index.js";
import { BATTLEFIELDS } from "#entities/battlefield/index.js";
import { ARK_FIGURE_COUNT, FIGURES, PANTHEONS } from "#entities/figure/index.js";
import { ARK_URL } from "#shared/config/index.js";
import { h } from "#shared/lib/index.js";

import "./guide-page.css";

/** @param {string} id @param {string} title @param {...any} body */
const section = (id, title, ...body) =>
  h(
    "section",
    { class: "guide__section", "aria-labelledby": id },
    h("h2", { id, class: "guide__title serif" }, title),
    ...body,
  );

/** @param {import("#app/render/app.js").PageContext} ctx */
function view(ctx) {
  const motionOn = ctx.settings.motion === "on";
  return h(
    "article",
    { class: "guide" },
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "display", lang: "en" }, "How to play"),
      h("h1", null, "도움말"),
      h(
        "p",
        null,
        "한 판은 세 장으로 나뉘고, 장마다 보스가 기다립니다. 마지막 보스는 모든 신화가 시작되기 전의 공허, 영(零)입니다.",
      ),
    ),
    h(
      "nav",
      { class: "guide__toc", "aria-label": "도움말 차례" },
      h(
        "ol",
        null,
        [
          ["story", "이야기"],
          ["flow", "한 판의 흐름"],
          ["battle", "전투"],
          ["card", "카드 읽는 법"],
          ["aspects", "여섯 속성"],
          ["armaments", "신화 무구"],
          ["factions", "세력"],
          ["battlefields", "전장"],
          ["records", "서가 복원과 오늘의 신화"],
          ["terms", "용어"],
          ["sources", "자료와 출처"],
          ["settings", "설정"],
        ].map(([id, label]) =>
          h("li", null, h("a", { href: `#/guide`, "data-action": "jump", "data-target": id }, label)),
        ),
      ),
    ),
    section(
      "story",
      "이야기",
      h(
        "p",
        null,
        `세계 신화 도서관 Ark에는 다섯 대륙의 신과 영웅, 아서왕 전설과 천일야화의 인물까지 ${ARK_FIGURE_COUNT}명이 기록되어 있습니다.${FIGURES.length > ARK_FIGURE_COUNT ? ` ZERO는 Ark에 아직 없는 전설의 영웅 ${FIGURES.length - ARK_FIGURE_COUNT}명을 더했습니다.` : ""} 어느 날부터 혼돈의 괴물들이 서가를 갉아먹기 시작했습니다. 기록이 지워진 신은 아무도 기억하지 못하게 되고, 모든 것이 지워지면 세계는 처음의 공허로 돌아갑니다.`,
      ),
      h(
        "p",
        null,
        "당신은 Ark의 사서입니다. 붓(필봉)과 책장(서가)만 들고 시작해, 길에서 만나는 신과 영웅의 기록을 카드로 모아 괴물에 맞섭니다.",
      ),
    ),
    section(
      "flow",
      "한 판의 흐름",
      h(
        "ol",
        { class: "guide__steps" },
        h(
          "li",
          null,
          h("strong", null, "길잡이 신화를 고릅니다. "),
          "그 신화의 신 둘이 처음 덱에 들어오고, 보상에서도 자주 나옵니다.",
        ),
        h(
          "li",
          null,
          h("strong", null, "지도에서 칸을 고릅니다. "),
          "전투, 정예, 사건, 쉼터, 성소가 있습니다. 선으로 이어진 다음 층 칸으로만 갈 수 있습니다.",
        ),
        h(
          "li",
          null,
          h("strong", null, "이기면 카드를 하나 얻습니다. "),
          "정예와 보스는 유물도 줍니다. 덱이 너무 두꺼워지면 원하는 카드가 늦게 나오니 고르는 것도 전략입니다.",
        ),
        h(
          "li",
          null,
          h("strong", null, "세 장의 보스를 모두 물리치면 승리합니다. "),
          "장이 바뀔 때 잃은 체력의 60%를 되찾습니다. 진행은 브라우저에 자동으로 저장됩니다.",
        ),
      ),
    ),
    section(
      "battle",
      "전투",
      h(
        "p",
        null,
        "턴마다 에너지 3과 카드 5장을 받습니다. 카드 왼쪽 위 숫자만큼 에너지를 써서 냅니다. 다 냈으면 ‘턴 끝내기’를 누르세요. 손에 남은 카드는 버려지고, 적이 행동합니다.",
      ),
      h(
        "p",
        null,
        "적 이름 위의 ‘다음 행동’을 보고 막을지 칠지 정하세요. 적을 겨누는 카드를 고르면 적마다 ‘~에게 내기’ 버튼이 나타납니다. 적이 하나뿐이면 바로 냅니다. Esc 키나 ‘취소’로 고르기를 그만둘 수 있습니다.",
      ),
      h(
        "p",
        null,
        "모든 조작은 키보드로 할 수 있습니다. Tab으로 카드와 버튼을 옮겨 다니고, Enter나 Space로 고릅니다. 일어난 일은 화면 낭독기로도 알려 드립니다.",
      ),
    ),
    section(
      "card",
      "카드 읽는 법",
      h(
        "dl",
        { class: "guide__terms" },
        h("dt", null, "비용"),
        h("dd", null, "왼쪽 위 원 안의 숫자. 내는 데 드는 에너지입니다."),
        h("dt", null, "희귀도"),
        h(
          "dd",
          null,
          "Ark에서 그 신화의 첫 번째로 소개된 신은 전설, 두세 번째는 희귀, 나머지는 일반입니다. 전설 카드는 겹선 테두리로 구분합니다.",
        ),
        h("dt", null, "효과"),
        h("dd", null, "가운데 문장. 손에 든 카드는 힘, 약화, 공명을 반영한 실제 수치를 보여 줍니다."),
        h("dt", null, "속성"),
        h("dd", null, "아래쪽 한자. 신이 관장하는 영역에서 나옵니다."),
      ),
    ),
    section(
      "aspects",
      "여섯 속성",
      h(
        "p",
        null,
        "카드 효과는 손으로 정한 것이 아니라, Ark에 적힌 신의 관장 영역에서 계산합니다. 맨 앞에 적힌 영역이 주 속성, 다음으로 다른 속성의 영역이 보조 속성이 됩니다. 번개·천둥의 신은 모든 적을, 폭풍·바람의 신은 두 번 치고, 속임수의 신은 비용이 0이며, 부활·불사의 신은 손에 남습니다.",
      ),
      h(
        "div",
        { class: "guide__table-wrap", role: "region", "aria-labelledby": "aspect-caption", tabindex: "0" },
        h(
          "table",
          { class: "guide__table" },
          h("caption", { id: "aspect-caption" }, "속성별 효과와 해당 영역의 예"),
          h(
            "thead",
            null,
            h(
              "tr",
              null,
              h("th", { scope: "col" }, "속성"),
              h("th", { scope: "col" }, "효과"),
              h("th", { scope: "col" }, "영역의 예"),
            ),
          ),
          h(
            "tbody",
            null,
            Object.entries(ASPECTS).map(([key, a]) =>
              h(
                "tr",
                null,
                h(
                  "th",
                  { scope: "row" },
                  h("span", { "aria-hidden": "true", class: "guide__mark" }, a.mark),
                  ` ${a.label}`,
                ),
                h("td", null, a.summary),
                h("td", null, ASPECT_DOMAINS[/** @type {keyof typeof ASPECT_DOMAINS} */ (key)].slice(0, 8).join(", ")),
              ),
            ),
          ),
        ),
      ),
    ),
    section(
      "armaments",
      "신화 무구",
      h(
        "p",
        null,
        `묠니르, 엑스칼리버, 여의봉처럼 신화와 전설 속 무구 ${ARMAMENTS.length}점이 전투에 나옵니다. 길잡이 신화에 전해지는 무구 하나를 들고 떠나고, 정예를 물리치면 둘 가운데 하나를 더 고를 수 있습니다. 최대 3점까지 듭니다.`,
      ),
      h(
        "p",
        null,
        "무구는 카드처럼 에너지를 써서 휘두르고, 쓰고 나면 몇 턴 쉬어야 다시 쓸 수 있습니다. 지도의 ‘장착하기’로 무구를 신·영웅의 카드에 끼우면, 그 카드를 낼 때 에너지 없이 함께 터집니다. 슬레이프니르·페가수스 같은 탈것과 후긴과 무닌 같은 동반자도 카드에 끼울 수 있고, 오딘과 슬레이프니르처럼 신화 속 짝이면 결속 효과가 붙습니다. 그 턴에 주인 신의 카드를 냈다면 효과가 50% 늘어납니다. 묠니르는 토르와 함께라면 던져도 바로 손으로 돌아옵니다. 바사비 샥티처럼 전투마다 한 번만 쓰는 무구도 있습니다.",
      ),
    ),
    section(
      "factions",
      "세력",
      h(
        "p",
        null,
        "같은 신화 계열의 신을 덱에 3장 모으면 그 계열의 세력이 깨어나고, 5장이면 더 강해집니다. 한국 신화의 ‘홍익인간’은 매 턴 체력을 되찾고, 북유럽 신화의 ‘아스가르드’는 전투를 힘을 얻은 채 시작합니다.",
      ),
      h(
        "p",
        null,
        `지도의 ‘사서의 상태’에서 지금 덱의 세력을, 도감의 ‘세력’ 탭에서 ${PANTHEONS.length}개 계열의 세력을 모두 볼 수 있습니다.`,
      ),
    ),
    section(
      "battlefields",
      "전장",
      h(
        "p",
        null,
        "한 판은 성역(1장), 신역(2장), 아우터 유니버스(3장)를 지납니다. 장마다 그 영역의 전장 하나에서 싸우는데, 성역은 아발론·아틀란티스처럼 사람의 땅에 남은 전설의 장소, 신역은 올림포스·발할라·하데스의 명계처럼 신들의 거처와 낙원·저승, 아우터 유니버스는 긴눙가가프·카오스처럼 세계가 생기기 전의 공간입니다.",
      ),
      h(
        "p",
        null,
        "전장마다 효과가 하나 있습니다. 발할라에서는 힘을 얻은 채 시작하고, 아틀란티스에서는 턴이 끝날 때마다 바다가 사서와 적을 모두 덮칩니다. 그 전장이 속한 신화권의 카드는 ‘지형 공명’으로 피해·방어·회복·침식이 25% 늘고(공명과 같은 범위), 손에 든 카드에 ‘지형’이라고 표시됩니다.",
      ),
      h(
        "p",
        null,
        `지도 곳곳에 드물게 열리는 균열(裂)은 이차원으로 이어집니다. 다른 영역의 전장이 겹친 곳에서 정예와 싸우고, 이기면 유물 둘 가운데 하나를 고릅니다. 도감의 ‘전장’ 탭에서 전장 ${BATTLEFIELDS.length}곳을 모두 볼 수 있습니다.`,
      ),
    ),
    section(
      "records",
      "서가 복원과 오늘의 신화",
      h(
        "p",
        null,
        "판을 거듭하며 덱에 넣은 신은 Ark의 서가에 복원됩니다. 도감에서 복원한 신에는 ‘복원’ 표시가 붙고, 모두 가운데 몇 명을 되찾았는지 볼 수 있습니다. 판이 끝나면 이번에 새로 복원한 신을 알려 드립니다.",
      ),
      h(
        "p",
        null,
        "‘오늘의 신화’는 한국 시간 날짜로 정한 같은 길잡이 후보와 같은 지도로 모두가 겨루는 도전입니다. 하루에 여러 번 도전할 수 있고 가장 좋은 결과가 남습니다. 결과 화면의 ‘결과 복사하기’로 기록을 나눌 수 있습니다.",
      ),
    ),
    section(
      "terms",
      "용어",
      h(
        "dl",
        { class: "guide__terms" },
        KEYWORDS.map((k) => [h("dt", null, k.term), h("dd", null, k.text)]),
      ),
    ),
    section(
      "sources",
      "자료와 출처",
      h(
        "p",
        null,
        "신과 영웅, 신화 계열의 소개와 카드 그림은 ",
        h(
          "a",
          { href: ARK_URL, target: "_blank", rel: "noopener" },
          "세계 신화 도서관 Ark",
          h("span", { class: "sr-only" }, " (새 창)"),
        ),
        "에서 가져왔습니다. 그림은 모두 Wikimedia Commons의 퍼블릭 도메인 또는 CC 라이선스 자료이며, 도감에서 카드를 누르면 저작자와 라이선스, 원본 주소를 볼 수 있습니다.",
      ),
      h("p", null, "괴물과 유물, 사건은 여러 신화와 민담에서 가져온 이야기를 게임에 맞게 다시 쓴 것입니다."),
    ),
    section(
      "settings",
      "설정",
      h(
        "p",
        { class: "guide__setting" },
        h(
          "button",
          {
            type: "button",
            class: "button",
            "data-action": "toggle-motion",
            "aria-pressed": motionOn ? "true" : "false",
          },
          "움직임 효과",
          h("span", { "aria-hidden": "true" }, motionOn ? " · 켜짐" : " · 꺼짐"),
        ),
        h(
          "span",
          { class: "muted" },
          "처음 화면의 도는 고리와 카드 등장 효과를 멈춥니다. 운영체제에서 동작 줄이기를 켜 두었다면 처음부터 꺼져 있습니다.",
        ),
      ),
      h(
        "p",
        { class: "guide__setting" },
        h("button", { type: "button", class: "button", "data-action": "reset-records" }, "기록 지우기"),
        h(
          "span",
          { class: "muted" },
          `지금까지 ${ctx.records.runs}판, 승리 ${ctx.records.wins}, 서가 복원 ${ctx.records.seen.length}명. 진행 중인 판과 기록을 이 브라우저에서 지웁니다.`,
        ),
      ),
    ),
  );
}

/** @type {import("#app/render/app.js").Page} */
export const guidePage = {
  title: () => "도움말",
  surface: () => "light",
  context: () => "도움말",
  view,
  actions: {
    jump: (_ctx, el) => {
      const target = document.getElementById(/** @type {string} */ (el.dataset.target));
      if (!target) return;
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: document.body.dataset.motion === "on" ? "smooth" : "auto", block: "start" });
    },
    "toggle-motion": (ctx) => {
      const motion = ctx.settings.motion === "on" ? "off" : "on";
      ctx.setSettings({ motion });
      ctx.announce(motion === "on" ? "움직임 효과를 켰습니다." : "움직임 효과를 껐습니다.");
    },
    "reset-records": (ctx) => {
      if (!window.confirm("진행 중인 판과 지금까지의 기록을 지울까요? 되돌릴 수 없습니다.")) return;
      ctx.setRun(null);
      ctx.resetRecords();
      ctx.announce("기록을 지웠습니다.");
    },
  },
};
