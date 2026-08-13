// 편지 임시저장(로컬). BE에 편지 draft 엔드포인트가 없어 클라이언트에 보관한다.
// LetterPage에서 '완료하기' 시 저장하고, SettlePage '입금 완료' 제출 시 함께 보내고 지운다. 펀딩별 키.
export interface LetterDraft {
  colorId: string
  content: string
  isPrivate: boolean
}

const draftKey = (fundingId: string | undefined) => `letter-draft:${fundingId ?? 'unknown'}`

export function readLetterDraft(fundingId: string | undefined): LetterDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(fundingId))
    return raw ? (JSON.parse(raw) as LetterDraft) : null
  } catch {
    return null
  }
}

export function writeLetterDraft(fundingId: string | undefined, draft: LetterDraft): void {
  try {
    localStorage.setItem(draftKey(fundingId), JSON.stringify(draft))
  } catch {
    // 저장 실패해도 이동은 막지 않는다
  }
}

export function clearLetterDraft(fundingId: string | undefined): void {
  try {
    localStorage.removeItem(draftKey(fundingId))
  } catch {
    // 무시
  }
}
