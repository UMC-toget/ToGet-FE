import type { UserProfile } from '../api/users'

/**
 * 관리자로 인식되는 계정 화이트리스트. 백엔드가 GET /users/me 응답에 관리자 여부를
 * 알려주는 필드(예: isAdmin/role)를 아직 제공하지 않아 프론트에서 이메일+provider로
 * 판별한다 — 백엔드가 API로 관리자 여부를 내려주면 이 화이트리스트는 제거하고
 * 그 필드를 사용하도록 교체해야 한다.
 */
const ADMIN_ACCOUNTS: { email: string; provider: string }[] = [
  { email: 'hello.toget.team@gmail.com', provider: 'GOOGLE' },
  { email: 'nunwoosm19@gmail.com', provider: 'GOOGLE' },
]

/**
 * 프론트에서의 관리자 판별은 UI 노출 여부(관리 메뉴 표시 등) 결정용일 뿐이다.
 * 실제 권한 검증은 관리자 전용 API 호출 시 백엔드가 항상 다시 수행한다.
 */
export function isAdminProfile(profile: UserProfile | undefined): boolean {
  if (!profile) return false
  return ADMIN_ACCOUNTS.some(
    (admin) => admin.email === profile.email && admin.provider === profile.oauthProvider,
  )
}
