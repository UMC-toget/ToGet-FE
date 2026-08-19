import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { deleteTogetherDraft, getTogetherDraft, saveTogetherDraft } from '../../api/togetherDraft'
import type { TogetherDraftSaveRequest } from '../../api/togetherDraft'

export const TOGETHER_DRAFT_QUERY_KEY = ['togetherDraft']

/**
 * 작성 중인 함께 펀딩 임시저장 조회 (GET /api/v1/together-drafts 연동)
 * @param enabled 이 조회가 실제로 필요한 시점(예: 선물 만들기 시트가 열렸을 때)에만 true로 넘겨서,
 *   필요 없는 페이지에서까지 매번 호출되지 않도록 한다.
 */
export function useTogetherDraft(enabled = true) {
  const { isLoggedIn } = useAuth()
  return useQuery({
    queryKey: TOGETHER_DRAFT_QUERY_KEY,
    queryFn: getTogetherDraft,
    enabled: isLoggedIn && enabled,
  })
}

/** 함께 펀딩 임시저장 (POST /api/v1/together-drafts 연동) */
export function useSaveTogetherDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TogetherDraftSaveRequest) => saveTogetherDraft(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOGETHER_DRAFT_QUERY_KEY })
    },
  })
}

/** 함께 펀딩 임시저장 삭제 (DELETE /api/v1/together-drafts/{draftId} 연동) */
export function useDeleteTogetherDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (draftId: number) => deleteTogetherDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOGETHER_DRAFT_QUERY_KEY })
    },
  })
}
