# AGENTS.md — ZERO (신화 덱빌딩)

AI 코딩 에이전트(Codex, Claude Code 등)가 이 저장소에서 일할 때 지킬 규칙입니다. 자세한 내용은 `docs/development.md`, `docs/card-rules.md`, `docs/accessibility.md`, `README.md`에 있습니다.

## 1. 프로젝트 개요

- 세계 신화 도서관 Ark의 신·영웅·몬스터를 카드로 모으고 신화 무구를 휘둘러 괴물과 태초의 공허 '영(零)'에 맞서는 웹 덱빌딩 게임입니다. 프레임워크 없이 순수 자바스크립트로 만든 포트폴리오이며, 진행 상황은 브라우저에만 저장합니다.
- 화면 축: 웹 게임. 로그인 없음.
- 운영: https://zero-ryushin01.vercel.app/ · Storybook https://zero-ryushin01.vercel.app/storybook/index.html

## 2. 기술 스택과 구조

- 순수 자바스크립트(ES 모듈, 타입은 JSDoc + `tsc --checkJs`), Vite(개발 서버·번들링만), Storybook, Sentry·web-vitals(DSN이 있을 때만).
- 화면은 `shared/lib/dom.js`의 `h()`와 `view(ctx)`, 다시 그리기는 `shared/lib/morph.js`, 이벤트는 `document`의 `data-action` 위임, 화면 이동은 해시 주소(`#/codex`), 상태는 `app/model/store.js` 하나(여러 값은 `ctx.batch()`). 대화상자는 네이티브 `<dialog>`.
- **FSD v2.1.** 층 순서(위→아래): `app` → `pages` → `widgets` → `features` → `entities` → `shared`.
  - 슬라이스는 공개 API(`index.js`)로만 가져옵니다. 엔티티끼리는 교차 공개 API(`@x`)로만 읽습니다(`figure/@x/card.js` 등).
  - 별칭은 `package.json`의 `imports`(`#entities/*` 등)이고 `tsconfig.json`의 `paths`에도 같게 적습니다. `pnpm lint:fsd`(Steiger)로 검사합니다.
  - `features/run`의 전투·판 흐름 함수는 상태를 복사해 새 상태를 돌려주는 순수 함수입니다.
- 신화 데이터는 Ark를 그대로 따릅니다(`pnpm sync:ark`, 결과물은 커밋). 게임 규칙(카드·무구 수치, 짝 효과)은 ZERO에 둡니다(`docs/card-rules.md`).
- 긴 글·Ark 소장 자료는 첫 화면 묶음에 넣지 않고 따로 받습니다(`shared/lib/defer/lazy.js`, `loadArkArt()`).

## 3. 설치·개발 명령

- Node.js 26(`.nvmrc`), pnpm 12(`packageManager`).

```bash
corepack enable pnpm
pnpm install
pnpm dev   # http://localhost:5173
```

- 환경 변수(이름만, `.env.example`): `VITE_SENTRY_DSN`, `VITE_RELEASE`(선택). 도구용: `ARK_DIR`(Ark 저장소 위치, 기본 `../Ark`), `SYNC_SUMMARY`, `BASE_URL`(`pnpm screenshots`).
- 자료 명령: `pnpm sync:ark`(Ark에서 가져오기), `pnpm illustrations`(Commons 그림 받기·초점 찾기, macOS `sips`·`cwebp` 필요), `pnpm fonts`(화면 글자를 바꾼 뒤, fontTools 필요), `pnpm credits`(출처 목록 `docs/credits.md`), `pnpm docs:counts`(문서 속 수량), `pnpm legends`, `pnpm screenshots`.

## 4. 검사·테스트 명령

| 명령                                | 내용                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `pnpm format:check` / `pnpm format` | Prettier 검사 / 정리(Markdown 포함)                                                    |
| `pnpm lint`                         | ESLint                                                                                 |
| `pnpm lint:fsd`                     | Steiger(FSD)                                                                           |
| `pnpm check`                        | `tsc` JSDoc 타입 검사                                                                  |
| `pnpm test`                         | 규칙·전투·화면 단위 테스트, 자동 플레이 100판 난이도(승률 3~40%)                       |
| `pnpm build`                        | 앱 + Storybook(`dist/storybook`)                                                       |
| `pnpm size`                         | 첫 화면 JS 115 kB, CSS 12 kB(gzip) 예산(`.size-limit.js`)                              |
| `pnpm test:e2e`                     | 프로덕션 빌드 E2E(한 판 흐름·키보드·이어 하기·넘침·axe·CSP·오프라인), 동작 줄이기 환경 |
| `pnpm lhci` / `pnpm lhci:mobile`    | 데스크톱 / 휴대폰(느린 4G·CPU 4배) Lighthouse 기준                                     |

- CI(`.github/workflows/ci.yml`, PR·main 푸시, Ark 동기화에서도 호출) 순서: `format:check` → `lint` → `lint:fsd` → `check` → `test` → `build` → `size` → Chromium 설치 → `test:e2e` → `lhci` → `lhci:mobile`.
- 오프라인 검사: `e2e/offline.spec.js`가 localhost 밖 요청을 모두 막은 채 처음 화면·도감·카드 상세·도움말·한 판이 내용과 함께 뜨고 axe 통과·바깥 요청 0건인지 봅니다. 실행 중 Ark·Commons 등 바깥 API를 부르지 않습니다(자료는 `sync:ark`·`illustrations`로 미리 받아 커밋).
- 커밋 훅(husky 등)은 없으므로 PR 전에 위 검사를 직접 돌립니다. CI·배포·동기화 상태는 명령 결과(`gh pr checks`, `gh run list`, 주소 200 확인)로 확인한 뒤에만 말합니다.
- **테스트 원칙: Testing Library.** 구현 세부가 아니라 사용자가 보는 동작을 검사하고, 요소는 역할·이름으로 찾습니다. 표준과 다른 점: 프레임워크가 없어 `@testing-library/*`를 쓰지 않고 Vitest + jsdom에서 직접 DOM을 다룹니다(카드 앞면의 접근 가능한 이름 등 사용자가 보는 결과를 검사). 화면 흐름은 Playwright E2E, 접근성은 axe(`@axe-core/playwright`, Storybook addon-a11y로 스토리 확인. CI는 Storybook을 빌드만 함).

## 5. 코드 스타일

- 서식: Prettier(`.prettierrc.json`, Biome 없음) — 한 줄 120자(나머지는 기본값: 큰따옴표, 세미콜론). Markdown도 Prettier 검사 대상입니다(표 정렬 포함). `docs/credits.md`, 데이터 폴더, 생성 글꼴은 Prettier에서 뺍니다.
- `docs/credits.md`는 직접 고치지 않고 `pnpm credits`로 만듭니다(어긋나면 `scripts/credits.test.js` 실패).
- README·문서 속 수량은 `<!--count:figures-->475<!--/count-->`처럼 표시하고 `pnpm docs:counts`로 갱신합니다(어긋나면 `doc-counts.test.js` 실패).
- 패치(morph)가 모르는 요소·속성은 지워지므로 효과는 본문 밖 층이나 Web Animations API로 줍니다. 목록 항목은 `data-key`로 짝짓습니다.
- 난수는 `shared/lib/rng.js`의 `rollWith`, 동작 줄이기 감지는 `shared/lib/motion.js`의 `prefersReducedMotion`을 씁니다. 저장된 판·듀얼은 `migrateRun`·`isRunUsable`·`isDuelUsable`로 확인합니다.
- 버그를 고치면 고치기 전에 실패하는 테스트를 함께 넣습니다.
- **타입: JSDoc + `tsc --checkJs`.** 표준과 다른 점: TypeScript 파일이 없는 순수 자바스크립트라 `tsconfig.json`이 `allowJs`·`checkJs`를 켜고 `strict`는 `false`입니다. `any`·`@ts-ignore`는 피하고, 외부 입력(저장된 판·듀얼, 기록 파일)은 `isRunUsable`·`isDuelUsable` 등으로 검사합니다.
- **접근성: WCAG 2.2·KWCAG 2.2**(`docs/accessibility.md`). 네이티브 요소 우선(`<button type="button">`, `<dialog>`), 텍스트 대비 4.5:1 이상, 키보드로 한 판 전체, 초점 표시 유지(`outline: none` 단독 금지), 조작 크기 24px 이상, 입력 레이블과 오류 연결, 전투 기록 등 바뀌는 안내는 `shared/lib/announce.js`의 `role="status"`, 화면이 바뀌면 `h1`로 초점 이동, 카드 앞면의 접근 가능한 이름. 자동 검사는 axe(Playwright E2E, Storybook addon-a11y)와 Lighthouse 접근성 100점(데스크톱·휴대폰)입니다(JSX가 없어 eslint-plugin-jsx-a11y는 쓰지 않음).

## 6. Git·PR

- **흐름: GitHub Flow.** `main`에 직접 커밋·푸시하지 않습니다. 최신 `main`에서 브랜치를 만들어 PR로만 병합합니다. PR은 목적 하나로 작게, 본문에 무엇·왜·검사 결과를 적습니다. `sync/ark`는 동기화 워크플로 전용입니다.
- **브랜치 이름:** `feat/…`, `fix/…`, `refactor/…`, `docs/…`, `test/…`, `chore/…`, `release/…`(예: `feat/code-split`, `chore/sync-pr`).
- **커밋 메시지: Conventional Commits.** `<타입>: <한국어 요약>`, 타입은 `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `style`, `chore`, `ci`, `build`. 호환이 깨지면 본문에 `BREAKING CHANGE:`. 실제 예: `perf: 화면별 코드 분할(첫 화면 JS 113.5 → 89.7 kB), 문서 수량 자동 갱신, 자동 동기화의 변경 기록`, `ci: Ark 동기화를 PR로 남기고 검사 통과 뒤 합치기`.
  - 표준과 다른 점: 버전을 고정했으므로 제목에 `(x.y.z)`를 붙이지 않습니다. 예전에는 `security:`·`a11y:` 타입도 썼지만 새 커밋은 표준 타입을 씁니다.
- **기여자는 ryushin01만 남깁니다(2026-11-21 사용자 결정).** 커밋 작성자는 늘 `ryushin0 <141554987+ryushin01@users.noreply.github.com>`입니다. 이 저장소는 백엔드 코드가 없으므로 `Co-Authored-By` 줄을 넣지 않습니다(백엔드 저장소만 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`). PR 본문 끝에는 `🤖 Generated with [Claude Code](https://claude.com/claude-code)`를 적습니다.
  - GitHub Actions가 커밋하는 워크플로는 작성자를 ryushin01로 설정합니다(`github-actions[bot]` 금지): `sync-ark.yml`의 `git config user.name/user.email`.
  - Dependabot PR은 그대로 병합하지 않고, 같은 변경을 ryushin01 커밋으로 다시 만들어 PR로 병합합니다.
- **버전: v1.2.3으로 고정(2026-11-15부터, Semantic Versioning 예외).**
  - 기능을 바꿔도 `package.json`의 `version`과 README 배지(`version-1.2.3`)를 올리지 않습니다. `scripts/version.test.js`가 다른 값을 막습니다.
  - 릴리스 태그·GitHub 릴리스를 새로 만들지 않습니다(마지막 릴리스 `v1.2.3`).
  - 프로필 저장소 `ryushin01/ryushin01`의 `scripts/versions.mjs`도 `FIXED`로 ZERO를 v1.2.3에 고정합니다. 이 값을 바꾸지 않습니다.
- **변경 기록: Keep a Changelog를 따르되 날짜 제목.** `CHANGELOG.md`에 최신 항목을 위에 둡니다. 표준과 다른 점: 버전 고정 때문에 `## x.y.z - YYYY-MM-DD` 대신 날짜 제목(`## 2026-11-20`)으로 적고, 추가·변경·수정·제거 소제목 없이 목록으로 적으며, `[Unreleased]` 절은 쓰지 않습니다. Ark 동기화는 `scripts/changelog-sync.mjs`가 오늘 날짜 항목에 한 줄을 더합니다.
- 병합은 squash(제목 끝 `(#번호)`). **CI가 통과하면 바로 병합**하고 CodeRabbit 리뷰는 기다리지 않습니다(이미 달린 맞는 지적은 반영).
- 공개 저장소라 Actions가 돕니다. Actions가 막히면 CI와 같은 검사를 로컬에서 돌려 대신합니다.

## 7. 배포·릴리스

- Vercel 프로젝트 `zero-myth`. **main만 배포**하고 PR 미리보기는 끔(`vercel.json`의 `git.deploymentEnabled`). 취소된 배포도 한도에 세므로 `ignoreCommand`는 쓰지 않습니다. 그래서 문서만 바꿔도 병합하면 배포됩니다.
- Vercel Hobby 한도(계정 전체, 최근 24시간 100회)에 걸리면 여유가 생긴 뒤 임시 복제본에서 `vercel link --yes --project zero-myth`, `vercel deploy --prod --yes`로 올리고 복제본을 `.env.local`째 지웁니다.
- 데모 모드: 별도 플래그 없이 늘 브라우저 저장소만 씁니다.
- `sync-ark.yml`: 매일 한국 시각 새벽 4시(또는 `gh workflow run sync-ark.yml`, `repository_dispatch: ark-updated`) Ark를 받아 바뀌면 `sync/ark` PR을 열고, CI 전체를 통과하면 스쿼시로 합칩니다(→ 운영 배포). 실패하면 PR을 열어 둡니다.
- 배포 뒤 운영 주소와 Storybook이 200인지 확인합니다.
- 릴리스는 만들지 않습니다(버전 고정). 백업 `bash ~/Documents/Archive/Backup/backup.sh`는 태그가 아니라 기본 브랜치 최신 커밋을 `<커밋 시각>_<짧은 해시>` 폴더로 받습니다.
- 보관함 계획 문서: `~/Documents/Obsidian Vault/ZERO v1.0.0 고도화 계획.md`. 진행 기록을 날짜와 함께 남깁니다.
- 소개가 크게 바뀌면 프로필 저장소 README 프로젝트 표(내용·기술·실행 칸)를 고칩니다(버전 칸은 v1.2.3 고정).

## 8. 보안·주의사항

- 비밀값·`.env`(`.env.local` 포함)를 커밋하지 않습니다. 유료 API 키를 쓰지 않습니다.
- **먼저 묻기:** 새 런타임 의존성(프레임워크 포함) 추가, 빌드·배포 설정(`vite.config.js`, `vercel.json`, 워크플로) 변경.
- **절대 금지:** 비밀값을 `VITE_*` 변수에 넣기(`VITE_SENTRY_DSN`처럼 공개돼도 되는 값만), `.env` 커밋, `eslint-disable`·`--no-verify`로 검사 우회, `main` 직접 푸시.
- 보안 헤더와 앱 문서 CSP(`vercel.json`)를 유지합니다. CSP를 바꾸면 `e2e/security.spec.js`로 확인합니다.
- Sentry에는 오류 내용만 보내고 사용자 정보·쿠키·쿼리·브레드크럼·콜백 인수는 모으지 않습니다.
- **그림 저작권:** 카드·괴물·전장·무구 그림은 Wikimedia Commons의 퍼블릭 도메인·CC0·CC 자료만 씁니다. 저작권이 남은 그림(작가 사후 70년이 지나지 않은 것, Pinterest 등에 다시 올라온 것)은 쓰지 않습니다. 히든 카드 유신 그림(`public/art/hidden/`)은 그린 분의 허락을 받은 파일을 그대로 씁니다.
- 화면에는 출처를 적지 않고 README 출처 표로 가는 링크(`CREDITS_URL`) 하나만 둡니다. 전체 목록은 `docs/credits.md`.
- 마루 부리는 OFL 예약 이름 때문에 줄인 파일 이름을 `ZeroSerif`로 바꿉니다.
- Ark 데이터는 손대지 않고 그대로 가져옵니다. 새 짝에 효과가 없거나 새 계열에 신화권이 없으면 동기화가 멈추므로 규칙을 더하는 PR을 따로 올립니다.
- 하위 의존성 취약점은 `pnpm-workspace.yaml`의 `overrides`로 올립니다.

## 9. 공통 규칙

규칙은 3계층입니다. 1층 전역(`~/.claude/CLAUDE.md`, OpenCode는 `~/.config/opencode/AGENTS.md`로 같은 파일) → 2층 ryushin01 공통(`~/Documents/GitHub/CLAUDE.md`, Claude Code만 읽음) → 3층 이 파일. 충돌하면 이 파일이 우선합니다(예: 버전 고정). 2층을 읽지 못하는 도구를 위해 핵심을 아래에 요약합니다.

- 답변·커밋·PR·문서·코드 주석은 한국어로 씁니다.
- 묻지 않고 끝까지 진행하고 결과를 한 번에 보고합니다. 비용이 드는 일, 새 비밀값, 디자인 결정, 되돌리기 어려운 일, 다른 조직 저장소에 공개로 글 올리기는 진행 전에 보고하고 결정을 받습니다.
- 사용자의 진행 중인 작업(커밋하지 않은 변경, 원격에 없는 브랜치)을 건드리지 말고 `git worktree add /tmp/<이름> -b <브랜치> origin/main`에서 작업한 뒤 worktree를 지웁니다.
- 다른 세션에 공지할 때는 Paseo ryushin01 그룹 세션에만 보냅니다.
