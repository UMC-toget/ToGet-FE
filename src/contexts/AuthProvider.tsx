import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './auth'

/**
 * 로그인 상태 관리 Provider
 * TODO: 인증 API 연동 시 토큰 저장/갱신 로직으로 교체 (초기값도 false로 변경)
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(true)

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
