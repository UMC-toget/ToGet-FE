import { apiClient, unwrap } from '../lib/apiClient'

// ─── 공통 ─────────────────────────────────────────────────────

export type GroupFundingStatus = 'SELECTING' | 'SETTLING' | 'PURCHASING' | 'DELIVERING' | 'ENDED'

// ─── H01: 함께 선물 대시보드 ──────────────────────────────────

export interface MemberSummary {
  fundingMemberId: number
  userId: number
  name: string
  profileImageUrl: string | null
  role: 'HOST' | 'CO_HOST' | 'MEMBER'
}

export interface TopGift {
  fundingGiftId: number
  giftName: string
  giftPrice: number
  giftImageUrl: string | null
  voteCount: number
}

export interface ConfirmedGift {
  fundingGiftId: number
  giftName: string
  giftPrice: number
  giftImageUrl: string | null
}

export interface TogetherGiftDashboard {
  fundingId: number
  status: GroupFundingStatus
  anniversaryDate: string
  recipientName: string
  introduction: string
  thumbnailImageUrl: string | null
  members: MemberSummary[]
  /** SELECTING 단계에서 상위 투표 선물 목록 */
  topGifts: TopGift[] | null
  /** SETTLING 이후에 사용 */
  collectedAmount: number | null
  targetAmount: number | null
  confirmedGifts: ConfirmedGift[] | null
  /** ENDED 단계에서 최근 축하 메세지 ID 목록 */
  messageIds: number[] | null
}

/** H01) 함께 선물 대시보드 조회 (로그인 필요) */
export function getTogetherGiftDashboard(fundingId: number | string) {
  return unwrap<TogetherGiftDashboard>(
    apiClient.get(`/api/v1/fundings/${fundingId}/dashboards/together-gift`),
  )
}

// ─── H02: 선물 후보 ───────────────────────────────────────────

export interface GiftCandidateItem {
  fundingGiftId: number
  giftImageUrl: string | null
  giftName: string
  giftPrice: number
  voteCount: number
}

export interface GiftCandidateListResponse {
  /** 내가 투표한 후보 ID 목록 (최대 3개) */
  votedGiftIds: number[]
  candidates: GiftCandidateItem[]
}

export interface GiftVoteToggleResponse {
  fundingGiftId: number
  voted: boolean
}

/** H02) 선물 후보 목록 조회 (로그인 필요) */
export function getGiftCandidates(fundingId: number | string) {
  return unwrap<GiftCandidateListResponse>(
    apiClient.get(`/api/v1/fundings/${fundingId}/gift-candidates`),
  )
}

/** H02) 투표 토글 (로그인 필요) */
export function toggleGiftVote(fundingId: number | string, fundingGiftId: number | string) {
  return unwrap<GiftVoteToggleResponse>(
    apiClient.post(`/api/v1/fundings/${fundingId}/gift-candidates/${fundingGiftId}/votes`, {}),
  )
}

// ─── H06: 선물 후보 등록 ──────────────────────────────────────

export interface GiftCandidateCreateRequest {
  giftName: string
  giftPrice: number
  note: string
  giftImageUrl?: string
  giftPurchaseUrl?: string
}

/** H06) 선물 후보 등록 (CO_HOST 이상) */
export function postGiftCandidate(
  fundingId: number | string,
  payload: GiftCandidateCreateRequest,
) {
  return unwrap<{ fundingGiftId: number }>(
    apiClient.post(`/api/v1/fundings/${fundingId}/gift-candidates`, payload),
  )
}
