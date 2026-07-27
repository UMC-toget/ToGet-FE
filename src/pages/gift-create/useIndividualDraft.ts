import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { deleteIndividualDraft, getIndividualDraft, saveIndividualDraft } from '../../api/individualDraft'
import type { IndividualDraftSaveRequest } from '../../api/individualDraft'

export const INDIVIDUAL_DRAFT_QUERY_KEY = ['individualDraft']

/** 작성 중인 개인 펀딩 임시저장 조회 (GET /api/v1/individual-drafts 연동) */
export function useIndividualDraft() {
  const { isLoggedIn } = useAuth()
  return useQuery({
    queryKey: INDIVIDUAL_DRAFT_QUERY_KEY,
    queryFn: getIndividualDraft,
    enabled: isLoggedIn,
  })
}

/** 개인 펀딩 임시저장 (POST /api/v1/individual-drafts 연동) */
export function useSaveIndividualDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: IndividualDraftSaveRequest) => saveIndividualDraft(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INDIVIDUAL_DRAFT_QUERY_KEY })
    },
  })
}

/** 개인 펀딩 임시저장 삭제 (DELETE /api/v1/individual-drafts 연동) */
export function useDeleteIndividualDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteIndividualDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INDIVIDUAL_DRAFT_QUERY_KEY })
    },
  })
}
