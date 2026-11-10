/** 카드가 이어지는 세계 신화 도서관 Ark */
export const ARK_URL = "https://ark-indol.vercel.app";

/** @param {string} slug */
export const arkFigureUrl = (slug) => `${ARK_URL}/figures/${slug}`;
/** @param {string} slug */
export const arkPantheonUrl = (slug) => `${ARK_URL}/pantheons/${slug}`;

export const STORAGE_KEYS = {
  run: "zero:run",
  settings: "zero:settings",
  records: "zero:records",
};
