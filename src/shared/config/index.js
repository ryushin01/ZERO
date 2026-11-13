/** 카드가 이어지는 세계 신화 도서관 Ark */
export const ARK_URL = "https://ark-ryushin01.vercel.app";

/** @param {string} slug */
export const arkFigureUrl = (slug) => `${ARK_URL}/figures/${slug}`;
/** @param {string} slug */
export const arkPantheonUrl = (slug) => `${ARK_URL}/pantheons/${slug}`;

/** 그림·글꼴·참고 자료의 출처. 화면에는 출처를 적지 않고 README의 출처 표로 잇습니다. */
export const CREDITS_URL = "https://github.com/ryushin01/ZERO#출처";

/** 손에 들 수 있는 카드 수. 한 판의 전투와 2인 듀얼이 같은 규칙을 씁니다. */
export const MAX_HAND = 10;

export const STORAGE_KEYS = {
  run: "zero:run",
  duel: "zero:duel",
  settings: "zero:settings",
  records: "zero:records",
};
