import { item, shield } from "./items.js";
import { f, mix } from "./kit.js";

/**
 * 사람 모양의 신과 영웅. 발이 (0,0)에 오고 키는 약 175입니다.
 * 팔다리는 굵은 둥근 선으로 그려 관절 각도만으로 자세를 바꿉니다.
 *
 * @typedef {"warrior" | "robed" | "gown" | "giant" | "demon" | "hag"} Body
 * @typedef {"raise" | "thrust" | "hold" | "cast" | "rest" | "ground"} Pose
 * @typedef {{
 *   body: Body, head: string, item: string, pose: Pose,
 *   shield?: boolean, cape?: boolean, wings?: string | false, arms?: 2 | 4,
 *   oneHand?: boolean, beard?: boolean, hair?: string, noLegs?: boolean,
 *   longHair?: boolean, collar?: string, sleeves?: boolean, hipHand?: boolean,
 *   skin: string, cloth: string, metal: string, glow: string, dark: string,
 * }} FigureSpec
 */

const P = {
  head: [0, -158],
  neck: [0, -146],
  shoulderL: [-20, -138],
  shoulderR: [20, -138],
  hipL: [-10, -88],
  hipR: [10, -88],
};

/** 오른손(그림의 오른쪽)의 자세: [팔꿈치, 손, 지물 각도] */
const POSES = {
  raise: { elbow: [36, -152], hand: [44, -170], angle: 32 },
  thrust: { elbow: [38, -132], hand: [54, -136], angle: 38 },
  hold: { elbow: [32, -114], hand: [36, -98], angle: 0 },
  cast: { elbow: [40, -124], hand: [54, -142], angle: 20 },
  rest: { elbow: [28, -110], hand: [30, -88], angle: -8 },
  ground: { elbow: [30, -112], hand: [34, -94], angle: 176 },
};

/** @param {number[][]} pts @param {string} stroke @param {number} w */
const limb = (pts, stroke, w) =>
  `<path d="M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(" L")}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;

/** 머리와 머리 장식 @param {FigureSpec} s */
function head(s) {
  const [x, y] = P.head;
  const skin = "url(#skin)";
  const face = `<ellipse cx="${x}" cy="${y}" rx="10" ry="12" fill="${skin}"/><path d="M-7 ${y - 2} Q0 ${y - 5} 7 ${y - 2}" stroke="#000" stroke-opacity=".45" stroke-width="2.2" fill="none"/><path d="M1 ${y - 1} L3 ${y + 5} L0 ${y + 6}" stroke="#000" stroke-opacity=".3" stroke-width="1.2" fill="none"/>`;
  const hair = s.hair
    ? `<path d="M-11 ${y - 2} Q-12 ${y - 16} 0 ${y - 15} Q12 ${y - 16} 11 ${y - 2} Q14 ${y + 14} 9 ${y + 22} L6 ${y + 6} Q0 ${y - 9} -6 ${y + 6} L-9 ${y + 22} Q-14 ${y + 14} -11 ${y - 2}Z" fill="${s.hair}"/>`
    : "";
  const beard = s.beard
    ? `<path d="M-8 ${y + 4} Q0 ${y + 26} 8 ${y + 4} Q0 ${y + 10} -8 ${y + 4}Z" fill="${s.hair ?? "#2a221a"}"/>`
    : "";
  const metal = "url(#metal)";
  const animal = (snout, ears) =>
    `<path d="M-9 ${y + 4} Q-12 ${y - 12} 0 ${y - 13} Q8 ${y - 12} 10 ${y - 4} L${snout[0]} ${snout[1]} L8 ${y + 6} Q0 ${y + 12} -9 ${y + 4}Z" fill="url(#dark)"/>${ears}`;
  switch (s.head) {
    case "helm":
      return `${face}${beard}<path d="M-12 ${y + 2} Q-13 ${y - 18} 0 ${y - 18} Q13 ${y - 18} 12 ${y + 2} L9 ${y + 2} L8 ${y - 4} H-8 L-9 ${y + 2}Z" fill="${metal}"/><path d="M0 ${y - 18} Q-6 ${y - 34} 12 ${y - 34} Q4 ${y - 28} 6 ${y - 18}" fill="${s.cloth}"/>`;
    case "wingedhelm":
      return `${face}<path d="M-11 ${y - 2} Q-11 ${y - 16} 0 ${y - 16} Q11 ${y - 16} 11 ${y - 2}Z" fill="${metal}"/><path d="M-11 ${y - 8} L-24 ${y - 18} L-12 ${y - 4}Z M11 ${y - 8} L24 ${y - 18} L12 ${y - 4}Z" fill="#e8dcbc"/>`;
    case "crown":
      return `${hair}${face}${beard}<path d="M-10 ${y - 9} L-10 ${y - 20} L-5 ${y - 14} L0 ${y - 23} L5 ${y - 14} L10 ${y - 20} L10 ${y - 9}Z" fill="${metal}"/>`;
    case "horned":
      return `${hair}${face}${beard}<path d="M-8 ${y - 10} Q-22 ${y - 16} -20 ${y - 32} Q-14 ${y - 20} -4 ${y - 14}Z M8 ${y - 10} Q22 ${y - 16} 20 ${y - 32} Q14 ${y - 20} 4 ${y - 14}Z" fill="#e8dcbc"/>`;
    case "antlers":
      return `${hair}${face}${beard}<path d="M-6 ${y - 10} L-14 ${y - 30} L-24 ${y - 38} M-14 ${y - 30} L-8 ${y - 42} M-18 ${y - 34} L-28 ${y - 30} M6 ${y - 10} L14 ${y - 30} L24 ${y - 38} M14 ${y - 30} L8 ${y - 42} M18 ${y - 34} L28 ${y - 30}" stroke="#d9c7a0" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
    case "hood":
      return `${face}${beard}<path d="M-15 ${y + 14} Q-16 ${y - 22} 0 ${y - 22} Q16 ${y - 22} 15 ${y + 14} L10 ${y + 10} Q10 ${y - 10} 0 ${y - 11} Q-10 ${y - 10} -10 ${y + 10}Z" fill="url(#cloth)"/>`;
    case "widehat":
      return `${face}${beard}<path d="M-24 ${y - 8} Q0 ${y - 16} 24 ${y - 8} Q12 ${y - 12} 8 ${y - 26} Q0 ${y - 30} -8 ${y - 26} Q-12 ${y - 12} -24 ${y - 8}Z" fill="url(#cloth)"/>`;
    case "cap":
      return `${face}${beard}<path d="M-11 ${y - 6} Q-10 ${y - 22} 6 ${y - 24} Q14 ${y - 22} 10 ${y - 14} L11 ${y - 6}Z" fill="url(#cloth)"/>`;
    case "veil":
      return `${face}<path d="M-13 ${y + 26} Q-16 ${y - 18} 0 ${y - 18} Q16 ${y - 18} 13 ${y + 26} L9 ${y + 20} Q10 ${y - 8} 0 ${y - 10} Q-10 ${y - 8} -9 ${y + 20}Z" fill="url(#cloth)" opacity=".92"/>`;
    case "sun":
      return `<circle cx="${x}" cy="${y - 4}" r="26" fill="${s.glow}" opacity=".35" filter="url(#soft)"/><circle cx="${x}" cy="${y - 4}" r="20" fill="none" stroke="${metal}" stroke-width="3"/>${Array.from({ length: 12 }, (_, i) => `<path d="M0 ${y - 28} V${y - 36}" stroke="${s.glow}" stroke-width="2" transform="rotate(${i * 30} 0 ${y - 4})"/>`).join("")}${hair}${face}${beard}`;
    case "moon":
      return `${hair}${face}${beard}<path d="M-4 ${y - 30} A12 12 0 1 0 12 ${y - 16} A9 9 0 1 1 -4 ${y - 30}Z" fill="#f4efe0"/>`;
    case "feathers":
      return `${face}${beard}${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${y - 8} L${-4 + (i - 4) * 7} ${y - 40 + Math.abs(i - 4) * 4}" stroke="${["#1f8a7a", "#e3b23c", "#c8501e"][i % 3]}" stroke-width="5" stroke-linecap="round"/>`).join("")}<path d="M-12 ${y - 8} H12 V${y - 13} H-12Z" fill="${metal}"/>`;
    case "jackal":
      return animal(
        [22, y + 4],
        `<path d="M-6 ${y - 10} L-4 ${y - 34} L4 ${y - 12}Z M2 ${y - 12} L8 ${y - 34} L12 ${y - 8}Z" fill="url(#dark)"/><path d="M-14 ${y + 22} Q-16 ${y} -8 ${y - 6} M14 ${y + 22} Q16 ${y} 8 ${y - 6}" stroke="#2a4fa0" stroke-width="5"/>`,
      );
    case "falcon":
      return `${animal([20, y + 2], `<path d="M18 ${y + 2} Q22 ${y + 8} 14 ${y + 8}" fill="url(#metal)"/>`)}<path d="M-14 ${y + 22} Q-16 ${y} -8 ${y - 6} M14 ${y + 22} Q16 ${y} 8 ${y - 6}" stroke="#2a4fa0" stroke-width="5"/>`;
    case "ibis":
      return `${animal([10, y], "")}<path d="M8 ${y - 2} Q26 ${y + 4} 32 ${y + 22}" stroke="url(#dark)" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M-14 ${y + 22} Q-16 ${y} -8 ${y - 6} M14 ${y + 22} Q16 ${y} 8 ${y - 6}" stroke="#2a4fa0" stroke-width="5"/>`;
    case "cat":
      return animal(
        [16, y + 4],
        `<path d="M-8 ${y - 8} L-8 ${y - 24} L0 ${y - 12}Z M2 ${y - 12} L8 ${y - 24} L10 ${y - 6}Z" fill="url(#dark)"/>`,
      );
    case "setanimal":
      return animal(
        [22, y + 8],
        `<path d="M-4 ${y - 10} L-8 ${y - 34} H-2 L2 ${y - 12}Z M2 ${y - 12} L4 ${y - 34} H10 L8 ${y - 8}Z" fill="url(#dark)"/>`,
      );
    case "cowhorns":
      return `${hair}${face}<path d="M-6 ${y - 12} Q-24 ${y - 18} -16 ${y - 40} M6 ${y - 12} Q24 ${y - 18} 16 ${y - 40}" stroke="${metal}" stroke-width="3.4" fill="none"/><circle cx="0" cy="${y - 30}" r="9" fill="${s.glow}"/>`;
    case "elephant":
      return `<ellipse cx="-16" cy="${y - 2}" rx="11" ry="14" fill="url(#skin)"/><ellipse cx="16" cy="${y - 2}" rx="11" ry="14" fill="url(#skin)"/><ellipse cx="0" cy="${y - 2}" rx="12" ry="13" fill="url(#skin)"/><path d="M-3 ${y + 6} Q-6 ${y + 26} 6 ${y + 34}" stroke="url(#skin)" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M5 ${y + 6} L12 ${y + 14}" stroke="#f4efe0" stroke-width="2.6"/><path d="M-8 ${y - 13} L-8 ${y - 24} L-3 ${y - 18} L0 ${y - 27} L3 ${y - 18} L8 ${y - 24} L8 ${y - 13}Z" fill="${metal}"/>`;
    case "monkey":
      return `${face}<ellipse cx="0" cy="${y + 4}" rx="7" ry="6" fill="${mix(s.skin, "#ffffff", 0.3)}"/><circle cx="-12" cy="${y - 2}" r="4" fill="url(#skin)"/><circle cx="12" cy="${y - 2}" r="4" fill="url(#skin)"/><path d="M-10 ${y - 9} L-10 ${y - 18} L0 ${y - 22} L10 ${y - 18} L10 ${y - 9}Z" fill="${metal}"/>`;
    case "lion":
      return `${face}${beard}<path d="M-16 ${y + 22} Q-20 ${y - 4} -10 ${y - 16} Q0 ${y - 24} 10 ${y - 16} Q20 ${y - 4} 16 ${y + 22} L10 ${y + 14} Q12 ${y - 8} 0 ${y - 10} Q-12 ${y - 8} -10 ${y + 14}Z" fill="#b5823c"/><circle cx="-6" cy="${y - 16}" r="2" fill="#2a1a0a"/><circle cx="6" cy="${y - 16}" r="2" fill="#2a1a0a"/>`;
    case "jaguar":
      return `${animal([18, y + 4], `<circle cx="-6" cy="${y - 12}" r="4" fill="url(#dark)"/><circle cx="8" cy="${y - 12}" r="4" fill="url(#dark)"/>`)}${[-4, 4, 0].map((dx, i) => `<circle cx="${dx}" cy="${y - 4 + i * 5}" r="1.6" fill="#e3b23c"/>`).join("")}`;
    case "snakes":
      return `${face}${Array.from({ length: 7 }, (_, i) => `<path d="M${-10 + i * 3.4} ${y - 6} q${-8 + i * 2.6} -10 ${-14 + i * 4.6} -6" stroke="#4f7a3a" stroke-width="2.6" fill="none"/>`).join("")}`;
    case "demon":
      return `${hair}<ellipse cx="${x}" cy="${y}" rx="12" ry="13" fill="${skin}"/><path d="M-6 ${y + 4} H6 L4 ${y + 8} H-4Z" fill="#f4efe0"/><circle cx="-4" cy="${y - 3}" r="2" fill="${s.glow}"/><circle cx="4" cy="${y - 3}" r="2" fill="${s.glow}"/><path d="M-8 ${y - 10} Q-16 ${y - 22} -12 ${y - 30} M8 ${y - 10} Q16 ${y - 22} 12 ${y - 30}" stroke="#e8dcbc" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
    case "fourfaced":
      return `<ellipse cx="-12" cy="${y + 1}" rx="8" ry="11" fill="url(#skin)"/><ellipse cx="12" cy="${y + 1}" rx="8" ry="11" fill="url(#skin)"/>${face}${beard}<path d="M-14 ${y - 9} H14 L10 ${y - 24} H-10Z" fill="${metal}"/>`;
    case "tenheads":
      return `${[-24, -12, 12, 24].map((dx) => `<ellipse cx="${dx}" cy="${y + 4 - Math.abs(dx) / 6}" rx="7" ry="8" fill="url(#skin)"/>`).join("")}${[-18, 0, 18].map((dx) => `<ellipse cx="${dx}" cy="${y - 14}" rx="7" ry="8" fill="url(#skin)"/>`).join("")}${face}<path d="M-8 ${y - 22} L0 ${y - 36} L8 ${y - 22}Z" fill="${metal}"/>`;
    case "mask":
      return `${face}<path d="M-12 ${y - 6} H12 V${y + 6} H-12Z" fill="#1f8a7a"/><circle cx="-5" cy="${y}" r="3.6" fill="none" stroke="#e3b23c" stroke-width="1.6"/><circle cx="5" cy="${y}" r="3.6" fill="none" stroke="#e3b23c" stroke-width="1.6"/><path d="M-12 ${y - 6} L-6 ${y - 22} L0 ${y - 10} L6 ${y - 22} L12 ${y - 6}Z" fill="#e3b23c"/>`;
    case "wreath":
      return `${hair}${face}${beard}${Array.from({ length: 7 }, (_, i) => `<ellipse cx="${-11 + i * 3.6}" cy="${y - 12 - Math.sin((i / 6) * Math.PI) * 3}" rx="2.4" ry="4" fill="#4f7a3a" transform="rotate(${-40 + i * 13} ${-11 + i * 3.6} ${y - 12})"/>`).join("")}`;
    case "hag":
      return `<path d="M-14 ${y + 16} Q-18 ${y - 20} 0 ${y - 22} Q18 ${y - 20} 14 ${y + 16}Z" fill="#c9c2b0"/>${face}<path d="M0 ${y - 2} L6 ${y + 6} L0 ${y + 6}Z" fill="url(#skin)"/>`;
    case "bare":
    default:
      return `${hair}${face}${beard}`;
  }
}

/** @param {FigureSpec} s */
function wings(s) {
  if (!s.wings) return "";
  const color = s.wings === "dark" ? "url(#dark)" : s.wings === "gold" ? "url(#metal)" : "#e8dcbc";
  const feathers = (side) =>
    Array.from({ length: 6 }, (_, i) => {
      const x2 = side * (40 + i * 7);
      return `<path d="M${side * 14} -132 Q${side * (30 + i * 6)} ${-170 + i * 8} ${x2} ${-118 + i * 12} Q${side * (24 + i * 4)} ${-120 + i * 4} ${side * 14} -118Z" fill="${color}" opacity="${f(0.95 - i * 0.07)}"/>`;
    }).join("");
  return feathers(-1) + feathers(1);
}

/**
 * @param {FigureSpec} s
 * @returns {string} 발이 (0,0)인 그룹 내용
 */
export function figure(s) {
  const pose = POSES[s.pose] ?? POSES.hold;
  const skin = "url(#skin)";
  const cloth = "url(#cloth)";
  const armor = s.body === "warrior" || s.body === "giant";
  const torsoFill = armor ? "url(#metal)" : cloth;
  const robe = s.body === "robed" || s.body === "gown" || s.body === "hag";
  const bulk = s.body === "giant" ? 1.18 : s.body === "gown" ? 0.9 : 1;

  const cape = s.cape
    ? `<path d="M-20 -140 Q-46 -80 -58 -4 Q-30 -12 -8 -2 Q-4 -70 -2 -128Z" fill="${cloth}"/><path d="M20 -140 Q34 -90 30 -40 L18 -60Z" fill="${cloth}" opacity=".8"/>`
    : "";

  const legs =
    robe || s.noLegs
      ? ""
      : limb([P.hipL, [-15, -46], [-24, -2]], skin, 13 * bulk) +
        limb([P.hipR, [16, -46], [22, -2]], skin, 13 * bulk) +
        `<path d="M-30 -2 H-14 V2 H-30Z M16 -2 H30 V2 H16Z" fill="url(#dark)"/>`;

  const skirt = robe
    ? `<path d="M-16 -100 Q-30 -40 ${s.body === "gown" ? -40 : -34} 0 Q0 8 ${s.body === "gown" ? 40 : 34} 0 Q30 -40 16 -100Z" fill="${cloth}"/><path d="M-6 -96 Q-10 -40 -12 2 M8 -96 Q12 -40 14 2" stroke="${s.dark}" stroke-opacity=".35" stroke-width="1.4" fill="none"/>`
    : `<path d="M-16 -98 L-22 -62 Q0 -56 22 -62 L16 -98Z" fill="${cloth}"/>${armor ? `<path d="M-20 -72 H20" stroke="url(#metal)" stroke-width="3"/>` : ""}`;

  const torso = `<path d="M${-22 * bulk} -140 Q${-26 * bulk} -122 ${-15 * bulk} -100 H${15 * bulk} Q${26 * bulk} -122 ${22 * bulk} -140 Q0 -148 ${-22 * bulk} -140Z" fill="${torsoFill}"/>${armor ? `<path d="M-12 -128 Q0 -122 12 -128 M-10 -114 Q0 -110 10 -114" stroke="${s.dark}" stroke-opacity=".45" stroke-width="1.4" fill="none"/>` : ""}<path d="M-18 -101 H18 V-96 H-18Z" fill="url(#metal)"/>`;

  // 뒤쪽 팔(그림의 왼쪽): 방패를 들거나 내립니다. 티르처럼 한 손이 없을 수도 있습니다.
  // 허리에 얹은 손: 팔꿈치를 바깥으로 꺾고 손을 허리띠에 둡니다.
  const backHand = s.hipHand ? [-14, -98] : s.shield ? [-32, -118] : s.oneHand ? [-24, -112] : [-30, -92];
  const backElbow = s.hipHand ? [-38, -112] : [-30, -114];
  // 소매: 팔을 천으로 굵게 그리고 손만 살빛으로 둡니다.
  const arm = (pts) =>
    s.sleeves
      ? limb(pts, cloth, 15 * bulk) + `<circle cx="${pts[2][0]}" cy="${pts[2][1]}" r="4.6" fill="${skin}"/>`
      : limb(pts, skin, 10 * bulk);
  const backArm = arm([P.shoulderL, backElbow, backHand]);
  const shieldArt = s.shield ? `<g transform="translate(-36 -116)">${shield(s)}</g>` : "";

  // 팔이 넷인 신: 뒤에 팔 한 쌍을 더 둡니다.
  const extra =
    s.arms === 4
      ? limb(
          [
            [-16, -134],
            [-40, -146],
            [-50, -168],
          ],
          skin,
          8,
        ) +
        limb(
          [
            [16, -134],
            [40, -150],
            [48, -170],
          ],
          skin,
          8,
        ) +
        `<g transform="translate(-50 -168)">${item("flower", s)}</g><g transform="translate(48 -170)">${item("bell", s)}</g>`
      : "";

  const frontArm = arm([P.shoulderR, pose.elbow, pose.hand]);
  const held = `<g transform="translate(${pose.hand[0]} ${pose.hand[1]}) rotate(${pose.angle})">${item(s.item, s, 92)}</g>`;
  const neck = `<path d="M-5 -150 H5 V-140 H-5Z" fill="${skin}"/>`;
  // 등 뒤로 늘어뜨린 긴 머리
  const backHair = s.longHair
    ? `<path d="M-12 -164 Q-20 -130 -16 -96 Q-4 -88 4 -96 Q14 -120 12 -164Z" fill="${s.hair ?? "#111"}"/>`
    : "";
  // 한복 깃: 흰 동정이 V자로 여며지고 고름 두 가닥이 늘어집니다.
  const collar = s.collar
    ? `<path d="M-12 -144 L4 -112 M12 -144 L-2 -124" stroke="${s.collar}" stroke-width="3.4" stroke-linecap="round" fill="none"/><path d="M4 -112 Q8 -96 6 -70 M4 -112 Q12 -98 13 -78" stroke="${s.collar}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`
    : "";
  // 앞머리가 한쪽 눈을 가립니다.
  const bangs = s.longHair
    ? `<path d="M-11 -163 Q0 -175 11 -166 Q13 -156 10 -146 Q8 -155 3 -159 Q-4 -162 -11 -163Z" fill="${s.hair ?? "#111"}"/>`
    : "";

  return `${wings(s)}${backHair}${cape}${extra}${backArm}${legs}${skirt}${torso}${collar}${neck}${head(s)}${bangs}${shieldArt}${frontArm}${held}`;
}
