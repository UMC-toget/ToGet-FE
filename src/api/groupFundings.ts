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
  title?: string
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

// ─── H02: 선물 후보 상세 ──────────────────────────────────────

export interface GiftCandidateComment {
  commentId: number
  authorName: string
  authorProfileImageUrl: string | null
  content: string
}

export interface GiftCandidateDetail extends GiftCandidateItem {
  note: string
  giftPurchaseUrl: string | null
  registrantName: string
  registrantProfileImageUrl: string | null
  isVotedByMe: boolean
  comments: GiftCandidateComment[]
}

/** H02) 선물 후보 단건 조회 (GET /api/v1/fundings/{fundingId}/gift-candidates/{giftId}) */
export function getGiftCandidateDetail(fundingId: number | string, giftId: number | string) {
  return unwrap<GiftCandidateDetail>(
    apiClient.get(`/api/v1/fundings/${fundingId}/gift-candidates/${giftId}`),
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

// ─── H05: 정산 내역 ───────────────────────────────────────────

/** BE SettlementStatus: UNPAID(미입금) → PAID(입금 대기) → CONFIRMED(입금 확인) */
export type SettlementStatus = 'UNPAID' | 'PAID' | 'CONFIRMED'

export interface SettlementInfo {
  fundingMemberId: number
  userId: number
  name: string
  profileImageUrl: string | null
  amountDue: number
  settlementStatus: SettlementStatus
}

export interface FundingSettlementListResponse {
  settlementParticipantCount: number
  totalSettlementAmount: number
  settlements: SettlementInfo[]
}

/** H05) 정산 내역 조회 (HOST/CO_HOST, GET /api/v1/fundings/{fundingId}/dashboards/settlements) */
export function getFundingSettlements(fundingId: number | string) {
  return unwrap<FundingSettlementListResponse>(
    apiClient.get(`/api/v1/fundings/${fundingId}/dashboards/settlements`),
  )
}

// ─── H 참여자 목록 ────────────────────────────────────────────

/** BE FundingMemberManagementResponse — HOST 전용, SELECTING 상태에서만 조회 가능 */
export interface MembersTabResponse {
  totalCount: number
  adminCount: number
  participantCount: number
  admins: MemberSummary[]
  participants: MemberSummary[]
}

/** 함께 선물 참여자 목록 조회 (GET /api/v1/fundings/{fundingId}/dashboards/members) */
export function getGroupMembers(fundingId: number | string) {
  return unwrap<MembersTabResponse>(
    apiClient.get(`/api/v1/fundings/${fundingId}/dashboards/members`),
  )
}

/** H05) 정산 입금 상태 수정 (HOST, PATCH /api/v1/fundings/{fundingId}/members/{memberId}/settlement-status) */
export function updateSettlementStatus(
  fundingId: number | string,
  memberId: number | string,
  settlementStatus: SettlementStatus,
) {
  return unwrap<{ fundingMemberId: number; settlementStatus: SettlementStatus }>(
    apiClient.patch(`/api/v1/fundings/${fundingId}/members/${memberId}/settlement-status`, { settlementStatus }),
  )
}

// ─── H06: 선물 후보 등록 ──────────────────────────────────────

/** 참여자 역할 변경 (HOST 전용, PATCH /api/v1/fundings/{fundingId}/members/{memberId}/role) */
export function updateMemberRole(
  fundingId: number | string,
  memberId: number | string,
  role: 'CO_HOST' | 'MEMBER',
) {
  return unwrap<MemberSummary>(
    apiClient.patch(`/api/v1/fundings/${fundingId}/members/${memberId}/role`, { role }),
  )
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
