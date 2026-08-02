import { AxiosError } from 'axios'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createReview, createNews, createHeartfelt, getReview } from '../../api/reviews'
import type { ReviewApiType } from '../../api/reviews'

/** 선물 후기(gift) 작성 뮤테이션 */
export function useCreateReview(fundingId: number | string) {
  return useMutation({
    mutationFn: (payload: Parameters<typeof createReview>[1]) => createReview(fundingId, payload),
  })
}

/** 전달완료 소식남기기(news) 작성 뮤테이션 */
export function useCreateNews(fundingId: number | string) {
  return useMutation({
    mutationFn: (payload: Parameters<typeof createNews>[1]) => createNews(fundingId, payload),
  })
}

/** 마음전하기(heartfelt) 작성 뮤테이션 */
export function useCreateHeartfelt(fundingId: number | string) {
  return useMutation({
    mutationFn: (payload: Parameters<typeof createHeartfelt>[1]) => createHeartfelt(fundingId, payload),
  })
}

/** 후기 3종 조회 (fundingId 없으면 요청하지 않음) */
export function useReview(fundingId: string | undefined, type: ReviewApiType) {
  return useQuery({
    queryKey: ['review', fundingId, type],
    queryFn: () => getReview(fundingId!, type),
    enabled: fundingId != null,
    retry: false,
  })
}

/** 작성 실패(404/403/409)를 사용자 안내 문구로 변환 */
export function getReviewSubmitErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    switch (error.response?.status) {
      case 404:
        return '펀딩을 찾을 수 없거나 아직 완료되지 않았어요.'
      case 403:
        return '펀딩을 개설한 사람만 작성할 수 있어요.'
      case 409:
        return '이미 작성된 후기예요.'
    }
  }
  return '저장에 실패했어요. 다시 시도해 주세요.'
}
