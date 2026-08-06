interface FundingStatusBadgeProps {
  isEnded: boolean
}

/** 선물 준비 상태 배지 (진행중/종료) — 마이페이지 목록 카드 전용 */
export default function FundingStatusBadge({ isEnded }: FundingStatusBadgeProps) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-caption2-m ${
        isEnded ? 'bg-gray-100 text-black' : 'bg-pink-100/50 text-pink-500'
      }`}
    >
      {isEnded ? '종료' : '진행중'}
    </span>
  )
}
