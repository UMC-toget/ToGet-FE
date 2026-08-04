import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokenStorage'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://dev.api.toget.kr'

export interface ApiEnvelope<T> {
  isSuccess: boolean
  code: string
  message: string
  result: T
}

export class ApiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

/** 인증 만료(refresh 실패)로 강제 로그아웃되었을 때 알림을 받을 콜백들 (AuthProvider가 구독) */
const authExpiredListeners = new Set<() => void>()
export function onAuthExpired(listener: () => void): () => void {
  authExpiredListeners.add(listener)
  return () => authExpiredListeners.delete(listener)
}
function notifyAuthExpired() {
  clearTokens()
  authExpiredListeners.forEach((listener) => listener())
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * 소셜 로그인(`/api/v1/auth/tokens/{provider}`)과 회원가입 완료(`POST /api/v1/users`)는 아직
 * 세션이 없는 상태에서 보내는 permitAll 요청이라 Authorization 헤더 주입도, 401 응답 시
 * "토큰 재발급 후 재시도"도 대상이 아닙니다.
 * - 소셜 로그인: 로컬에 이전 세션의 refresh token이 남아있으면 로그인 요청의 401이 엉뚱하게
 *   재발급 시도로 이어지고, 그 재발급 실패(만료된 refresh token)가 진짜 원인인 것처럼 로그인
 *   실패를 가리는 문제가 있었습니다.
 * - 회원가입 완료: 아직 회원이 아닌데 Authorization 헤더가 실리면 백엔드가 access token으로
 *   오인해 401로 끊습니다 (SignupCompleteRequest 문서 참고).
 */
function isUnauthenticatedRequest(url?: string, method?: string): boolean {
  if (/^\/api\/v1\/auth\/tokens\/(kakao|google)$/.test(url ?? '')) return true
  if ((method ?? '').toLowerCase() === 'post' && url === '/api/v1/users') return true
  return false
}

apiClient.interceptors.request.use((config) => {
  if (isUnauthenticatedRequest(config.url, config.method)) return config
  const accessToken = getAccessToken()
  if (accessToken) config.headers.set('Authorization', `Bearer ${accessToken}`)
  return config
})

// 여러 요청이 동시에 401을 받아도 refresh 호출은 한 번만 나가도록 진행 중인 refresh를 공유합니다.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('refresh token 없음')

  // apiClient가 아닌 별도 axios 인스턴스 사용 (아래 401 인터셉터가 이 요청에도 걸려
  // 재귀 호출되는 것을 방지)
  const { data } = await axios.post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
    `${API_BASE_URL}/api/v1/auth/tokens/refresh`,
    { refreshToken },
  )
  if (!data.isSuccess) throw new ApiError(data.code, data.message)
  setTokens(data.result.accessToken, data.result.refreshToken)
  return data.result.accessToken
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    // 애초에 Authorization 헤더 없이 보낸 요청(비로그인 상태에서 보호된 API를 두드린 경우 등)의
    // 401은 "세션 만료"가 아니라 정상적인 "로그인 안 함" 상태입니다. 이 경우까지 notifyAuthExpired를
    // 부르면 방금 로그인해서 아직 처리 중인 다른 요청의 결과와 경합해 로그인 상태를 도로 꺼버릴 수
    // 있으므로, 실제로 토큰을 실어 보냈던 요청이 거부된 경우에만 세션 만료로 취급합니다.
    const hadAuthHeader = Boolean(original?.headers?.get?.('Authorization'))

    if (
      error.response?.status === 401 &&
      original &&
      hadAuthHeader &&
      !isUnauthenticatedRequest(original.url, original.method)
    ) {
      if (!original._retry && getRefreshToken()) {
        original._retry = true
        try {
          refreshPromise ??= refreshAccessToken().finally(() => {
            refreshPromise = null
          })
          const newAccessToken = await refreshPromise
          original.headers.set('Authorization', `Bearer ${newAccessToken}`)
          return apiClient(original)
        } catch {
          notifyAuthExpired()
        }
      } else {
        // refresh token이 아예 없거나(이미 지워짐), 재시도까지 했는데도 또 401이면 더 이상 복구할
        // 방법이 없는 만료된 세션입니다.
        notifyAuthExpired()
      }
    }

    return Promise.reject(error)
  },
)

/** ApiEnvelope 응답을 result만 꺼내 반환하고, isSuccess=false면 ApiError를 던집니다 */
export async function unwrap<T>(request: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await request
  if (!data.isSuccess) throw new ApiError(data.code, data.message)
  return data.result
}
