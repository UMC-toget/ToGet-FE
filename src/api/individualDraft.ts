import { AxiosError } from 'axios'
import { apiClient, unwrap } from '../lib/apiClient'
import type { BankName } from './userAccounts'

export interface DraftInvitationCardRequest {
  title?: string
  content?: string
}

export interface DraftInvitationCardResponse {
  invitationCardId: number
  creatorName: string | null
  characterId: number | null
  backgroundId: number | null
  title: string | null
  content: string | null
}

export interface DraftAccountResponse {
  userAccountId: number
  bankName: BankName
  bankDisplayName: string
  bankIconUrl: string | null
  bankAccount: string
  accountOwner: string
}

export interface IndividualDraftGift {
  giftName: string
  giftPrice: number
  giftShopUrl?: string
  giftImageUrl?: string
}

export interface IndividualDraftVisibility {
  showProgress: boolean
  showAmount: boolean
  showParticipantCount: boolean
  showParticipantNames: boolean
  showMessages: boolean
}

export interface IndividualDraftSaveRequest {
  step?: number
  title?: string
  anniversaryDate?: string
  startDate?: string
  endDate?: string
  greeting?: string
  thumbnailUrl?: string
  userAccountId?: number
  visibilitySettings?: IndividualDraftVisibility
  invitationCard?: DraftInvitationCardRequest
  gifts?: IndividualDraftGift[]
}

export interface IndividualDraftSaveResponse {
  myDraftsGiftId: number
}

export interface IndividualDraftDetailResponse {
  id: number
  step: number
  title: string | null
  anniversaryDate: string | null
  startDate: string | null
  endDate: string | null
  greeting: string | null
  thumbnailUrl: string | null
  account: DraftAccountResponse | null
  visibilitySettings: IndividualDraftVisibility | null
  invitationCard: DraftInvitationCardResponse | null
  gifts: IndividualDraftGift[]
}

export async function getIndividualDraft(): Promise<IndividualDraftDetailResponse | null> {
  try {
    return await unwrap<IndividualDraftDetailResponse | null>(apiClient.get('/api/v1/individual-drafts')) ?? null
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) return null
    throw error
  }
}

export function saveIndividualDraft(payload: IndividualDraftSaveRequest) {
  return unwrap<IndividualDraftSaveResponse>(apiClient.post('/api/v1/individual-drafts', payload))
}

export function deleteIndividualDraft(draftId: number) {
  return unwrap<void>(apiClient.delete(`/api/v1/individual-drafts/${draftId}`))
}
