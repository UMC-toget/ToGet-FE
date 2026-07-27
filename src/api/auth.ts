import { apiClient, unwrap } from '../lib/apiClient'

export type SocialLoginProvider = 'kakao' | 'google'

export interface SocialLoginResult {
  userId: number
  email: string
  name: string
  accessToken: string
  refreshToken: string
  /** 신규 가입자 여부 — true면 온보딩(닉네임 설정) 화면으로 유도 */
  isNewUser: boolean
}

/**
 * 소셜 로그인 및 자동 회원가입.
 * identityToken은 카카오는 Access Token, 구글/애플은 ID Token입니다.
 * TODO: 카카오/구글 클라이언트 SDK 연동 후 실제 identityToken을 받아 호출해야 함 (현재 미연동)
 */
export function postSocialLogin(provider: SocialLoginProvider, identityToken: string) {
  return unwrap<SocialLoginResult>(
    apiClient.post(`/api/v1/auth/tokens/${provider}`, { identityToken }),
  )
}
