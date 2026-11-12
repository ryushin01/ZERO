/** 카드가 이어지는 세계 신화 도서관 Ark */
export const ARK_URL = "https://ark-ryushin01.vercel.app";

/** @param {string} slug */
export const arkFigureUrl = (slug) => `${ARK_URL}/figures/${slug}`;
/** @param {string} slug */
export const arkPantheonUrl = (slug) => `${ARK_URL}/pantheons/${slug}`;

/** 손에 들 수 있는 카드 수. 한 판의 전투와 2인 듀얼이 같은 규칙을 씁니다. */
export const MAX_HAND = 10;

export const STORAGE_KEYS = {
  run: "zero:run",
  duel: "zero:duel",
  settings: "zero:settings",
  records: "zero:records",
};
