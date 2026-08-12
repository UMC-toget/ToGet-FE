import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { getMyFundings } from '../../api/users'
import { getMyGiftDashboard } from '../../api/fundings'
import { getTogetherGiftDashboard } from '../../api/groupFundings'
import type { MyFunding } from '../../api/users'
import type { MyFundingSummary } from '../../types/funding'

// 홈 카드에는 최대 3개까지만 노출합니다 (피그마 dev 주석 기준). 종료된 펀딩을 걸러내고도 3개를
// 채울 수 있도록, 노출 개수보다 넉넉하게 조회한 뒤 필터링합니다.
const HOME_FUNDING_DISPLAY_SIZE = 3
const HOME_FUNDING_FETCH_SIZE = 10

function toMyFundingSummary(
  funding: MyFunding,
  anniversaryDate: string,
): MyFundingSummary {
  return {
    id: String(funding.fundingId),
    fundingType: funding.fundingType as MyFundingSummary['fundingType'],
    title: funding.title,
    // 홈 카드는 사용자가 등록한 대표 이미지만 사용합니다.
    // 대표 이미지가 없으면 MyFundingCard에서 전용 기본 SVG를 표시합니다.
    thumbnailImage: funding.thumbnailImageUrl,
    targetAmount: funding.targetAmount,
    currentAmount: funding.collectedAmount,
    gaugePercent: funding.progressRate,
    anniversaryDate,
  }
}

/** 펀딩 유형별 대시보드에서 D-day 기준 기념일을 가져옵니다. */
async function getAnniversaryDate(
  funding: MyFunding,
): Promise<string> {
  if (funding.fundingType === 'TOGETHER_GIFT') {
    const dashboard = await getTogetherGiftDashboard(funding.fundingId)
    return dashboard.anniversaryDate
  }
  const dashboard = await getMyGiftDashboard(funding.fundingId)
  return dashboard.anniversaryDate
}

async function getHomeFundings(): Promise<MyFundingSummary[]> {
  const { fundings } = await getMyFundings({ page: 0, size: HOME_FUNDING_FETCH_SIZE })
  // 종료된 선물 페이지는 홈 '진행 중인 내 선물 모으기'에 더 이상 진행 중이 아니므로 노출하지 않습니다.
  const inProgressFundings = fundings.filter((funding) => funding.status !== 'ENDED').slice(0, HOME_FUNDING_DISPLAY_SIZE)

  return Promise.all(
    inProgressFundings.map(async (funding) => {
      // 목록 API의 endDate는 모금 종료일이므로 기념일 D-day에 사용하면 안 됩니다.
      // 각 펀딩 유형의 대시보드에서 사용자가 설정한 실제 기념일과 대표 선물 사진을 조회합니다.
      try {
        const anniversaryDate = await getAnniversaryDate(funding)
        return toMyFundingSummary(funding, anniversaryDate)
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
