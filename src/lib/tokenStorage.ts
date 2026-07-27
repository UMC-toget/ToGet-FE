const ACCESS_TOKEN_KEY = 'toget_access_token'
const REFRESH_TOKEN_KEY = 'toget_refresh_token'
/**
 * 로그아웃 시에는 clearTokens()로 지우지 않습니다 — 다음에 다시 로그인할 때
 * "최근에 로그인한 계정" 안내에 씁니다. 단, 계정 삭제(탈퇴) 시에는 clearLastLoginProvider()로
 * 반드시 함께 지워야 합니다 (탈퇴 후에도 기기에 정보가 남아있으면 안 되므로).
 */
const LAST_LOGIN_PROVIDER_KEY = 'toget_last_login_provider'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getLastLoginProvider(): string | null {
  return localStorage.getItem(LAST_LOGIN_PROVIDER_KEY)
}

export function setLastLoginProvider(provider: string): void {
  localStorage.setItem(LAST_LOGIN_PROVIDER_KEY, provider)
}

/** 계정 삭제(탈퇴) 시 호출합니다. 로그아웃 시에는 호출하지 않습니다. */
export function clearLastLoginProvider(): void {
  localStorage.removeItem(LAST_LOGIN_PROVIDER_KEY)
}
