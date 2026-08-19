import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../../lib/analytics'

/**
 * 라우트가 바뀔 때마다 GA4에 page_view 이벤트를 보냅니다.
 *
 * lastSentPath로 직전에 보낸 경로와 같으면 다시 보내지 않는다 — StrictMode(개발 모드)가
 * 최초 마운트 시 effect를 두 번 실행해 같은 경로에 대해 중복 전송되는 것을 막기 위함이다.
 * (프로덕션 빌드에는 영향 없음. 실제 다른 경로로의 이동은 항상 정상적으로 각각 전송된다.)
 */
export default function PageViewTracker() {
  const location = useLocation()
  const lastSentPath = useRef<string | null>(null)

  useEffect(() => {
    const path = location.pathname + location.search
    if (lastSentPath.current === path) return
    lastSentPath.current = path
    trackPageView(path)
  }, [location.pathname, location.search])

  return null
}
