import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AuthContext } from './auth'
import { getAccessToken } from '../lib/tokenStorage'
import { onAuthExpired } from '../lib/apiClient'

/** 로그인 상태 관리 Provider. 초기값은 로컬에 저장된 access token 존재 여부로 판단합니다 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => getAccessToken() !== null)
  const queryClient = useQueryClient()

  // refresh token까지 만료되면 apiClient가 notifyAuthExpired()로 알려줍니다. 이걸 구독하지 않으면
  // 토큰은 지워졌는데 isLoggedIn은 true로 남아, 죽은 세션으로 인증 요청을 계속 반복하게 됩니다.
  useEffect(
    () =>
      onAuthExpired(() => {
        setIsLoggedIn(false)
        queryClient.clear()
      }),
    [queryClient],
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
