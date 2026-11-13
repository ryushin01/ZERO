import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import artworks from "./artworks.json" with { type: "json" };
import { artworkAttrs, fileAttrs, hasArtwork, isArkArtwork, SMALL_WIDTH } from "./index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("artworkAttrs", () => {
  it("큰 그림과 작은 그림을 srcset으로 주고, 초점을 object-position으로 둡니다", () => {
    const [width, height, position] = artworks["figure:odin"];
    const attrs = artworkAttrs("figure:odin", { sizes: "220px" });
    expect(attrs).toMatchObject({ src: "/illust/l/figure-odin.webp", width, height, sizes: "220px", loading: "lazy" });
    expect(attrs?.srcset).toBe(`/illust/s/figure-odin.webp ${SMALL_WIDTH}w, /illust/l/figure-odin.webp ${width}w`);
    expect(attrs?.style).toEqual({ "object-position": position });
  });

  it("원본이 좁아 큰 그림도 작은 그림 너비 이하이면 한 벌만 씁니다", () => {
    const [key] = Object.entries(artworks).find(([, [width]]) => width <= SMALL_WIDTH) ?? [];
    const attrs = artworkAttrs(/** @type {string} */ (key));
    expect(attrs?.srcset).toBeUndefined();
    expect(attrs?.src).toMatch(/^\/illust\/l\//);
  });

  it("첫 화면에 보일 그림은 바로 받고, 없는 대상은 null입니다", () => {
    expect(artworkAttrs("enemy:hydra", { eager: true })?.loading).toBe("eager");
    expect(artworkAttrs("figure:nobody")).toBeNull();
    expect(hasArtwork("figure:nobody")).toBe(false);
  });

  it("Commons가 아닌 그림 파일도 같은 모양의 속성을 줍니다", () => {
    expect(fileAttrs({ src: "/a.jpg", width: 10, height: 20 })).toMatchObject({
      src: "/a.jpg",
      style: { "object-position": "50% 25%" },
    });
  });
});

describe("그림 목록 (artworks.json)", () => {
  it("고른 그림(picks.json)과 대상이 같습니다. 다르면 pnpm illustrations로 다시 만듭니다", () => {
    const picks = JSON.parse(readFileSync(join(root, "scripts/illustrations/picks.json"), "utf8"));
    expect(Object.keys(artworks).sort()).toEqual(Object.keys(picks).sort());
  });

  it("모든 그림의 큰 파일과 작은 파일이 public/illust에 있습니다", () => {
    const missing = Object.keys(artworks).flatMap((key) =>
      ["l", "s"]
        .map((size) => `public/illust/${size}/${key.replace(":", "-")}.webp`)
        .filter((path) => !existsSync(join(root, path))),
    );
    expect(missing).toEqual([]);
  });

  it("그림을 원본보다 늘리지 않아 큰 그림의 긴 변은 800px 이하입니다", () => {
    for (const [width, height] of Object.values(artworks)) expect(Math.max(width, height)).toBeLessThanOrEqual(800);
  });

  it("초점은 가로·세로 백분율입니다", () => {
    for (const [, , position] of Object.values(artworks)) expect(position).toMatch(/^\d{1,3}% \d{1,3}%$/);
  });

  it("Ark 소장 그림과 같은 그림을 표시합니다", () => {
    expect(isArkArtwork("figure:odin")).toBe(true);
    expect(isArkArtwork("figure:zeus")).toBe(false);
    expect(isArkArtwork("enemy:hydra")).toBe(false);
  });
});
