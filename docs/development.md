# 개발 가이드

## 순수 자바스크립트로 만든 방식

프레임워크 없이 브라우저 표준만 씁니다. Vite는 개발 서버와 번들링에만 쓰고, 실행되는 코드는 모두 직접 작성한 ES 모듈입니다.

| 문제             | 쓰는 방식                                                                                                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 화면 그리기      | `shared/lib/dom.js`의 `h()`로 DOM을 만들고, 화면마다 `view(ctx)`가 새 DOM을 돌려줍니다.                                                                                                                                                                                         |
| 다시 그리기      | `shared/lib/morph.js`가 기존 DOM을 새 DOM 모양으로 고칩니다. 같은 요소를 남기므로 초점, 스크롤, CSS 전환이 이어집니다. `data-key`로 목록 항목을 짝짓고, 짝이 없는 노드를 먼저 지운 뒤 순서가 실제로 바뀐 노드만 옮깁니다. (노드를 옮기면 CSS 애니메이션이 처음부터 다시 돕니다) |
| 이벤트           | 요소마다 리스너를 붙이지 않고 `document`에서 `data-action`을 읽어 화면의 `actions`로 보냅니다. 패치 뒤에도 낡은 클로저가 남지 않습니다.                                                                                                                                         |
| 화면 이동        | 해시 주소(`#/codex`)로 고릅니다. 정적 호스팅 어디서나 새로 고침과 뒤로 가기가 됩니다.                                                                                                                                                                                           |
| 상태             | `app/model/store.js` 하나. 진행 중인 판(`run`)은 바뀔 때마다 `localStorage`에 저장합니다.                                                                                                                                                                                       |
| 대화상자         | 네이티브 `<dialog>`와 `showModal()`. 닫으면 연 요소로 초점을 돌려줍니다.                                                                                                                                                                                                        |
| 화면 낭독기 알림 | `shared/lib/announce.js`의 공용 `role="status"` 영역. 카드를 내거나 턴을 넘길 때 전투 기록을 읽어 줍니다.                                                                                                                                                                       |

화면이 바뀌면(주소나 판의 단계가 바뀌면) 새로 그리고 제목(`h1`)으로 초점을 옮깁니다. 같은 화면 안의 변화는 패치만 합니다. 화면은 `afterRender`로 그린 뒤의 일을 할 수 있습니다. 전투 화면은 이 자리에서 지난 체력과 비교해 떠오르는 숫자와 흔들림을 줍니다(`pages/run/ui/battle-fx.js`). 패치가 모르는 요소와 속성은 지워지므로, 숫자는 본문 밖의 효과 층에 그리고 흔들림은 Web Animations API로 줍니다.

## 그림

카드·괴물·전장·무구 그림은 그 신화를 그린 옛 회화·판화·삽화와 박물관 소장품입니다. 모두 Wikimedia Commons의 퍼블릭 도메인·CC0·CC 라이선스 자료이고, 저작권이 남은 그림(작가 사후 70년이 지나지 않은 그림, Pinterest 같은 곳에 다시 올라온 그림)은 쓰지 않습니다.

- 고른 그림: `scripts/illustrations/picks.json`에 대상 키(`figure:<slug>`, `enemy:<id>`, `field:<id>`, `arm:<id>`, `card:<id>`)마다 Commons 파일 이름과 초점(`pos`)을 적습니다. 초점은 얼굴이나 눈길이 모이는 곳으로, 카드처럼 잘라 보여 줄 때 `object-position`이 됩니다.
- 받기: `pnpm illustrations`가 그림을 받아 `public/illust/l/`(긴 변 800px)과 `public/illust/s/`(너비 480px)에 WebP로 줄이고(원본보다 늘리지 않음, 투명한 부분은 종이색으로 채움), 화면이 읽는 목록(`src/shared/ui/artwork/artworks.json`, 너비·높이·초점)과 출처(`scripts/illustrations/credits.json`, `docs/credits.md`)를 다시 씁니다. 이미 받은 그림은 건너뛰고, `--force`면 모두 다시 받습니다. macOS `sips`와 `cwebp`(brew install webp)가 필요합니다.
- 쓰기: 엔티티의 `cardArt`·`enemyArt`·`battlefieldArt`·`armamentArt`가 img 속성(`src`, `srcset`, `sizes`, 크기, 초점, 지연 받기)을 줍니다. 화면에서는 `h("img", { ...cardArt(card, { sizes: "220px" }), alt: "" })`처럼 펼쳐 씁니다. 첫 화면에 바로 보이는 그림은 `eager: true`로 받습니다.
- 새 신: Ark 동기화로 신이 늘면 `picks.json`에 그림을 더하고 `pnpm illustrations`를 실행합니다. 그림이 없는 동안에는 서가 그림이 대신 나오고, `card/lib/illustration.test.js`가 빠진 대상을 알려 줍니다.
- 히든 카드 유신의 그림은 그린 분의 허락을 받아 실은 파일(`public/art/hidden/`)을 그대로 씁니다.

## 기록과 오늘의 신화

- `features/run/model/records.js`의 `recordRun`이 run이 바뀔 때마다 덱의 신을 서가 복원 목록(`records.seen`)에 더하고, 끝난 판을 한 번만 셉니다. 저장소(`app/model/store.js`)는 그 결과를 `zero:records`에 씁니다.
- `features/run/model/daily.js`는 한국 시간 날짜(`2026-11-10`)를 FNV-1a로 시드로 바꿉니다. `#/new/daily`는 이 시드로 길잡이 후보를 고르고, run에 `daily` 날짜를 남겨 그날의 가장 좋은 결과를 기록합니다.

## 계층 (Feature-Sliced Design v2.1)

| 계층       | 슬라이스                                                 | 하는 일                                                                                 |
| ---------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `app`      | `entrypoint`, `model`, `routing`, `render`, `styles`     | 글꼴과 전역 스타일, 상태 저장소, 라우터, 렌더 루프와 이벤트 위임                        |
| `pages`    | `title`, `new-run`, `run`, `codex`, `guide`, `not-found` | 화면. `run`은 판의 단계(지도·전투·보상·쉼터·성소·사건·고르기·결과)마다 보기를 고릅니다. |
| `widgets`  | `site-header`, `card-detail`, `deck-view`                | 여러 화면이 함께 쓰는 덩어리                                                            |
| `features` | `run`                                                    | 전투 엔진과 한 판의 흐름. 모든 함수는 상태를 복사해 새 상태를 돌려주는 순수 함수입니다. |
| `entities` | `figure`, `card`, `enemy`, `relic`, `map`                | Ark 데이터, 카드 생성 규칙과 카드 앞면, 괴물, 유물, 지도 생성                           |
| `shared`   | `lib`, `ui`, `config`                                    | DOM 도구, 시드 난수, 조사 붙이기, 저장소, 대화상자, Ark 주소                            |

- 슬라이스는 공개 API(`index.js`)로만 가져옵니다. 카드가 신화 데이터를 읽는 것만 `entities/figure/@x/card.js`로 엽니다.
- `package.json`의 `imports`(`#entities/*` 등)를 별칭으로 쓰고, Steiger가 같은 경로를 읽도록 `tsconfig.json`의 `paths`에도 적었습니다.
- 타입은 JSDoc으로 적고 `pnpm check`(`tsc --checkJs`)로 검사합니다.

## Ark 데이터 동기화

`pnpm sync:ark`는 옆 폴더의 Ark 저장소(`ARK_DIR`, 기본 `../Ark`)에서 목업 데이터를 읽습니다.

- Ark의 TypeScript 목업을 Node의 타입 지우기로 그대로 가져옵니다.
- 신화 계열, 신과 영웅, 신마다 첫 번째 자료의 그림 정보(제목, 대체 텍스트, 소장처, 저작자, 라이선스, 원본 주소)를 `src/entities/figure/data/*.json`에 씁니다.
- 그림은 macOS `sips`로 긴 변 420px JPEG로 줄여 `public/art/`에 둡니다. (290점, 약 10MB)
- 탈것·동반자 짝(`figure/model/bonds.ts`)을 `src/entities/bond/data/bonds.json`에 씁니다. 짝마다 붙는 효과는 ZERO의 게임 규칙이라 `entities/bond/model/bonds.js`의 `BOND_RULES`에 둡니다.
- 결과물을 커밋하므로 Ark 저장소가 없어도 빌드됩니다.
- 끝에서 출처 목록(`docs/credits.md`)도 다시 만듭니다.

## 출처

화면에는 그림·글꼴·참고 자료의 출처를 적지 않습니다. 카드 상세와 도감, 안내에는 README의 출처 표로 가는 링크(`CREDITS_URL`) 하나만 둡니다.

- README의 `## 출처`: 글꼴, 자료 묶음별 저작자·사용 허락·원본을 한 표로 적습니다.
- `docs/credits.md`: 그림 한 점, 참고한 글 하나까지 적은 전체 목록입니다. `pnpm credits`가 `art.json`, 무구의 `sources`, 전장의 `source`에서 만듭니다. 직접 고치지 않으며 Prettier에서도 뺍니다.
- 데이터를 바꾸고 목록을 다시 만들지 않으면 `scripts/credits.test.js`가 실패합니다.

## 이름 글꼴

카드·무구·유물·전장 이름은 나눔명조 ExtraBold(800)를 이름에 쓰인 글자만 남겨 줄인 `src/app/styles/fonts/zero-names.woff2`(약 43KB)로 씁니다. Ark 제목과 같은 글꼴이라 두 프로젝트가 한 세계로 이어집니다. 글자 묶음 조각을 그대로 쓰면 이름 322개가 모인 도감에서 조각을 수십 개 받기 때문에 한 파일로 줄였습니다. 나눔명조는 OFL 예약 이름(Nanum)이 있어 줄인 파일의 글꼴 이름은 ZeroNames입니다.

새 카드나 이름 변경으로 글자가 늘면 `name-font.test.js`가 빠진 글자를 알려 줍니다. 그때 다시 만듭니다.

```bash
UPDATE_NAME_FONT=1 pnpm exec vitest run name-font   # 글자 목록 갱신
pip install fonttools brotli && pnpm subset:name-font  # 서브셋 다시 만들기
```

## 전설 확장 데이터

Ark에 아직 없는 전설의 영웅·인물은 `scripts/legends/`에서 먼저 만들어 ZERO에 넣고, 나중에 Ark로 옮깁니다. 0.4.0에서 더한 149명(새 계열 8개)은 Ark 0.14.0으로 옮겨 이제 Ark의 기록을 따릅니다.

- `data.py`에 계열과 인물(이름, 별칭, 관장 영역, 소개 두 문단, 희귀도, 위키백과 제목)을 Ark와 같은 모양으로 적습니다.
- `python3 scripts/legends/build.py`가 위키백과 API로 문서가 있는지 확인해(한국어 문서가 있으면 한국어, 없으면 영어) `src/entities/figure/data/legends.json`을 씁니다.
- `entities/figure`가 Ark 데이터(`source: "ark"`)와 합쳐 쓰며, 전설 확장(`source: "zero"`)은 카드 상세에서 Ark 대신 위키백과로 잇고 소개 문단을 직접 보여 줍니다.
- 같은 인물이나 계열이 Ark에 들어오면 `pnpm sync:ark` 뒤 자동으로 Ark의 기록을 따르고, 희귀도만 `legends.json`의 것을 씁니다. (Ark의 순서로 정하면 아킬레우스 같은 영웅이 일반 카드가 되기 때문입니다)

## 검사

| 검사             | 명령             | 내용                                                                                                                                                                                                                                                                                   |
| ---------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 단위·화면 테스트 | `pnpm test`      | 카드 생성, 전투 규칙, 한 판의 흐름, DOM 패치, 조사, 카드 앞면의 접근 가능한 이름                                                                                                                                                                                                       |
| 난이도           | `pnpm test`      | 자동 플레이어 100판의 승률이 3~40%이고 1장에서 절반 넘게 지지 않는지                                                                                                                                                                                                                   |
| E2E              | `pnpm test:e2e`  | 프로덕션 빌드에서 한 판 흐름, 키보드 조작, 새로 고침 뒤 이어 하기, 모바일 가로 넘침, axe                                                                                                                                                                                               |
| 스토리           | `pnpm storybook` | 카드 앞면, 무구, 유물, 머리글, 카드 상세, 그림(초점 자르기). addon-a11y로 접근성을 봅니다. `pnpm build`가 `dist/storybook`에 함께 빌드해 배포 주소의 `/storybook/index.html`로 열립니다. 이때 `public`은 복사하지 않고(`STORYBOOK_SHARED_PUBLIC`) 같은 주소에 있는 앱의 그림을 씁니다. |

| 번들 크기 | `pnpm size` | 첫 화면 JS 195 kB, CSS 10 kB(gzip) 예산. `.size-limit.json` |
| Lighthouse | `pnpm lhci` | 처음 화면·도감·도움말을 데스크톱 기준 3번씩 재서 성능 90, 접근성 100, 권장 사항 95, SEO 90점과 LCP 2.5초·TBT 200ms·CLS 0.1 이하인지. `lighthouserc.json` |

E2E는 동작 줄이기(`reducedMotion: "reduce"`) 환경에서 돕니다. 화면 전환 중 배경색이 바뀌는 사이에 명도 대비를 재는 오탐을 막고, 동작 줄이기 경로도 함께 검사합니다.

## 모니터링

`src/app/monitoring`이 처음 화면을 그리기 전에 켜지고, Sentry와 web-vitals는 나중에 따로 받습니다. Sentry는 페이지를 다 받은 뒤(load) 브라우저가 한가할 때 받고, load가 10초 안에 오지 않으면 그때 바로 받습니다. 오류에 붙는 콜백 인수와 Error가 아닌 일반 객체로 거부된 Promise의 필드 값(`extra.__serialized__`)은 보내지 않습니다.

| 환경 변수         | 내용                                                                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_SENTRY_DSN` | 있으면 처리하지 못한 오류와 나쁜(poor) Web Vitals를 Sentry로 보냅니다. 없으면 Sentry를 번들에 넣지 않고, 개발 모드에서 Web Vitals를 콘솔에만 찍습니다 |
| `VITE_RELEASE`    | (선택) Sentry에 남길 릴리스 이름                                                                                                                      |

Sentry에는 오류 내용만 보내고 사용자 정보·쿠키·헤더·쿼리 문자열, 방문 기록(세션), 이동·클릭 기록(브레드크럼), 콘솔 기록, 감싼 콜백의 인수는 모으지 않습니다. DSN이 없는 배포에서는 web-vitals도 불러오지 않습니다. Sentry를 받기 전에 난 오류는 최대 20개까지 모아 두었다가 처리되지 않은 오류로 보냅니다. 쓰는 함수만 `sentry.js`에서 다시 내보내 약 31 kB(gzip)로 받습니다. 모듈 전체를 불러오면 리플레이·피드백까지 들어가 140 kB가 됩니다.

## 저장된 판과 듀얼

저장된 판은 `features/run/model/run.js`의 `migrateRun`이 옛 형식을 바꾸고 `isRunUsable`이, 듀얼은 `pages/duel/model/duel.js`의 `isDuelUsable`이 확인합니다. 카드·유물·무구·동반자가 Ark 동기화로 바뀌거나 빠졌으면, 또는 전투 더미·상태 이상 칸이 어긋나면 그 기록을 버리고 처음 화면으로 갑니다. 옛 저장에 없던 전투 더미는 빈 더미로 채웁니다.

상태 안의 난수는 `shared/lib/rng.js`의 `rollWith`, 손패 최대 장수는 `shared/config`의 `MAX_HAND`, 동작 줄이기 감지는 `shared/lib/motion.js`의 `prefersReducedMotion`을 씁니다.

## 의존성 갱신 (Dependabot)

`.github/dependabot.yml`이 npm 패키지를 매주 확인합니다. Storybook 묶음과 린트 묶음(ESLint·Steiger·FSD 플러그인)은 주 버전까지 한 PR로 묶고, 나머지 패키지는 부 버전·패치만 한 PR로 묶습니다. 그 밖의 주 버전은 따로 PR이 열립니다. GitHub Actions는 매달 올립니다. 어느 PR이든 CI가 통과할 때만 병합합니다.

## 배포

Vercel 프로젝트 `zero-myth`가 GitHub에 연결되어 `main`에 합치면 프로덕션(https://zero-ryushin01.vercel.app/)에 배포합니다.

- `vercel.json`의 `git.deploymentEnabled`로 모든 브랜치(`**`)의 배포를 끄고 `main`만 켭니다. 한 브랜치가 여러 규칙에 걸리면 하나라도 켜진 규칙이 이기므로 `main`만 배포되고, PR 브랜치는 이름과 상관없이 배포하지 않습니다. 무료 플랜은 하루 배포가 100회라, PR마다 미리보기를 만들면 하루에 한도를 다 써 버리기 때문입니다. 빌드를 건너뛰는 `ignoreCommand`는 취소된 배포도 한도에 세므로 쓰지 않습니다.
- 미리보기 대신 CI가 프로덕션 빌드로 E2E(axe 포함)를 돌립니다. 화면을 직접 보려면 `pnpm build && pnpm preview`로 확인합니다.
- 한도는 달력의 하루가 아니라 최근 24시간(86,400초)에 만든 배포 수로 세므로, 자정이 지나도 바로 풀리지 않을 수 있습니다. 한도에 걸렸을 때는 여유가 생긴 뒤 임시 복제본에서 `vercel link --yes --project zero-myth`, `vercel deploy --prod --yes`로 올리고, 끝나면 복제본을 `.env.local`째 지웁니다.
