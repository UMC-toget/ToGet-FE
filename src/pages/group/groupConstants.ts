import type { GroupFundingStatus, MemberSummary } from '../../api/groupFundings'

export const STATUS_LABELS: Record<GroupFundingStatus, string> = {
  SELECTING: '선물 고르는 중',
  SETTLING: '금액 모으는 중',
  PURCHASING: '선물 구매 중',
  DELIVERING: '선물 전달 중',
  ENDED: '선물 전달 완료',
}

export const ROLE_LABELS: Record<MemberSummary['role'], string> = {
  HOST: '방장',
  CO_HOST: '부방장',
  MEMBER: '참여자',
}

export const STATUS_ORDER: GroupFundingStatus[] = [
  'SELECTING',
  'SETTLING',
  'PURCHASING',
  'DELIVERING',
  'ENDED',
]
