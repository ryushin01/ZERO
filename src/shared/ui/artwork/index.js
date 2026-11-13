import artworks from "./artworks.json" with { type: "json" };

/**
 * 카드·괴물·전장·무구 그림. Wikimedia Commons의 퍼블릭 도메인·CC 그림을 `pnpm illustrations`로 받아
 * `public/illust/`에 WebP로 둡니다. 큰 그림(긴 변 800px)과 작은 그림(너비 480px) 두 벌이 있어,
 * 브라우저가 보여 줄 크기에 맞는 쪽을 고릅니다. 원본보다 크게 늘리지는 않습니다.
 *
 * 대상 키: `figure:<slug>`, `enemy:<id>`, `field:<id>`, `arm:<id>`, `card:<id>`
 * 그림마다 [너비, 높이, 초점, 출처 표시?]를 적어 둡니다. 초점은 카드처럼 잘라 보여 줄 때의 object-position이고,
 * 네 번째 값 "ark"는 Ark 소장 그림과 같은 파일이라는 뜻입니다.
 */
const DATA = /** @type {Record<string, [number, number, string, "ark"?]>} */ (/** @type {unknown} */ (artworks));

/** 작은 그림의 너비 */
export const SMALL_WIDTH = 480;

/**
 * @typedef {{
 *   src: string, srcset?: string, sizes?: string, width: number, height: number,
 *   style: Record<string, string>, loading: "lazy" | "eager", decoding: "async",
 * }} ArtworkAttrs
 */

/** @param {string} key */
export const hasArtwork = (key) => Object.hasOwn(DATA, key);

/** 이 그림이 Ark 소장 그림과 같은 파일인지 (카드 상세에서 같은 그림을 두 번 보이지 않으려고) @param {string} key */
export const isArkArtwork = (key) => DATA[key]?.[3] === "ark";

/**
 * 그림 한 점의 img 속성. 그림이 없는 대상이면 null입니다.
 * @param {string} key 대상 키
 * @param {{ sizes?: string, eager?: boolean }} [options] sizes: 보여 줄 크기, eager: 첫 화면처럼 바로 받을 그림
 * @returns {ArtworkAttrs | null}
 */
export function artworkAttrs(key, { sizes = "240px", eager = false } = {}) {
  if (!hasArtwork(key)) return null;
  const [width, height, position] = DATA[key];
  const file = key.replace(":", "-");
  const large = `/illust/l/${file}.webp`;
  // 원본이 좁아 큰 그림이 작은 그림 너비 이하이면 두 벌이 같으므로 srcset을 쓰지 않습니다.
  const pair = width > SMALL_WIDTH;
  return {
    src: large,
    srcset: pair ? `/illust/s/${file}.webp ${SMALL_WIDTH}w, ${large} ${width}w` : undefined,
    sizes: pair ? sizes : undefined,
    width,
    height,
    style: { "object-position": position },
    loading: eager ? "eager" : "lazy",
    decoding: "async",
  };
}

/**
 * 받아 둔 그림 파일 하나(히든 카드처럼 Commons가 아닌 그림)의 img 속성
 * @param {{ src: string, width: number, height: number, position?: string }} file
 * @param {{ eager?: boolean }} [options]
 * @returns {ArtworkAttrs}
 */
export const fileAttrs = ({ src, width, height, position = "50% 25%" }, { eager = false } = {}) => ({
  src,
  width,
  height,
  style: { "object-position": position },
  loading: eager ? "eager" : "lazy",
  decoding: "async",
});
