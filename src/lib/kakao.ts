import axios from 'axios'
import { KAKAO_REST_API_KEY } from './oauthConfig'

interface KakaoSDK {
  init: (key: string) => void
  isInitialized: () => boolean
  Auth: {
    authorize: (options: { redirectUri: string }) => void
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

/** 카카오 로그인 페이지로 이동합니다. 로그인 완료 후 redirectUri로 돌아오며 쿼리에 code가 붙습니다 */
export function kakaoAuthorize(redirectUri: string): void {
  window.Kakao.Auth.authorize({ redirectUri })
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
