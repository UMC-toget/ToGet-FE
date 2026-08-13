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

/**
 * 후기 3종 조회 (fundingId 없으면 요청하지 않음)
 * 404(아직 작성된 후기 없음)는 실패가 아니라 정상적인 "없음" 상태라 에러로 던지지 않고 null로 반환한다.
 * 그 외 실패(네트워크/서버 에러 등)만 query의 isError로 남는다.
 */
export function useReview(fundingId: string | undefined, type: ReviewApiType) {
  return useQuery({
    queryKey: ['review', fundingId, type],
    queryFn: async () => {
      try {
        return await getReview(fundingId!, type)
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) return null
        throw error
      }
    },
    enabled: fundingId != null,
    retry: false,
  })
}

/** 작성 실패(404/403/409)를 사용자 안내 문구로 변환 */
export function getReviewSubmitErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as { code?: string; message?: string } | undefined
    const errorCode = responseData?.code ?? ''
    switch (error.response?.status) {
      case 404:
        return '펀딩을 찾을 수 없어요.'
      case 403:
        return '펀딩을 개설한 사람만 작성할 수 있어요.'
      case 409:
        if (errorCode.includes('STATUS')) {
          return '펀딩 마감 처리가 완료되지 않았어요.'
        }
        return responseData?.message || '이미 작성된 후기예요.'
    }
  }
  return '저장에 실패했어요. 다시 시도해 주세요.'
}
