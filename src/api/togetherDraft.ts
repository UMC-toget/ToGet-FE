import { AxiosError } from 'axios'
import { apiClient, unwrap } from '../lib/apiClient'

// ─── placeholder (BE 스키마 미확정) ────────────────────────────
// TODO: 초대장 카드(Step5) 필드 확정되면 실제 타입으로 교체
export interface TogetherDraftInvitationCard {
  [key: string]: unknown
}

// TODO: 정산 계좌(Step4) 필드 확정되면 실제 타입으로 교체
export interface TogetherDraftAccount {
  [key: string]: unknown
}

// ─── 함께 펀딩 임시저장 ────────────────────────────────────────
// id 없이 유저당 draft 1개 (토큰으로 식별). 아래 필드는 함께 펀딩 만들기
// 1~3단계(기본 정보/위시리스트/공개 범위) 기준, 4~5단계는 스키마 미확정으로 placeholder.

export interface TogetherDraftWishlistItem {
  giftName: string
  giftPrice: number
  giftImageUrl?: string
  giftPurchaseUrl?: string
}

export interface TogetherDraftSaveRequest {
  recipientName?: string
  anniversaryDate?: string
  preparationStartDate?: string
  preparationEndDate?: string
  introduction?: string
  thumbnailImageUrl?: string
  wishlist?: TogetherDraftWishlistItem[]
  showProgress?: boolean
  showAmount?: boolean
  showParticipantCount?: boolean
  showParticipantNames?: boolean
  showMessages?: boolean
  invitationCard?: TogetherDraftInvitationCard
  account?: TogetherDraftAccount
}

export interface TogetherDraftSaveResponse {
  togetherDraftsGiftId: number
}

export interface TogetherDraftDetailResponse {
  togetherDraftsGiftId: number
  recipientName: string | null
  anniversaryDate: string | null
  preparationStartDate: string | null
  preparationEndDate: string | null
  introduction: string | null
  thumbnailImageUrl: string | null
  wishlist: TogetherDraftWishlistItem[]
  showProgress: boolean
  showAmount: boolean
  showParticipantCount: boolean
  showParticipantNames: boolean
  showMessages: boolean
  invitationCard: TogetherDraftInvitationCard | null
  account: TogetherDraftAccount | null
}

/** 함께 펀딩 임시저장 조회 (로그인 필요). 저장된 draft가 없으면 null (401은 그대로 throw) */
export async function getTogetherDraft(): Promise<TogetherDraftDetailResponse | null> {
  try {
    const result = await unwrap<TogetherDraftDetailResponse | null>(
      apiClient.get('/api/v1/together-drafts'),
    )
    return result ?? null
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) return null
    throw error
  }
}

/** 함께 펀딩 임시저장 (신규 저장/덮어쓰기, 로그인 필요) */
export function saveTogetherDraft(payload: TogetherDraftSaveRequest) {
  return unwrap<TogetherDraftSaveResponse>(apiClient.post('/api/v1/together-drafts', payload))
}

/** 함께 펀딩 임시저장 삭제 (로그인 필요) */
export function deleteTogetherDraft() {
  return unwrap<void>(apiClient.delete('/api/v1/together-drafts'))
}
