import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { getMyFundings } from '../../api/users'
import type { MyFunding } from '../../api/users'
import type { MyFundingSummary } from '../../types/funding'

// 홈 카드에는 최대 3개까지만 노출합니다 (피그마 dev 주석 기준)
const HOME_FUNDING_PAGE_SIZE = 3

function toMyFundingSummary(funding: MyFunding): MyFundingSummary {
  return {
    id: String(funding.fundingId),
    title: funding.title,
    thumbnailImage: funding.thumbnailImageUrl,
    targetAmount: funding.targetAmount,
    currentAmount: funding.collectedAmount,
    gaugePercent: funding.progressRate,
    anniversaryDate: funding.endDate,
  }
}

/** 홈 화면 '진행 중인 내 선물 모으기' 카드 목록 (GET /api/v1/users/me/fundings 연동) */
export function useMyFundings() {
  const { isLoggedIn } = useAuth()
  const query = useQuery({
    queryKey: ['myFundings'],
    queryFn: () => getMyFundings({ page: 0, size: HOME_FUNDING_PAGE_SIZE }),
    enabled: isLoggedIn,
  })
  return (query.data?.fundings ?? []).map(toMyFundingSummary)
}
