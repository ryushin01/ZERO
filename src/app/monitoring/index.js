/** @typedef {import("web-vitals").Metric} Metric */
/** @typedef {typeof import("./sentry.js")} SentryModule */

const dsn = /** @type {string | undefined} */ (import.meta.env.VITE_SENTRY_DSN);

/** Sentry를 받기 전에 모아 둘 오류 수. 오류가 반복돼도 메모리를 계속 쓰지 않게 합니다. */
const MAX_EARLY_ERRORS = 20;

/** 방문 기록(세션), 이동·클릭 기록(브레드크럼), 콘솔 기록은 모으지 않습니다. */
const OFF_INTEGRATIONS = new Set(["BrowserSession", "Breadcrumbs", "Console"]);

/** @type {Promise<SentryModule | undefined> | undefined} */
let sentry;

/**
 * 오류·성능 모니터링을 켭니다. 첫 화면을 무겁게 하지 않도록 Sentry와 web-vitals는 나중에 불러옵니다.
 * - VITE_SENTRY_DSN이 있으면 처리하지 못한 오류를 Sentry로 보내고, 나쁜(poor) Web Vitals를 경고로 남깁니다.
 * - 없으면 개발 모드에서만 콘솔에 Web Vitals를 찍습니다.
 */
export function initMonitoring() {
  if (dsn) {
    // Sentry를 받는 동안 난 오류(첫 화면 그리기 등)를 모아 두었다가, 준비되면 보냅니다.
    /** @type {{ error: unknown, type: string }[]} */
    const early = [];
    /** @param {unknown} error @param {string} type */
    const keep = (error, type) => {
      if (early.length < MAX_EARLY_ERRORS) early.push({ error, type });
    };
    /** @param {ErrorEvent} event */
    const onError = (event) => keep(event.error ?? event.message, "onerror");
    /** @param {PromiseRejectionEvent} event */
    const onRejection = (event) => keep(event.reason, "onunhandledrejection");
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    const stopBuffering = () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };

    sentry = afterFirstPaint()
      .then(() => import("./sentry.js"))
      .then((Sentry) => {
        Sentry.init({
          dsn,
          environment: import.meta.env.MODE,
          release: /** @type {string | undefined} */ (import.meta.env.VITE_RELEASE),
          // 오류 내용만 남깁니다. 사용자 정보·쿠키·헤더·쿼리 문자열은 모으지 않습니다.
          dataCollection: {
            userInfo: false,
            cookies: false,
            httpHeaders: false,
            httpBodies: [],
            urlQueryParams: false,
            stackFrameVariables: false,
          },
          integrations: (defaults) => defaults.filter(({ name }) => !OFF_INTEGRATIONS.has(name)),
          // 감싼 콜백이 던진 오류에는 그 콜백의 인수(입력 이벤트 등)가 extra.arguments로 붙습니다. 오류 내용이 아니므로 지웁니다.
          beforeSend(event) {
            if (event.extra) {
              delete event.extra.arguments;
              // Error가 아닌 일반 객체로 거부된 Promise는 그 필드 값(이메일·토큰 등)이 여기에 담깁니다.
              delete event.extra.__serialized__;
            }
            return event;
          },
        });
        stopBuffering();
        for (const { error, type } of early.splice(0)) captureUnhandled(Sentry, error, type);
        return Sentry;
      })
      // Sentry를 받지 못해도 앱은 그대로 돕니다.
      .catch(() => {
        stopBuffering();
        return undefined;
      });
  }

  // 보낼 곳도 찍을 곳도 없으면(DSN 없는 배포) 지표 관찰기를 달지 않습니다.
  if (!dsn && !import.meta.env.DEV) return;

  void import("web-vitals")
    .then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      for (const subscribe of [onCLS, onINP, onLCP, onFCP, onTTFB]) subscribe(reportMetric);
    })
    // 지표를 받지 못해도 앱은 그대로 돕니다.
    .catch(() => undefined);
}

/** @param {Metric} metric */
export function reportMetric(metric) {
  if (import.meta.env.DEV) {
    console.debug(`[web-vitals] ${metric.name} ${metric.value.toFixed(1)} (${metric.rating})`);
  }
  if (!sentry || metric.rating !== "poor") return;
  // Sentry를 기다리는 사이 다른 화면으로 옮길 수 있어, 지표를 받은 때의 화면을 먼저 읽어 둡니다.
  const route = location.hash || "#/";
  void sentry.then((Sentry) =>
    Sentry?.captureMessage(`Web Vitals 나쁨: ${metric.name}`, {
      level: "warning",
      tags: { metric: metric.name, rating: metric.rating, route },
      extra: { value: metric.value, id: metric.id, navigationType: metric.navigationType },
    }),
  );
}

/**
 * 전역 오류 처리기가 잡은 것처럼 '처리되지 않은 오류'로 표시해 보냅니다.
 * captureException은 기본으로 handled: true를 붙이므로 이벤트 처리기에서 바꿉니다.
 * @param {SentryModule} Sentry
 * @param {unknown} error
 * @param {string} type
 */
function captureUnhandled(Sentry, error, type) {
  Sentry.withScope((scope) => {
    scope.addEventProcessor((event) => {
      for (const value of event.exception?.values ?? []) value.mechanism = { type, handled: false };
      return event;
    });
    Sentry.captureException(error);
  });
}

/**
 * 페이지를 다 받은 뒤(load) 브라우저가 한가할 때 풀립니다. 첫 화면을 그리는 동안 Sentry를 받느라 대역폭을 나눠 쓰지 않게 합니다.
 * requestIdleCallback이 없는 브라우저(Safari 등)는 바로 다음 차례에 풉니다. 그 사이 오류는 위의 버퍼가 모읍니다.
 * load가 10초 안에 오지 않으면 그때 바로 받기 시작합니다.
 * @returns {Promise<void>}
 */
function afterFirstPaint() {
  return new Promise((resolve) => {
    const idle = () =>
      "requestIdleCallback" in window
        ? window.requestIdleCallback(() => resolve(), { timeout: 3000 })
        : setTimeout(resolve, 0);
    if (document.readyState === "complete") idle();
    else {
      window.addEventListener("load", idle, { once: true });
      // 끝나지 않는 요청(스트림, 멈춘 이미지 등)이 load를 붙잡아도 10초가 지나면 바로 받기 시작합니다.
      setTimeout(resolve, 10_000);
    }
  });
}
