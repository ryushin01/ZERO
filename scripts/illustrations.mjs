/**
 * 카드·괴물·전장·무구 그림을 Wikimedia Commons에서 받아 WebP로 줄입니다.
 *
 *   pnpm illustrations          # 없는 그림만 받습니다
 *   pnpm illustrations --force  # 모두 다시 받습니다
 *   pnpm illustrations --only "figure:odin$"  # 그 대상만 다시 받습니다
 *
 * - 고른 그림은 `scripts/illustrations/picks.json`에 적습니다. (대상 키 → Commons 파일 이름, 초점)
 *   대상 키는 `figure:<slug>`, `enemy:<id>`, `field:<id>`, `arm:<id>`, `card:<id>`입니다.
 * - 그림은 모두 퍼블릭 도메인이나 CC 라이선스 자료이고, 저작자·사용 허락·원본은
 *   `scripts/illustrations/credits.json`에 모아 출처 목록(docs/credits.md)을 만듭니다.
 * - 큰 그림(긴 변 800px)은 카드 상세와 사건 화면에, 작은 그림(너비 480px)은 카드와 목록에 씁니다.
 * - 초점(`pos`)은 그림에서 얼굴이나 눈길이 모이는 곳으로, 카드처럼 잘라 보여 줄 때 object-position이 됩니다.
 * - macOS의 `sips`(형식 변환·줄이기)와 `cwebp`(brew install webp)가 필요합니다.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PICKS = join(root, "scripts/illustrations/picks.json");
const CREDITS = join(root, "scripts/illustrations/credits.json");
const MANIFEST = join(root, "src/shared/ui/artwork/artworks.json");
const OUT = join(root, "public/illust");
/** [폴더, sips로 줄이는 방식, 크기, WebP 품질] */
const SIZES = /** @type {const} */ ([
  ["l", "-Z", 800, 70],
  ["s", "--resampleWidth", 480, 64],
]);
const UA = "ZERO-illustrations/1.0 (https://github.com/ryushin01/ZERO)";
const force = process.argv.includes("--force");
/** `--only <정규식>`: 그 대상만 다시 받습니다. (예: --only "figure:(odin|thor)$") */
const onlyAt = process.argv.indexOf("--only");
const only = onlyAt > 0 ? new RegExp(process.argv[onlyAt + 1]) : null;
/** 투명한 그림(선화 PNG 등)은 카드의 먹색 바탕에서 보이지 않으므로 종이색으로 채웁니다. */
const PAPER = "0xf4efe0";

/** 대상 키를 파일 이름으로 @param {string} key */
export const fileOf = (key) => key.replace(":", "-");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** @param {string} url @param {"json" | "buffer"} as */
async function get(url, as) {
  for (let i = 0; i < 6; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60000) });
      if (res.ok) return as === "json" ? await res.json() : Buffer.from(await res.arrayBuffer());
    } catch {
      // 잠시 뒤 다시 시도합니다.
    }
    await sleep(3000 * (i + 1));
  }
  throw new Error(`받지 못했습니다: ${url}`);
}

/** HTML 조각을 글로 @param {string | undefined} v */
const text = (v) =>
  String(v ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

/** 같은 말이 두 번 붙은 저작자 이름("Unknown author Unknown author")을 하나로 @param {string} v */
const once = (v) => {
  const words = v.split(" ");
  const half = words.length / 2;
  const a = words.slice(0, half).join(" ");
  if (words.length % 2 === 0 && a === words.slice(half).join(" ")) return a;
  const glued = v.length / 2;
  return v.length % 2 === 0 && v.slice(0, glued) === v.slice(glued) ? v.slice(0, glued) : v;
};

/** 날짜 칸에 붙어 오는 위키데이터 표기("date QS:P,+1700-…")를 지웁니다. @param {string} v */
const dateText = (v) =>
  v
    .replace(/\s*date QS:.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * 작품 이름 칸을 다듬습니다. 위키데이터 표기(`label QS:Len,"…"`, `title QS:P1476,…`)가 있으면 영어 이름을 쓰고,
 * 없으면 표기와 앞에 붙은 언어 이름("Swedish: ")을 뗍니다.
 * @param {string} v
 */
function titleText(v) {
  const english = v.match(/label QS:Len,"([^"]+)"/)?.[1] ?? v.match(/title QS:P1476,en:"([^"]+)"/)?.[1];
  if (english) return english.trim();
  return v
    .replace(/\s*(title|label) QS:.*$/i, "")
    .replace(/^[A-Z][a-z]+( [a-z]+)?: /, "")
    .trim();
}

/** Commons에서 그림 정보를 받습니다. @param {string[]} files */
async function describe(files) {
  /** @type {Record<string, any>} */
  const info = {};
  for (let i = 0; i < files.length; i += 50) {
    const part = files.slice(i, i + 50).map((f) => `File:${f}`);
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      redirects: "1",
      titles: part.join("|"),
      prop: "imageinfo",
      iiprop: "url|size|extmetadata",
      iiurlwidth: "960",
      iiextmetadatafilter: "LicenseShortName|LicenseUrl|Artist|DateTimeOriginal|ObjectName",
    });
    const j = await get(`https://commons.wikimedia.org/w/api.php?${params}`, "json");
    const alias = Object.fromEntries(
      [...(j.query?.normalized ?? []), ...(j.query?.redirects ?? [])].map((x) => [x.from, x.to]),
    );
    for (const title of part) {
      let to = title;
      while (alias[to]) to = alias[to];
      const ii = j.query.pages.find((p) => p.title === to)?.imageinfo?.[0];
      if (!ii) throw new Error(`Commons에 없는 파일입니다: ${title}`);
      const m = ii.extmetadata ?? {};
      info[title.slice(5)] = {
        thumb: ii.thumburl ?? ii.url,
        page: ii.descriptionurl,
        title: titleText(text(m.ObjectName?.value)) || to.slice(5).replace(/\.[a-z]+$/i, ""),
        artist: once(text(m.Artist?.value)).slice(0, 120) || null,
        date: dateText(text(m.DateTimeOriginal?.value)).slice(0, 40) || null,
        license: text(m.LicenseShortName?.value),
        licenseUrl: text(m.LicenseUrl?.value) || null,
      };
    }
  }
  return info;
}

/** 그림의 [너비, 높이] @param {string} file */
function sizeOf(file) {
  const out = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file]).toString();
  return [Number(out.match(/pixelWidth: (\d+)/)[1]), Number(out.match(/pixelHeight: (\d+)/)[1])];
}

/**
 * sips로 PNG로 바꾸며 줄이고, cwebp로 WebP를 만듭니다. 결과의 [너비, 높이]를 돌려줍니다.
 * sips는 작은 그림을 키우기도 하므로, 원본보다 크게 만들지 않도록 크기를 원본에 맞춰 줄입니다.
 */
function encode(source, target, how, size, quality, work, cap = Infinity) {
  const png = join(work, "resized.png");
  const [w, h] = sizeOf(source);
  const limit = how === "-Z" ? Math.min(size, Math.max(w, h)) : Math.min(size, w, cap);
  execFileSync("sips", ["-s", "format", "png", how, String(limit), source, "--out", png], { stdio: "ignore" });
  execFileSync("cwebp", [
    "-quiet",
    "-mt",
    "-m",
    "6",
    "-q",
    String(quality),
    "-blend_alpha",
    PAPER,
    "-noalpha",
    png,
    "-o",
    target,
  ]);
  return sizeOf(target);
}

async function main() {
  const picks = JSON.parse(readFileSync(PICKS, "utf8"));
  // 카드 그림이 Ark 소장 그림과 같은 파일이면 카드 상세에서 Ark 자료를 또 보여 주지 않도록 표시합니다.
  const ark = JSON.parse(readFileSync(join(root, "src/entities/figure/data/art.json"), "utf8"));
  const arkFile = (slug) => {
    const url = ark[slug]?.credit?.sourceUrl;
    return url ? decodeURIComponent(url.split("/wiki/File:")[1] ?? "").replace(/_/g, " ") : null;
  };
  const old = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
  const info = await describe([...new Set(Object.values(picks).map((p) => p.file))]);
  for (const [dir] of SIZES) mkdirSync(join(OUT, dir), { recursive: true });
  const work = mkdtempSync(join(tmpdir(), "zero-illust-"));
  /** @type {Record<string, (number | string)[]>} */
  const manifest = {};
  /** @type {Record<string, any>} */
  const credits = {};
  let fetched = 0;
  try {
    for (const [key, pick] of Object.entries(picks)) {
      const meta = info[pick.file];
      const name = fileOf(key);
      const done = SIZES.every(([dir]) => existsSync(join(OUT, dir, `${name}.webp`)));
      let size = old[key] ? [old[key][0], old[key][1]] : null;
      if (force || !done || !size || only?.test(key)) {
        const raw = join(work, "source");
        writeFileSync(raw, await get(meta.thumb, "buffer"));
        for (const [dir, how, px, quality] of SIZES) {
          // 작은 그림은 큰 그림보다 넓지 않게 합니다. (세로로 긴 그림)
          const wh = encode(raw, join(OUT, dir, `${name}.webp`), how, px, quality, work, size?.[0]);
          if (dir === "l") size = wh;
        }
        fetched++;
        await sleep(300);
      }
      const same = key.startsWith("figure:") && arkFile(key.slice(7)) === pick.file.replace(/_/g, " ");
      manifest[key] = same
        ? [size[0], size[1], pick.pos ?? "50% 30%", "ark"]
        : [size[0], size[1], pick.pos ?? "50% 30%"];
      credits[key] = { file: pick.file, ...meta, thumb: undefined };
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  mkdirSync(dirname(MANIFEST), { recursive: true });
  writeFileSync(MANIFEST, `${JSON.stringify(manifest)}\n`);
  writeFileSync(CREDITS, `${JSON.stringify(credits, null, 2)}\n`);
  const { writeCredits } = await import("./credits.mjs");
  await writeCredits();
  console.log(`그림 ${Object.keys(picks).length}점 가운데 ${fetched}점을 새로 받고 출처 목록을 다시 만들었습니다.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
