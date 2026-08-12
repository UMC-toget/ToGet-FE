import axios from 'axios'
import { apiClient, unwrap } from '../lib/apiClient'

// ─── 공통 ─────────────────────────────────────────────────────

export type GroupFundingStatus = 'SELECTING' | 'SETTLING' | 'PURCHASING' | 'DELIVERING' | 'ENDED'

// ─── H01: 함께 선물 대시보드 ──────────────────────────────────

/** 함께 선물 멤버 역할 (BE enum). CREATOR=방장, ADMIN=공동관리자, PARTICIPANT=참여자 */
export type FundingMemberRole = 'CREATOR' | 'ADMIN' | 'PARTICIPANT'

export interface MemberSummary {
  fundingMemberId: number
  userId: number
  name: string
  profileImageUrl: string | null
  role: FundingMemberRole
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
  purchaseUrl?: string | null
}

export interface TogetherGiftDashboard {
  fundingId: number
  status: GroupFundingStatus
  fundingTitle?: string
  anniversaryDate: string
  /** 준비 기간 시작일 "YYYY-MM-DD" (수정 화면 prefill용) */
  startDate?: string | null
  /** 준비 기간 종료일 "YYYY-MM-DD" (수정 화면 prefill용) */
  endDate?: string | null
  recipientName: string
  introduction: string
  thumbnailImageUrl: string | null
  /** 조회자의 역할 (BE가 직접 판별해 내려줌). 비회원·미합류 회원이면 null */
  myRole: FundingMemberRole | null
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

/** H01) 함께 선물 대시보드 조회 (공개 — 로그인 불필요, 초대장 링크를 아는 누구나 조회 가능) */
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

/** H02) 선물 후보 의견(댓글) 작성 (로그인, POST /api/v1/fundings/{fundingId}/gift-candidates/{giftId}/comments) */
export function postGiftCandidateComment(
  fundingId: number | string,
  giftId: number | string,
  content: string,
) {
  return unwrap<{ commentId: number }>(
    apiClient.post(`/api/v1/fundings/${fundingId}/gift-candidates/${giftId}/comments`, { content }),
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

/** H05) 참여자 입금 완료 신고 (로그인, POST /api/v1/fundings/{fundingId}/members/me/contributions)
 *  정산 참여자 전용 — 정산액은 이미 확정돼 있어 금액(amount)은 안 보냄. 편지(content)는 선택.
 *  E섹션 개인펀딩 후원 POST /contributions(MY_GIFT)와는 별개 엔드포인트. */
export interface SettlementContributionRequest {
  /** 축하 카드 배경 ID (편지 없을 땐 기본 1) */
  backgroundId: number
  /** 편지 내용 (선택) */
  content?: string
  isPrivate: boolean
}

export function postSettlementContribution(
  fundingId: number | string,
  payload: SettlementContributionRequest,
) {
  return unwrap<void>(
    apiClient.post(`/api/v1/fundings/${fundingId}/members/me/contributions`, payload),
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
  role: 'ADMIN' | 'PARTICIPANT',
) {
  return unwrap<MemberSummary>(
    apiClient.patch(`/api/v1/fundings/${fundingId}/members/${memberId}/role`, { role }),
  )
}

/** 선물·정산 참여자 확정 (HOST 전용, POST /api/v1/fundings/{fundingId}/final-selections)
 *  최종 선물 목록 + 정산에 포함할 참여자를 확정하며 SELECTING → SETTLING으로 넘어감. */
export interface FinalSelectionsRequest {
  giftIds: number[]
  settlementMemberIds: number[]
}

export function postFinalSelections(
  fundingId: number | string,
  payload: FinalSelectionsRequest,
) {
  return unwrap<void>(
    apiClient.post(`/api/v1/fundings/${fundingId}/final-selections`, payload),
  )
}

/** 구매내역 업로드 (HOST 전용, POST /api/v1/fundings/{fundingId}/gifts/{giftId}/purchase)
 *  ENDED 단계에서 펀딩금으로 구매한 선물의 구매처 링크·영수증 이미지를 등록. 둘 다 필수. */
export interface GiftPurchaseRequest {
  purchaseUrl: string
  receiptImageUrl: string
}

export function postGiftPurchase(
  fundingId: number | string,
  giftId: number | string,
  payload: GiftPurchaseRequest,
) {
  return unwrap<void>(
    apiClient.post(`/api/v1/fundings/${fundingId}/gifts/${giftId}/purchase`, payload),
  )
}

/** 펀딩 상태 전환 (HOST 전용, PATCH /api/v1/fundings/{fundingId}/status) */
export function updateGroupFundingStatus(
  fundingId: number | string,
  status: GroupFundingStatus,
) {
  return unwrap<{ status: GroupFundingStatus }>(
    apiClient.patch(`/api/v1/fundings/${fundingId}/status`, { status }),
  )
}

/** 함께 선물하기 참여(합류, POST /api/v1/fundings/{fundingId}/members)
 *  로그인한 사용자를 이 펀딩의 멤버로 등록한다. 합류는 자동이 아니라 이 호출이 있어야 하고,
 *  투표·편지 같은 첫 참여 액션 직전에 부른다. 이미 멤버면 BE가 409(FUNDING409_12)를 주는데
 *  "첫 액션 때 합류" 흐름에선 정상 상황이라 조용히 넘긴다. */
export async function joinGroupFunding(fundingId: number | string): Promise<void> {
  try {
    await unwrap<void>(apiClient.post(`/api/v1/fundings/${fundingId}/members`, {}))
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 409) return
    throw err
  }
}

/** 함께 선물 나가기 (참여자·공동관리자, DELETE /api/v1/fundings/{fundingId}/members/me)
 *  나가면 투표 내역이 사라지고 참여자에서 제외됨. HOST는 사용 불가. */
export function leaveGroupFunding(fundingId: number | string) {
  return unwrap<void>(apiClient.delete(`/api/v1/fundings/${fundingId}/members/me`))
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
