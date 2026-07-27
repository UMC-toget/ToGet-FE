import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './auth'
import { getAccessToken } from '../lib/tokenStorage'

/** 로그인 상태 관리 Provider. 초기값은 로컬에 저장된 access token 존재 여부로 판단합니다 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => getAccessToken() !== null)

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
