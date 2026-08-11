import { apiClient, unwrap } from '../lib/apiClient'
import type { BankName } from './userAccounts'
import type { FundingDetail, FundingMessage, WishlistItem } from '../types/funding'

export interface CreateFundingRequest {
  fundingType: 'MY_GIFT' | 'TOGETHER_GIFT'
  title: string
  recipientName: string
  anniversaryDate: string
  startDate: string | null
  endDate: string | null
  introduction: string
  thumbnailImageUrl: string | null
  targetAmount: number | null
  userAccountId: number
  invitation: {
    characterId: number
    backgroundId: number
    title: string
    content: string
  }
  visibility: {
    isProgressVisible: boolean
    isParticipantCountVisible: boolean
    isParticipantNameVisible: boolean
    isMessageVisible: boolean
    isCollectedAmountVisible: boolean
  } | null
  gifts: Array<{
    giftName: string
    giftPrice: number
    giftPurchaseUrl: string | null
    giftImageUrl: string | null
  }>
}

/** 작성한 선물 페이지를 실제 펀딩으로 개설합니다. */
export function createFunding(payload: CreateFundingRequest) {
  return unwrap<{ fundingId: number }>(apiClient.post('/api/v1/fundings', payload))
}

export interface UpdateFundingBasicInfoRequest {
  title: string
  anniversaryDate: string
  startDate: string
  endDate: string
  introduction: string
  thumbnailImageUrl: string | null
}

export function updateFundingBasicInfo(fundingId: number | string, payload: UpdateFundingBasicInfoRequest) {
  return unwrap<void>(apiClient.put(`/api/v1/fundings/${fundingId}/basic-info`, payload))
}

export interface UpdateFundingGiftRequest {
  fundingGiftId: number | null
  giftName: string
  giftPrice: number
  giftPurchaseUrl: string | null
  giftImageUrl: string | null
}

export function updateFundingGifts(fundingId: number | string, gifts: UpdateFundingGiftRequest[]) {
  return unwrap<UpdateFundingGiftRequest[]>(apiClient.put(`/api/v1/fundings/${fundingId}/gifts`, gifts))
}

export interface UpdateFundingVisibilityRequest {
  showProgress: boolean
  showParticipantCount: boolean
  showParticipantNames: boolean
  showMessages: boolean
  showAmount: boolean
}

export function updateFundingVisibility(fundingId: number | string, visibility: UpdateFundingVisibilityRequest) {
  return unwrap<void>(apiClient.put(`/api/v1/fundings/${fundingId}/visibility-settings`, visibility))
}

export function updateFundingAccount(fundingId: number | string, userAccountId: number) {
  return unwrap<{ fundingId: number; userAccountId: number }>(
    apiClient.patch(`/api/v1/fundings/${fundingId}/account`, { userAccountId }),
  )
}

export function updateFundingInvitation(
  fundingId: number | string,
  invitation: CreateFundingRequest['invitation'],
) {
  return unwrap<{
    invitationCardId: number
    characterId: number
    backgroundId: number
    title: string
    content: string
  }>(apiClient.put(`/api/v1/fundings/${fundingId}/invitations`, invitation))
}

// ─── my-gift 대시보드 (개설자 전용) ────────────────────────────

export interface MyGiftDashboardResponse {
  fundingId: number
  title: string
  recipientName: string
  anniversaryDate: string
  startDate: string
  endDate: string
  introduction: string
  thumbnailImageUrl: string | null
  targetAmount: number
  collectedAmount: number
  progressRate: number
  participantCount: number
  status: string
  userAccount: {
    userAccountId: number
    bankName: BankName
    account: string
    accountOwner: string
  } | null
  visibility: {
    showProgress: boolean
    showAmount: boolean
    showParticipantCount: boolean
    showParticipantNames: boolean
    showMessages: boolean
  }
  gifts: {
    fundingGiftId: number
    giftName: string
    giftPrice: number
    giftPurchaseUrl: string | null
    giftImageUrl: string | null
  }[]
}

/** E02) 펀딩 상태 변경 (PATCH /api/v1/fundings/{fundingId}/status) */
export function updateFundingStatus(fundingId: number | string, status: string) {
  return unwrap<{ fundingId: number; status: string }>(
    apiClient.patch(`/api/v1/fundings/${fundingId}/status`, { status }),
  )
}

/** E02) 개설자 전용 대시보드 조회 — 비개설자 접근 시 403 */
export function getMyGiftDashboard(fundingId: number | string) {
  return unwrap<MyGiftDashboardResponse>(
    apiClient.get(`/api/v1/fundings/${fundingId}/dashboards/my-gift`),
  )
}

// ─── 참여자 목록 탭 (개설자 전용) ──────────────────────────────

export interface ContributionListItem {
  contributionId: number
  senderName: string | null
  profileImageUrl: string | null
  amount: number
  createdAt: string
}

export interface ContributionListResponse {
  participantCount: number
  totalAmount: number
  contributions: ContributionListItem[]
  currentPage: number
  pageSize: number
  hasNext: boolean
}

/** E02) 개설자 참여자 목록 탭 조회 (GET /api/v1/fundings/{fundingId}/dashboards/contributions) */
export function getFundingContributionList(fundingId: number | string, page = 0, size = 100) {
  return unwrap<ContributionListResponse>(
    apiClient.get(`/api/v1/fundings/${fundingId}/dashboards/contributions`, { params: { page, size } }),
  )
}

/** 개설자가 참여자 금액 수정 (PATCH /api/v1/fundings/{fundingId}/contributions/{contributionId}) */
export function updateContributionAmount(
  fundingId: number | string,
  contributionId: number | string,
  amount: number,
) {
  return unwrap<{ contributionId: number; amount: number }>(
    apiClient.patch(`/api/v1/fundings/${fundingId}/contributions/${contributionId}`, { amount }),
  )
}

// ─── shared-fundings (비개설자 공개 뷰) ────────────────────────

export interface SharedFundingResponse {
  fundingId: number
  title: string
  recipientName: string
  anniversaryDate: string
  endDate: string
  thumbnailImageUrl: string | null
  introduction: string
  targetAmount: number
  /** showAmount=false면 서버가 null로 내려줌 */
  collectedAmount: number | null
  /** showProgress=false면 서버가 null로 내려줌 */
  progressRate: number | null
  /** showParticipantCount=false면 서버가 null로 내려줌 */
  participantCount: number | null
  /** MY_GIFT 기준 SETTLING(진행 중) / ENDED(마감). 자동 마감 배치가 하루 지연될 수 있어 endDate가 아닌 이 값으로 판단 */
  status: string
  gifts: {
    fundingGiftId: number
    giftName: string
    giftPrice: number
    giftImageUrl: string | null
    giftPurchaseUrl: string | null
  }[]
  visibility: {
    showProgress: boolean
    showAmount: boolean
    showParticipantCount: boolean
    showParticipantNames: boolean
    showMessages: boolean
  }
}

/** E02) 비개설자 공개 뷰 (GET /api/v1/shared-fundings/{fundingId}) — 비로그인 가능 */
export function getSharedFunding(fundingId: number | string) {
  return unwrap<SharedFundingResponse>(
    apiClient.get(`/api/v1/shared-fundings/${fundingId}`),
  )
}

/** BE shared-fundings 응답 → FundingDetail 변환 */
export function sharedFundingToFundingDetail(
  data: SharedFundingResponse,
  messages: FundingMessage[],
): FundingDetail {
  const gaugePercent = data.progressRate != null ? Math.min(Math.round(data.progressRate), 100) : 0

  const wishlist: WishlistItem[] = data.gifts.map((g) => ({
    id: String(g.fundingGiftId),
    name: g.giftName,
    price: g.giftPrice,
    imageUrl: g.giftImageUrl ?? '',
    purchaseUrl: g.giftPurchaseUrl ?? '',
  }))

  return {
    id: String(data.fundingId),
    title: data.title,
    hostName: data.recipientName,
    hostFullName: data.recipientName,
    category: '',
    anniversaryDate: data.anniversaryDate,
    deadline: data.endDate,
    greeting: data.introduction,
    targetAmount: data.targetAmount,
    currentAmount: data.collectedAmount,
    progressPercent: data.progressRate != null ? Math.round(data.progressRate) : null,
    gaugePercent,
    participantCount: data.participantCount,
    isOwner: false,
    status: data.status,
    visibility: { ...data.visibility },
    wishlist,
    messages,
  }
}

// ─── my-gift 대시보드 변환 ──────────────────────────────────────

/** BE my-gift 응답 → FundingDetail 변환 */
export function dashboardToFundingDetail(
  data: MyGiftDashboardResponse,
  messages: FundingMessage[],
): FundingDetail {
  const gaugePercent = Math.min(Math.round(data.progressRate), 100)

  const wishlist: WishlistItem[] = data.gifts.map((g) => ({
    id: String(g.fundingGiftId),
    name: g.giftName,
    price: g.giftPrice,
    imageUrl: g.giftImageUrl ?? '',
    purchaseUrl: g.giftPurchaseUrl ?? '',
  }))

  return {
    id: String(data.fundingId),
    title: data.title,
    hostName: data.recipientName,
    hostFullName: data.recipientName,
    category: '',
    anniversaryDate: data.anniversaryDate,
    deadline: data.endDate,
    greeting: data.introduction,
    targetAmount: data.targetAmount,
    currentAmount: data.collectedAmount,
    progressPercent: Math.round(data.progressRate),
    gaugePercent,
    participantCount: data.participantCount,
    isOwner: true,
    status: data.status,
    visibility: { ...data.visibility },
    wishlist,
    messages,
  }
}

// ─── 초대장 카드 조회 ──────────────────────────────────────────

export interface InvitationCardResponse {
  invitationCardId: number
  /** 개설자 이름. 개설자 정보가 없으면 null */
  creatorName: string | null
  characterId: number
  backgroundId: number
  title: string
  content: string
}

/** E01) 초대장 카드 조회 (GET /api/v1/fundings/{fundingId}/invitations) — 비로그인 가능 */
export function getInvitationCard(fundingId: number | string) {
  return unwrap<InvitationCardResponse>(
    apiClient.get(`/api/v1/fundings/${fundingId}/invitations`),
  )
}

// ─── 계좌 조회 ─────────────────────────────────────────────────

export interface FundingAccount {
  bankName: BankName
  account: string
  accountOwner: string
}

/** E03 계좌 안내 (GET /api/v1/fundings/{fundingId}/account) */
export function getFundingAccount(fundingId: number | string) {
  return unwrap<FundingAccount>(
    apiClient.get(`/api/v1/fundings/${fundingId}/account`),
  )
}
