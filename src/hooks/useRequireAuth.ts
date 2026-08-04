import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

/** 비로그인 상태로 이 페이지에 직접 URL 접근하면 로그인 화면으로 리다이렉트합니다 */
export function useRequireAuth(): void {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn) navigate('/login', { replace: true })
  }, [isLoggedIn, navigate])
}
