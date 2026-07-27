import axios from 'axios'
import { KAKAO_REST_API_KEY } from './oauthConfig'

interface KakaoSDK {
  init: (key: string) => void
  isInitialized: () => boolean
  Auth: {
    authorize: (options: { redirectUri: string; scope?: string }) => void
  }
}

declare global {
  interface Window {
    Kakao: KakaoSDK
  }
}

export function initKakao(key: string): void {
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(key)
  }
}

/**
 * 카카오 로그인 페이지로 이동합니다. 로그인 완료 후 redirectUri로 돌아오며 쿼리에 code가 붙습니다.
 * account_email을 명시적으로 요청해 사용자가 이메일 제공에 동의하도록 유도합니다 — 동의하지 않으면
 * 카카오가 이메일 없이 응답을 줄 수 있어(백엔드가 이메일 필수로 처리할 경우) 로그인이 실패할 수 있습니다.
 */
export function kakaoAuthorize(redirectUri: string): void {
  window.Kakao.Auth.authorize({ redirectUri, scope: 'account_email' })
}

interface KakaoTokenResponse {
  access_token: string
}

/** authorize()로 받은 인가 code를 access token으로 교환합니다 */
export async function exchangeKakaoCode(code: string, redirectUri: string): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: KAKAO_REST_API_KEY,
    redirect_uri: redirectUri,
    code,
  })
  const { data } = await axios.post<KakaoTokenResponse>(
    'https://kauth.kakao.com/oauth/token',
    params,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  )
  return data.access_token
}
