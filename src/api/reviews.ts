import { apiClient, unwrap } from '../lib/apiClient'

/** BE 후기 3종 구분값 (FE 작성 화면의 gift/news/message와 매핑은 reviewTypes.ts 참고) */
export type ReviewApiType = 'review' | 'news' | 'heartfelt'

// ─── 요청 타입 ───────────────────────────────────────────────

/** 선물 후기(reviews) 작성 요청 — title 없이 backgroundId를 직접 가짐 */
export interface ReviewCreateRequest {
  content: string
  backgroundId: number
  images: string[]
  invitationTitle: string
  invitationContent: string
  invitationCharacterId: number
  invitationBackgroundId: number
}

/** 전달소식(news)·마음전하기(heartfelt) 작성 요청 — title 필수, backgroundId는 invitation에만 있음 */
export interface NewsCreateRequest {
  title: string
  content: string
  images: string[]
  invitationTitle: string
  invitationContent: string
  invitationCharacterId: number
  invitationBackgroundId: number
}

export interface ReviewCreateResponse {
  fundingReviewId: number
}

// ─── 응답 타입 ───────────────────────────────────────────────

/** 조회 응답의 type은 요청 경로(review|news|heartfelt)와 달리 대문자로 내려온다 */
export type ReviewDetailType = 'REVIEW' | 'NEWS' | 'HEARTFELT'

export interface ReviewDetail {
  fundingReviewId: number
  type: ReviewDetailType
  /** REVIEW 타입이면 null */
  title: string | null
  content: string
  /** NEWS/HEARTFELT 타입이면 null */
  backgroundId: number | null
  images: string[]
  createdAt: string
}

// ─── API 함수 ─────────────────────────────────────────────────

/** J01) 선물 후기 작성 */
export function createReview(fundingId: number | string, payload: ReviewCreateRequest) {
  return unwrap<ReviewCreateResponse>(apiClient.post(`/api/v1/fundings/${fundingId}/reviews`, payload))
}

/** J03) 전달완료 소식남기기 작성 */
export function createNews(fundingId: number | string, payload: NewsCreateRequest) {
  return unwrap<ReviewCreateResponse>(apiClient.post(`/api/v1/fundings/${fundingId}/news`, payload))
}

/** J02) 마음전하기 작성 */
export function createHeartfelt(fundingId: number | string, payload: NewsCreateRequest) {
  return unwrap<ReviewCreateResponse>(apiClient.post(`/api/v1/fundings/${fundingId}/heartfelt`, payload))
}

/** J01~03) 후기 3종 조회 (type: review|news|heartfelt) */
export function getReview(fundingId: number | string, type: ReviewApiType) {
  return unwrap<ReviewDetail>(apiClient.get(`/api/v1/fundings/${fundingId}/reviews/${type}`))
}
