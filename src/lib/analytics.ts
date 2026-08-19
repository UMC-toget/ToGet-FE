/** GA4 측정 ID. 값이 없으면(로컬 개발 등) 트래킹 함수들이 조용히 아무 것도 하지 않습니다 */
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

let initialized = false

/** GA4 스크립트를 동적으로 로드하고 gtag를 초기화합니다. 앱 시작 시 한 번만 호출하세요 */
export function initGA(): void {
  if (initialized || !GA_MEASUREMENT_ID) return
  initialized = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }
  // 동의 상태를 명시하지 않으면 GA4가 "동의 미구성"으로 보고 수집 데이터를 보고서에서
  // 제외할 수 있다. 별도 쿠키 동의 배너가 없는 서비스라 기본값을 granted로 명시한다.
  window.gtag('consent', 'default', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
  })
  // send_page_view는 기본값(true)을 그대로 둔다 — false로 두면 gtag.js가 'page_view'라는
  // 예약된 이벤트명 자체를 전송 대상에서 제외해버려서, SPA 라우트 변경마다 직접 보내던
  // gtag('event','page_view', ...) 호출이 매번 Processing 단계에서 조용히 버려지고 있었다.
  // SPA 라우트 변경은 GA4 Enhanced Measurement의 "브라우저 기록 이벤트 기반 페이지 변경"
  // 기능이 history.pushState/popstate을 직접 감지해 자동으로 page_view를 보내주므로,
  // 최초 로드는 이 config 호출의 기본 page_view로, 이후 라우트 이동은 Enhanced Measurement로
  // 커버된다 — 별도로 페이지뷰를 수동 전송할 필요가 없다.
  window.gtag('config', GA_MEASUREMENT_ID)
}

/** 버튼 클릭 등 커스텀 이벤트를 기록합니다. 측정 ID가 설정되지 않은 로컬 환경에서는 무시됩니다 */
export function trackEvent(action: string, params?: Record<string, unknown>): void {
  if (!GA_MEASUREMENT_ID || !window.gtag) return
  window.gtag('event', action, params)
}
