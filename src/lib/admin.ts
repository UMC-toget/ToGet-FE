import type { UserProfile } from '../api/users'

/**
 * 관리자로 인식되는 구글 계정들. 백엔드도 동일한 이메일+provider(ADMIN_EMAIL/ADMIN_PROVIDER 환경변수)로
 * 관리자 여부를 판별한다 — 이 목록은 그 서버 설정과 정확히 일치해야 한다.
 */
const ADMIN_EMAILS = ['hello.toget.team@gmail.com', 'nunwoosm19@gmail.com']
const ADMIN_PROVIDER = 'GOOGLE'

/**
 * 프론트에서의 관리자 판별은 UI 노출 여부(관리 메뉴 표시 등) 결정용일 뿐이다.
 * 실제 권한 검증은 관리자 전용 API 호출 시 백엔드가 항상 다시 수행한다.
 */
export function isAdminProfile(profile: UserProfile | undefined): boolean {
  return !!profile && ADMIN_EMAILS.includes(profile.email) && profile.oauthProvider === ADMIN_PROVIDER
}
