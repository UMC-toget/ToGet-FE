import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { deleteIndividualDraft, getIndividualDraft, saveIndividualDraft } from '../../api/individualDraft'
import type { IndividualDraftSaveRequest } from '../../api/individualDraft'

export const INDIVIDUAL_DRAFT_QUERY_KEY = ['individualDraft']

/**
 * 작성 중인 개인 펀딩 임시저장 조회 (GET /api/v1/individual-drafts 연동)
 * @param enabled 이 조회가 실제로 필요한 시점(예: 선물 만들기 시트가 열렸을 때)에만 true로 넘겨서,
 *   필요 없는 페이지에서까지 매번 호출되지 않도록 한다.
 */
export function useIndividualDraft(enabled = true) {
  const { isLoggedIn } = useAuth()
  return useQuery({
    queryKey: INDIVIDUAL_DRAFT_QUERY_KEY,
    queryFn: getIndividualDraft,
    enabled: isLoggedIn && enabled,
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

/** 개인 펀딩 임시저장 삭제 (DELETE /api/v1/individual-drafts/{draftId} 연동) */
export function useDeleteIndividualDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (draftId: number) => deleteIndividualDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INDIVIDUAL_DRAFT_QUERY_KEY })
    },
  })
}
