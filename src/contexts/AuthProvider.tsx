import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AuthContext } from './auth'
import { getAccessToken } from '../lib/tokenStorage'
import { onAuthExpired } from '../lib/apiClient'

// useRequireAuth()를 쓰는 페이지들(로그인 없이는 진입 자체가 의미 없는 화면) 경로입니다.
// 이 목록에 없는 페이지(홈, 위시 등 비로그인도 지원하는 화면)는 세션이 만료돼도 /login으로
// 튕기지 않고, 그 화면이 isLoggedIn 값을 보고 알아서 비로그인 상태를 그리도록 둡니다.
const AUTH_REQUIRED_PATH_PATTERNS = [
  /^\/my\/accounts$/,
  /^\/my\/accounts\/new$/,
  /^\/my\/accounts\/[^/]+\/edit$/,
  /^\/my\/profile$/,
  /^\/my\/fundings\/(my|together)$/,
  /^\/gift\/review\/write\//,
  /^\/gift\/review\/complete\//,
]

function isAuthRequiredPath(pathname: string): boolean {
  return AUTH_REQUIRED_PATH_PATTERNS.some((pattern) => pattern.test(pathname))
}

/** 로그인 상태 관리 Provider. 초기값은 로컬에 저장된 access token 존재 여부로 판단합니다 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => getAccessToken() !== null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const locationRef = useRef(location)
  locationRef.current = location

  // refresh token까지 만료되면 apiClient가 notifyAuthExpired()로 알려줍니다. 이걸 구독하지 않으면
  // 토큰은 지워졌는데 isLoggedIn은 true로 남아, 죽은 세션으로 인증 요청을 계속 반복하게 됩니다.
  // /login으로 강제 이동은 로그인 필수 페이지(AUTH_REQUIRED_PATH_PATTERNS)에 머무는 중 세션이
  // 끊긴 경우에만 시킵니다 — 홈처럼 비로그인도 지원하는 화면에서는 화면 이동 없이 그냥 로그아웃
  // 상태로 전환되도록 두는 게 맞습니다(비로그인 사용자가 갑자기 로그인 화면으로 튕기면 안 됨).
  useEffect(
    () =>
      onAuthExpired(() => {
        setIsLoggedIn(false)
        queryClient.clear()
        if (isAuthRequiredPath(locationRef.current.pathname)) {
          navigate('/login', { replace: true })
        }
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
