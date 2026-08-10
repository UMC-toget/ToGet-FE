import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { getMyFundings } from '../../api/users'
import type { MyFunding } from '../../api/users'
import { getTogetherGiftDashboard } from '../../api/groupFundings'
import type { MyFundingSummary } from '../../types/funding'

// 홈 카드에는 최대 3개까지만 노출합니다 (피그마 dev 주석 기준)
const HOME_FUNDING_PAGE_SIZE = 3

function toMyFundingSummary(funding: MyFunding, anniversaryDate = funding.endDate): MyFundingSummary {
  return {
    id: String(funding.fundingId),
    fundingType: funding.fundingType as MyFundingSummary['fundingType'],
    title: funding.title,
    thumbnailImage: funding.thumbnailImageUrl,
    targetAmount: funding.targetAmount,
    currentAmount: funding.collectedAmount,
    gaugePercent: funding.progressRate,
    anniversaryDate,
  }
}

/** 홈 화면 '진행 중인 내 선물 모으기' 카드 목록 (GET /api/v1/users/me/fundings 연동) */
export function useMyFundings() {
  const { isLoggedIn } = useAuth()
  const query = useQuery({
    queryKey: ['myFundings'],
    queryFn: async () => {
      const response = await getMyFundings({ page: 0, size: HOME_FUNDING_PAGE_SIZE })

      return Promise.all(
        response.fundings.map(async funding => {
          if (funding.fundingType !== 'TOGETHER_GIFT') {
            return toMyFundingSummary(funding)
          }

          try {
            const dashboard = await getTogetherGiftDashboard(String(funding.fundingId))
            return toMyFundingSummary(funding, dashboard.anniversaryDate)
          } catch (error) {
            console.error('함께 선물 기념일 조회 실패:', error)
            return toMyFundingSummary(funding)
          }
        }),
      )
    },
    enabled: isLoggedIn,
  })
  return query.data ?? []
}
