import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

/**
 * 비로그인 상태로 이 페이지에 직접 URL 접근하면 로그인 화면으로 리다이렉트합니다.
 *
 * 진입 시점에 1회만 체크합니다 — isLoggedIn을 계속 지켜보며 반응하면, 이 페이지에서
 * 로그아웃 버튼을 눌러 의도적으로 다른 화면으로 이동하는 도중에도 "로그인 풀림"을 감지해
 * /login으로 가로채 가는 문제가 있었습니다. 세션 만료로 인한 강제 로그아웃(사용자가 이
 * 페이지에 머무는 중 refresh token까지 만료되는 경우)은 AuthProvider가 중앙에서 처리합니다.
 */
export function useRequireAuth(): void {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const checkedRef = useRef(false)

  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true
    if (!isLoggedIn) navigate('/login', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
