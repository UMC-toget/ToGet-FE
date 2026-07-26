import { apiClient, unwrap } from '../lib/apiClient'

// ─── 요청 타입 ───────────────────────────────────────────────
export interface ContributionCreateRequest {
  senderName: string
  backgroundId: number
  isAnonymous: boolean
  amount: number
  content: string
  isPrivate: boolean
}

// ─── 응답 타입 ───────────────────────────────────────────────
export interface ContributionItem {
  contributionId: number
  senderName: string | null
  isAnonymous: boolean
  amount: number | null
  content: string | null
  isPrivate: boolean
  createdAt: string
}

export interface ContributionListResponse {
  participantCount: number
  contributions: ContributionItem[]
}

// ─── API 함수 ─────────────────────────────────────────────────

/** E03) 펀딩 참여(후원) 제출
 * ⚠️ BE 현재 로그인 필수 (비회원 참여 지원은 BE TODO 완료 후 동작)
 */
export function postContribution(fundingId: number | string, payload: ContributionCreateRequest) {
  return unwrap<{ contributionId: number }>(
    apiClient.post(`/api/v1/fundings/${fundingId}/contributions`, payload),
  )
}

/** E02) 축하 메세지 전체 조회 */
export function getContributions(fundingId: number | string) {
  return unwrap<ContributionListResponse>(
    apiClient.get(`/api/v1/fundings/${fundingId}/contributions`),
  )
}

/** E02) 축하 메세지 상세 조회 */
export function getContribution(fundingId: number | string, contributionId: number | string) {
  return unwrap<ContributionItem>(
    apiClient.get(`/api/v1/fundings/${fundingId}/contributions/${contributionId}`),
  )
}
