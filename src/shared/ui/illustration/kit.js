/**
 * 일러스트 공용 도구: 문서 틀, 필터, 그라디언트, 배경, 받침, 입자.
 *
 * 그림은 모두 코드로 그린 SVG 문자열입니다. <img>의 data URL로 쓰므로 DOM이 가볍고,
 * Ark에 신이 늘어나도 같은 화풍으로 바로 그려집니다.
 *
 * 화풍: 어두운 하늘, 위에서 비치는 테두리 빛(rim filter), 속성색의 기운, 회화 질감(grain),
 * 미니어처처럼 받침 위에 선 전신 구도. 좌표계는 가로 200, 세로 260이고 받침 윗면은 y=232입니다.
 */

export const W = 200;
export const H = 260;
export const GROUND = 232;

/** 시드 문자열을 숫자로 @param {string} text */
export function hashOf(text) {
  let h = 2166136261;
  for (const ch of text) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 0~1 난수 생성기 (mulberry32) @param {number} seed */
export function rand(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 숫자를 짧게 @param {number} n */
export const f = (n) => (Math.round(n * 10) / 10).toString();

/** 색을 섞습니다 @param {string} a @param {string} b @param {number} t 0이면 a */
export function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (p, s) => (p >> s) & 255;
  const c = (s) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t);
  return `#${((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1)}`;
}

/**
 * 공용 정의: 테두리 빛, 기운 번짐, 질감, 피부·천·금속 그라디언트
 * @param {{ glow: string, skin: string, cloth: string, metal: string, dark: string }} c
 */
export function defs(c) {
  const grad = (id, light, dark) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${mix(light, dark, 0.55)}"/><stop offset="1" stop-color="${dark}"/></linearGradient>`;
  return `<defs>
<filter id="rim" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="4" result="halo0"/><feFlood flood-color="${c.glow}" flood-opacity=".3"/><feComposite in2="halo0" operator="in" result="halo"/><feColorMatrix in="SourceGraphic" values=".74 0 0 0 0  0 .72 0 0 0  0 0 .72 0 0  0 0 0 1 0" result="body"/><feOffset in="SourceAlpha" dx="-1.4" dy="-1.8" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out" result="e"/><feFlood flood-color="${c.glow}"/><feComposite in2="e" operator="in" result="l"/><feGaussianBlur in="l" stdDeviation=".5" result="lb"/><feOffset in="SourceAlpha" dx="3" dy="3" result="o2"/><feComposite in="SourceAlpha" in2="o2" operator="out" result="e2"/><feFlood flood-color="#000" flood-opacity=".55"/><feComposite in2="e2" operator="in" result="sh"/><feMerge><feMergeNode in="halo"/><feMergeNode in="body"/><feMergeNode in="sh"/><feMergeNode in="lb"/></feMerge></filter>
<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .4  0 0 0 .9 0"/></filter>
<filter id="cloud"><feTurbulence type="fractalNoise" baseFrequency=".012 .03" numOctaves="3" seed="3"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 -.18"/></filter>
${grad("skin", mix(c.skin, "#ffffff", 0.08), mix(c.skin, c.dark, 0.88))}
${grad("cloth", mix(c.cloth, c.dark, 0.12), mix(c.cloth, c.dark, 0.9))}
${grad("metal", mix(c.metal, "#ffffff", 0.35), mix(c.metal, c.dark, 0.75))}
${grad("dark", mix(c.dark, c.glow, 0.25), c.dark)}
<radialGradient id="aura" cx=".5" cy=".42" r=".55"><stop offset="0" stop-color="${c.glow}" stop-opacity=".85"/><stop offset=".45" stop-color="${c.glow}" stop-opacity=".25"/><stop offset="1" stop-color="${c.glow}" stop-opacity="0"/></radialGradient>
<linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.dark}" stop-opacity="0"/><stop offset="1" stop-color="${c.dark}" stop-opacity=".95"/></linearGradient>
<radialGradient id="vignette" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
</defs>`;
}

/**
 * 하늘과 구름, 뒤의 기운
 * @param {{ sky: [string, string], glow: string }} c @param {() => number} r
 */
export function sky(c, r) {
  const streaks = Array.from({ length: 5 }, () => {
    const y = 20 + r() * 150;
    return `<path d="M-10 ${f(y)} Q100 ${f(y - 20 + r() * 40)} 210 ${f(y + r() * 20)}" stroke="${c.glow}" stroke-opacity=".08" stroke-width="${f(6 + r() * 14)}" fill="none" filter="url(#soft)"/>`;
  }).join("");
  return `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.sky[0]}"/><stop offset="1" stop-color="${c.sky[1]}"/></linearGradient>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<rect width="${W}" height="${H}" filter="url(#cloud)" opacity=".5"/>
${streaks}
<ellipse cx="100" cy="112" rx="96" ry="118" fill="url(#aura)"/>`;
}

/**
 * 신화권 배경 실루엣
 * @param {string} motif @param {string} tone @param {() => number} r
 */
export function backdrop(motif, tone, r) {
  const g = (inner) => `<g fill="${tone}" opacity=".85">${inner}</g>`;
  const hill = `<path d="M0 205 Q40 186 80 198 T160 192 T200 200 V260 H0Z"/>`;
  switch (motif) {
    case "columns": {
      const cols = [18, 40, 160, 182]
        .map((x, i) => {
          const h = 110 + (i % 2) * 18 - (i > 1 ? 10 : 0);
          return `<rect x="${x - 6}" y="${GROUND - h}" width="12" height="${h}"/><rect x="${x - 9}" y="${GROUND - h - 6}" width="18" height="6"/>`;
        })
        .join("");
      return g(
        `${cols}<path d="M8 ${GROUND - 128} L50 ${GROUND - 146} L52 ${GROUND - 140} L8 ${GROUND - 122}Z"/>${hill}`,
      );
    }
    case "mountains":
      return g(
        `<path d="M0 190 L30 130 L48 150 L78 96 L104 150 L130 118 L160 160 L184 120 L200 140 V260 H0Z" opacity=".75"/><path d="M150 ${GROUND} V170 Q158 160 166 170 V${GROUND}Z"/>${hill}`,
      );
    case "stones":
      return g(
        `<rect x="14" y="150" width="16" height="82" rx="3"/><rect x="36" y="168" width="12" height="64" rx="3"/><rect x="156" y="146" width="18" height="86" rx="3"/><rect x="10" y="144" width="42" height="9" rx="2"/>${hill}`,
      );
    case "pyramid":
      return g(
        `<circle cx="150" cy="70" r="20" fill="${tone}" opacity=".4"/><path d="M-20 205 L40 120 L100 205Z" opacity=".7"/><path d="M110 210 L160 140 L210 210Z"/>${hill}`,
      );
    case "ziggurat":
      return g(
        `<path d="M110 ${GROUND} V196 H124 V178 H138 V160 H170 V178 H184 V196 H198 V${GROUND}Z"/><path d="M0 ${GROUND} V200 H14 V184 H40 V200 H52 V${GROUND}Z"/>${hill}`,
      );
    case "temple":
      return g(
        `<path d="M150 ${GROUND} V170 Q150 120 168 92 Q186 120 186 170 V${GROUND}Z"/><path d="M14 ${GROUND} V186 Q14 160 26 146 Q38 160 38 186 V${GROUND}Z"/>${hill}`,
      );
    case "pagoda":
      return g(
        `<path d="M0 170 Q50 120 90 160 Q130 110 200 150 V260 H0Z" opacity=".55"/><path d="M152 ${GROUND} V150 H176 V${GROUND}Z"/><path d="M140 154 Q164 140 188 154Z"/><path d="M144 184 Q164 172 184 184Z"/><path d="M10 ${GROUND} V190 H32 V${GROUND}Z M4 192 Q21 182 38 192Z"/>${hill}`,
      );
    case "steps":
      return g(
        `<path d="M118 ${GROUND} L132 168 H148 V156 H166 V168 H182 L196 ${GROUND}Z"/><path d="M0 ${GROUND} V196 L14 180 H34 L46 ${GROUND}Z"/>${hill}`,
      );
    case "baobab":
      return g(
        `<path d="M150 ${GROUND} Q154 180 152 150 Q140 140 132 128 M152 150 Q166 136 178 126 M152 152 Q156 132 156 118" stroke="${tone}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M142 ${GROUND} Q146 196 148 150 H158 Q160 196 166 ${GROUND}Z"/>${hill}`,
      );
    case "waves":
      return g(
        `<path d="M0 196 Q25 184 50 196 T100 196 T150 196 T200 196 V260 H0Z" opacity=".7"/><path d="M150 ${GROUND} V176 Q150 160 162 160 Q174 160 174 176 V${GROUND}Z"/>`,
      );
    case "totem":
      return g(
        `<rect x="156" y="120" width="18" height="112"/><path d="M146 130 H184 L178 122 H152Z"/><path d="M0 180 L22 150 L44 176 L70 140 L96 190 V260 H0Z" opacity=".6"/>${hill}`,
      );
    default:
      return g(hill + `<circle cx="${f(30 + r() * 140)}" cy="60" r="14" opacity=".3"/>`);
  }
}

/** 미니어처 받침 @param {{ metal: string, dark: string }} c @param {number} [rx] */
export function base(c, rx = 58) {
  return `<ellipse cx="100" cy="${GROUND + 9}" rx="${rx + 8}" ry="10" fill="#000" opacity=".55" filter="url(#soft)"/>
<path d="M${100 - rx} ${GROUND} v7 a${rx} 11 0 0 0 ${rx * 2} 0 v-7Z" fill="url(#dark)"/>
<ellipse cx="100" cy="${GROUND}" rx="${rx}" ry="11" fill="${mix(c.dark, c.metal, 0.25)}"/>
<ellipse cx="100" cy="${GROUND}" rx="${rx}" ry="11" fill="none" stroke="${c.metal}" stroke-opacity=".6" stroke-width="1.2"/>`;
}

/** 발치의 작은 인간들 (신과 인간의 크기 대비) @param {string} tone @param {() => number} r */
export function mortals(tone, r) {
  return [24, 44, 158, 178]
    .map((x) => {
      const s = 0.7 + r() * 0.25;
      const y = GROUND + 18;
      return `<g transform="translate(${x} ${y}) scale(${f(s)})" fill="${tone}"><circle cy="-26" r="3.6"/><path d="M-4 -22 H4 L5 -8 L3 0 H1 L0 -8 L-1 0 H-3 L-5 -8Z"/><path d="M5 -30 L6 2" stroke="${tone}" stroke-width="1.2"/><circle cx="-6" cy="-15" r="4.4"/></g>`;
    })
    .join("");
}

/**
 * 떠다니는 불씨나 빛 알갱이
 * @param {string} color @param {() => number} r @param {number} [count]
 */
export function embers(color, r, count = 18) {
  return Array.from({ length: count }, () => {
    const x = r() * W;
    const y = 30 + r() * 190;
    const s = 0.5 + r() * 1.6;
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(s)}" fill="${color}" opacity="${f(0.35 + r() * 0.6)}"/>`;
  }).join("");
}

/** 번개 줄기 @param {string} color @param {() => number} r @param {number} x0 @param {number} y0 */
export function lightning(color, r, x0 = 150, y0 = 0) {
  let x = x0;
  let y = y0;
  let d = `M${f(x)} ${f(y)}`;
  while (y < 150) {
    x += -14 + r() * 22;
    y += 10 + r() * 16;
    d += ` L${f(x)} ${f(y)}`;
  }
  return `<path d="${d}" stroke="${color}" stroke-width="5" fill="none" opacity=".35" filter="url(#soft)"/><path d="${d}" stroke="#ffffff" stroke-width="1.3" fill="none" opacity=".9"/>`;
}

/** 마무리: 안개, 질감, 가장자리 어둡게 */
export function finish() {
  return `<rect y="150" width="${W}" height="110" fill="url(#fog)" opacity=".55"/>
<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".16"/>
<rect width="${W}" height="${H}" fill="url(#vignette)"/>`;
}

/** 문서로 묶기 @param {string} inner @param {string} [label] */
export const doc = (inner, label = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}"${label ? ` aria-label="${label}"` : ""}>${inner}</svg>`;

/** <img>에 넣을 data URL @param {string} svg */
export const toDataUrl = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
