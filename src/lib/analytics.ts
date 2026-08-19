/** GA4 측정 ID. 값이 없으면(로컬 개발 등) 트래킹 함수들이 조용히 아무 것도 하지 않습니다 */
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

/**
 * 버튼 클릭 등 커스텀 이벤트를 기록합니다. 측정 ID가 설정되지 않은 로컬 환경에서는 무시됩니다.
 *
 * GA4 초기화(gtag.js 로드, dataLayer/gtag 설정, consent/config)는 이 파일이 아니라
 * index.html의 순수 인라인 스크립트에서 합니다 — Vite가 처리하는 파일에서 초기화하면
 * gtag.js 내부 처리(로그)까지는 정상인데 실제 네트워크 전송만 안 되는 문제가 있었습니다.
 * 초기화 이후 이 함수처럼 Vite로 번들된 코드에서 window.gtag(...)를 호출하는 것은 정상 동작합니다.
 */
export function trackEvent(action: string, params?: Record<string, unknown>): void {
  if (!GA_MEASUREMENT_ID || !window.gtag) return
  window.gtag('event', action, params)
}

/**
 * 라우트 변경 시 페이지뷰를 기록합니다.
 *
 * GA4 속성의 Enhanced Measurement "브라우저 방문 기록 이벤트를 토대로 한 페이지 변경사항"을
 * 껐다는 전제로 동작합니다 — 그 자동 추적을 켠 채로 이 함수도 같이 쓰면 라우트 변경마다
 * page_view가 두 번씩(자동 + 수동) 잡힙니다.
 */
export function trackPageView(path: string): void {
  if (!GA_MEASUREMENT_ID || !window.gtag) return
  window.gtag('event', 'page_view', {
    page_location: window.location.origin + path,
    page_title: document.title,
  })
}
