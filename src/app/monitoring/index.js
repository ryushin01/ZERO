/** @typedef {import("web-vitals").Metric} Metric */

const dsn = /** @type {string | undefined} */ (import.meta.env.VITE_SENTRY_DSN);

/** @type {Promise<typeof import("./sentry.js")> | undefined} */
let sentry;

/**
 * 오류·성능 모니터링을 켭니다. 첫 화면을 무겁게 하지 않도록 Sentry와 web-vitals는 나중에 불러옵니다.
 * - VITE_SENTRY_DSN이 있으면 처리하지 못한 오류를 Sentry로 보내고, 나쁜(poor) Web Vitals를 경고로 남깁니다.
 * - 없으면 개발 모드에서만 콘솔에 Web Vitals를 찍습니다.
 */
export function initMonitoring() {
  if (dsn) {
    sentry = import("./sentry.js").then((Sentry) => {
      Sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        release: /** @type {string | undefined} */ (import.meta.env.VITE_RELEASE),
      });
      return Sentry;
    });
  }

  void import("web-vitals").then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
    for (const subscribe of [onCLS, onINP, onLCP, onFCP, onTTFB]) subscribe(reportMetric);
  });
}

/** @param {Metric} metric */
export function reportMetric(metric) {
  if (import.meta.env.DEV) {
    console.debug(`[web-vitals] ${metric.name} ${metric.value.toFixed(1)} (${metric.rating})`);
  }
  if (!sentry || metric.rating !== "poor") return;
  void sentry.then((Sentry) =>
    Sentry.captureMessage(`Web Vitals 나쁨: ${metric.name}`, {
      level: "warning",
      tags: { metric: metric.name, rating: metric.rating, route: location.hash || "#/" },
      extra: { value: metric.value, id: metric.id, navigationType: metric.navigationType },
    }),
  );
}
