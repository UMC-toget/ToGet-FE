import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AuthContext } from './auth'
import { getAccessToken } from '../lib/tokenStorage'
import { onAuthExpired } from '../lib/apiClient'

/** 로그인 상태 관리 Provider. 초기값은 로컬에 저장된 access token 존재 여부로 판단합니다 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => getAccessToken() !== null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // refresh token까지 만료되면 apiClient가 notifyAuthExpired()로 알려줍니다. 이걸 구독하지 않으면
  // 토큰은 지워졌는데 isLoggedIn은 true로 남아, 죽은 세션으로 인증 요청을 계속 반복하게 됩니다.
  // 세션 만료로 인한 강제 로그아웃은 여기서 중앙집중적으로 /login까지 이동시킵니다 — 각 페이지의
  // useRequireAuth는 진입 시점 1회 체크만 하도록 분리되어 있어(로그아웃처럼 의도적으로 페이지를
  // 벗어나는 경우와 경합하지 않기 위해), 세션이 끊긴 채 화면에 계속 머무는 걸 막을 곳이 필요합니다.
  useEffect(
    () =>
      onAuthExpired(() => {
        setIsLoggedIn(false)
        queryClient.clear()
        navigate('/login', { replace: true })
      }),
    [queryClient, navigate],
  )

  const value = useMemo(
    () => ({
      isLoggedIn,
      login: () => setIsLoggedIn(true),
      logout: () => setIsLoggedIn(false),
    }),
    [isLoggedIn],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
