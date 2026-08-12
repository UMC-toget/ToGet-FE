import { AxiosError } from 'axios'
import { apiClient, unwrap } from '../lib/apiClient'
import type { DraftAccountResponse, DraftInvitationCardRequest } from './individualDraft'

export interface TogetherDraftSaveRequest {
  step?: number
  title?: string
  receiver?: string
  anniversaryDate?: string
  startDate?: string
  endDate?: string
  description?: string
  thumbnailImageUrl?: string
  userAccountId?: number
  invitationCard?: DraftInvitationCardRequest
}

export interface TogetherDraftSaveResponse {
  togetherDraftsGiftId: number
}

export interface TogetherDraftDetailResponse {
  togetherDraftsGiftId: number
  step: number
  title: string | null
  receiver: string | null
  anniversaryDate: string | null
  startDate: string | null
  endDate: string | null
  description: string | null
  thumbnailImageUrl: string | null
  account: DraftAccountResponse | null
  cardTitle: string | null
  cardContent: string | null
}

export async function getTogetherDraft(): Promise<TogetherDraftDetailResponse | null> {
  try {
    return await unwrap<TogetherDraftDetailResponse | null>(apiClient.get('/api/v1/together-drafts')) ?? null
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) return null
    throw error
  }
}

export function saveTogetherDraft(payload: TogetherDraftSaveRequest) {
  return unwrap<TogetherDraftSaveResponse>(apiClient.post('/api/v1/together-drafts', payload))
}

export function deleteTogetherDraft(draftId: number) {
  return unwrap<void>(apiClient.delete(`/api/v1/together-drafts/${draftId}`))
}
