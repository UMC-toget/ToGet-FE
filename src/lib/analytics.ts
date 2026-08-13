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
  window.gtag('js', new Date())
  // SPA이므로 초기 자동 page_view는 끄고, 라우트 변경마다 trackPageView로 직접 보냅니다
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
}

/** 라우트 변경 시 페이지뷰를 기록합니다 */
export function trackPageView(path: string): void {
  if (!GA_MEASUREMENT_ID || !window.gtag) return
  window.gtag('event', 'page_view', { page_path: path })
}

/** 버튼 클릭 등 커스텀 이벤트를 기록합니다. 측정 ID가 설정되지 않은 로컬 환경에서는 무시됩니다 */
export function trackEvent(action: string, params?: Record<string, unknown>): void {
  if (!GA_MEASUREMENT_ID || !window.gtag) return
  window.gtag('event', action, params)
}
