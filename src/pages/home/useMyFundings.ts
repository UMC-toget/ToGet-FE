import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { getMyFundings } from '../../api/users'
import { getMyGiftDashboard } from '../../api/fundings'
import { getTogetherGiftDashboard } from '../../api/groupFundings'
import type { MyFunding } from '../../api/users'
import type { MyFundingSummary } from '../../types/funding'

// 홈 카드에는 최대 3개까지만 노출합니다 (피그마 dev 주석 기준)
const HOME_FUNDING_PAGE_SIZE = 3

function toMyFundingSummary(funding: MyFunding, anniversaryDate: string): MyFundingSummary {
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

async function getHomeFundings(): Promise<MyFundingSummary[]> {
  const { fundings } = await getMyFundings({ page: 0, size: HOME_FUNDING_PAGE_SIZE })

  return Promise.all(
    fundings.map(async (funding) => {
      // 목록 API의 endDate는 모금 종료일이므로 기념일 D-day에 사용하면 안 됩니다.
      // 각 펀딩 유형의 대시보드에서 사용자가 설정한 실제 기념일을 조회합니다.
      try {
        const dashboard = funding.fundingType === 'TOGETHER_GIFT'
          ? await getTogetherGiftDashboard(funding.fundingId)
          : await getMyGiftDashboard(funding.fundingId)
        return toMyFundingSummary(funding, dashboard.anniversaryDate)
      } catch {
        // 향후 목록 API에 기념일이 추가되면 상세 조회 실패 시에도 표시할 수 있습니다.
        return toMyFundingSummary(funding, funding.anniversaryDate ?? '')
      }
    }),
  )
}

/** 홈 화면 '진행 중인 내 선물 모으기' 카드 목록 (GET /api/v1/users/me/fundings 연동) */
export function useMyFundings() {
  const { isLoggedIn } = useAuth()
  const query = useQuery({
    queryKey: ['myFundings'],
    queryFn: getHomeFundings,
    enabled: isLoggedIn,
  })
  return query.data ?? []
}
