/** 운영체제의 동작 줄이기 설정 */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
