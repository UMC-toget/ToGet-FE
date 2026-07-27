/**
 * BE backgrounds 테이블의 backgroundId → 초대장 글로우 색상 매핑.
 * backgroundId 실제 값과 전체 색상 목록은 BE 연동 시 확정 필요.
 */
const GLOW_MAP: Record<string, string> = {
  '1': '#FE71A5', // 핑크
  '2': '#FF6767', // 주황
  // 나머지 테마는 BE backgroundId 확정 후 추가
}

const DEFAULT_GLOW = '#FE71A5'

export function getInvitationGlowColor(backgroundId: string): string {
  return GLOW_MAP[backgroundId] ?? DEFAULT_GLOW
}
