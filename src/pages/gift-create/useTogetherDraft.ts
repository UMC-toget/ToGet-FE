import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { deleteTogetherDraft, getTogetherDraft, saveTogetherDraft } from '../../api/togetherDraft'
import type { TogetherDraftSaveRequest } from '../../api/togetherDraft'

export const TOGETHER_DRAFT_QUERY_KEY = ['togetherDraft']

/** 작성 중인 함께 펀딩 임시저장 조회 (GET /api/v1/together-drafts 연동) */
export function useTogetherDraft() {
  const { isLoggedIn } = useAuth()
  return useQuery({
    queryKey: TOGETHER_DRAFT_QUERY_KEY,
    queryFn: getTogetherDraft,
    enabled: isLoggedIn,
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

/** 함께 펀딩 임시저장 삭제 (DELETE /api/v1/together-drafts 연동) */
export function useDeleteTogetherDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTogetherDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOGETHER_DRAFT_QUERY_KEY })
    },
  })
}
