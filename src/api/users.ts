import { apiClient, unwrap } from '../lib/apiClient'

export interface UserProfile {
  userId: number
  email: string
  /** 닉네임 (서비스 내 표시명, 수정 가능) */
  nickname: string
  /** 실명 (소셜 로그인 제공자 기준, 수정 불가) */
  name: string
  profileImageUrl: string | null
  /** KAKAO / GOOGLE / APPLE */
  oauthProvider: string
}

export interface UserProfileUpdateResult {
  userId: number
  nickname: string
  profileImageUrl: string | null
}

/** 서버 소셜 로그인 제공자 코드 -> 화면에 표시할 한글 라벨 */
export const OAUTH_PROVIDER_LABELS: Record<string, string> = {
  KAKAO: '카카오톡',
  GOOGLE: '구글',
  APPLE: '애플',
}

export function getMyProfile() {
  return unwrap<UserProfile>(apiClient.get('/api/v1/users/me'))
}

export function updateMyProfile(payload: { nickname?: string; profileImageUrl?: string }) {
  return unwrap<UserProfileUpdateResult>(apiClient.patch('/api/v1/users/me', payload))
}

export function deleteMyProfileImage() {
  return unwrap<UserProfileUpdateResult>(apiClient.delete('/api/v1/users/me/profile-image'))
}

/** 회원 탈퇴 (soft delete) */
export function withdrawMe() {
  return unwrap<void>(apiClient.delete('/api/v1/users/me'))
}

export type FundingType = 'MY_GIFT' | 'TOGETHER_GIFT'
export type FundingStatus = string

export interface MyFunding {
  fundingId: number
  fundingType: FundingType
  title: string
  recipientName: string
  targetAmount: number
  collectedAmount: number
  /** 0~100 */
  progressRate: number
  status: FundingStatus
  /** 사용자가 설정한 기념일. 구버전 응답에서는 없을 수 있습니다. */
  anniversaryDate?: string | null
  /** 함께 선물(TOGETHER_GIFT)은 선물 확정 전까지 null (BE 응답 기준) */
  endDate: string | null
  thumbnailImageUrl: string | null
  createdAt: string
  /** 종료된 내 선물 페이지에 대해 후기 작성 여부 (내 선물 카드의 작성/조회 버튼 분기용) */
  hasReview: boolean
  /** 함께 선물(TOGETHER_GIFT) 참여 인원 수 (개설자 포함) */
  participantCount: number
}

export interface MyFundingList {
  fundings: MyFunding[]
  currentPage: number
  pageSize: number
  hasNext: boolean
}

export function getMyFundings(params?: { page?: number; size?: number }) {
  return unwrap<MyFundingList>(apiClient.get('/api/v1/users/me/fundings', { params }))
}
