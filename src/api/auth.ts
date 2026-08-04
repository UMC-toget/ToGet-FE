import { apiClient, unwrap } from '../lib/apiClient'

export type SocialLoginProvider = 'kakao' | 'google'

/**
 * 소셜 로그인 응답 — isProfileCompleted에 따라 필드 구성이 완전히 다릅니다 (BE issue #61).
 * true(기존 회원)면 accessToken/refreshToken이 바로 발급되고, false(미가입자)면 이 시점엔
 * 회원이 생성되지 않고 signupToken만 발급됩니다. 프로필 설정 화면에서 signupToken과 함께
 * completeSignup()을 호출해야 비로소 회원이 생성되고 진짜 토큰을 받습니다.
 */
export type SocialLoginResult =
  | {
      isProfileCompleted: true
      userId: number
      email: string
      name: string
      accessToken: string
      refreshToken: string
    }
  | {
      isProfileCompleted: false
      /** 만료 10분. POST /api/v1/users 호출 시 그대로 전달해야 합니다 */
      signupToken: string
    }

/**
 * 소셜 로그인. 이미 가입한 계정이면 바로 로그인되고, 미가입자면 프로필 설정 화면으로 유도해야 합니다.
 * identityToken은 카카오는 Access Token, 구글은 Access Token입니다.
 */
export function postSocialLogin(provider: SocialLoginProvider, identityToken: string) {
  return unwrap<SocialLoginResult>(
    apiClient.post(`/api/v1/auth/tokens/${provider}`, { identityToken }),
  )
}

/** 로그아웃. 서버에 저장된 refresh token을 무효화합니다 */
export function logoutRequest() {
  return unwrap<void>(apiClient.delete('/api/v1/auth/tokens/me'))
}

export interface SignupCompleteResult {
  userId: number
  email: string
  name: string
  nickname: string
  profileImageUrl: string | null
  accessToken: string
  refreshToken: string
}

/**
 * 회원가입 완료 — 소셜 로그인 응답의 signupToken과 닉네임/프로필 사진을 함께 보내면
 * 이 시점에 회원이 생성되고 처음으로 서비스 토큰이 발급됩니다. (BE issue #61)
 * 아직 회원이 아닌 상태로 호출하는 permitAll 엔드포인트라 apiClient가 Authorization 헤더를
 * 붙이지 않습니다 (붙이면 access token으로 오인돼 401이 납니다 — apiClient.ts 참고).
 */
export function completeSignup(payload: { signupToken: string; nickname: string; profileImageUrl?: string }) {
  return unwrap<SignupCompleteResult>(apiClient.post('/api/v1/users', payload))
}
