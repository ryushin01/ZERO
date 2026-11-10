/**
 * 낱말 뒤에 받침에 맞는 조사를 붙입니다.
 *   withJosa("하르피이아", "이/가") → "하르피이아가"
 *   withJosa("7", "을/를") → "7을"
 * 한글이 아닌 끝(괄호, 기호)은 건너뛰고, 숫자는 읽는 소리로 판단합니다.
 */

/** 숫자를 읽을 때의 받침: 0 영, 1 일, 3 삼, 6 육, 7 칠, 8 팔 @type {Record<string, string>} */
const DIGIT_FINAL = { 0: "ㅇ", 1: "ㄹ", 2: "", 3: "ㅁ", 4: "", 5: "", 6: "ㄱ", 7: "ㄹ", 8: "ㄹ", 9: "" };

/** 마지막 소리의 받침. 없으면 "", 알 수 없으면 null @param {string} word */
function finalSound(word) {
  for (let i = word.length - 1; i >= 0; i -= 1) {
    const ch = word[i];
    if (/[0-9]/.test(ch)) return DIGIT_FINAL[ch];
    const code = ch.charCodeAt(0) - 0xac00;
    if (code >= 0 && code < 11172) {
      const index = code % 28;
      if (index === 0) return "";
      return index === 8 ? "ㄹ" : "받침";
    }
    if (/[a-zA-Z]/.test(ch)) return null;
  }
  return null;
}

/**
 * @param {string | number} word
 * @param {"이/가" | "을/를" | "은/는" | "과/와" | "으로/로" | "이었/였"} pair 받침이 있을 때/없을 때
 */
export function withJosa(word, pair) {
  const text = String(word);
  const [withFinal, withoutFinal] = pair.split("/");
  const sound = finalSound(text);
  if (sound === null) return `${text}${withFinal}(${withoutFinal})`;
  // '으로'는 ㄹ 받침 뒤에서도 '로'가 됩니다.
  if (pair === "으로/로" && sound === "ㄹ") return `${text}${withoutFinal}`;
  return `${text}${sound ? withFinal : withoutFinal}`;
}
