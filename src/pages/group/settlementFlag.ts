// 내 정산하기(입금 완료) 완료 여부 로컬 플래그.
// BE 대시보드에 '내 정산 상태' 필드가 없어, 개설자가 정산을 마쳤는지 판단해
// SETTLING 하단 버튼(정산하기 ↔ 금액 모으기 마감하기)을 토글하는 데 쓴다. 펀딩별 키.
const key = (fundingId: string | undefined) => `self-settled:${fundingId ?? 'unknown'}`

export function markSelfSettled(fundingId: string | undefined): void {
  try {
    localStorage.setItem(key(fundingId), '1')
  } catch {
    // 저장 실패해도 흐름은 막지 않는다
  }
}

export function hasSelfSettled(fundingId: string | undefined): boolean {
  try {
    return localStorage.getItem(key(fundingId)) === '1'
  } catch {
    return false
  }
}
