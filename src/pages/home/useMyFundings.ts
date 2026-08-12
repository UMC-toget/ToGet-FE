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
  giftImage: string | null,
): MyFundingSummary {
  return {
    id: String(funding.fundingId),
    fundingType: funding.fundingType as MyFundingSummary['fundingType'],
    title: funding.title,
    // 카드에는 펀딩 페이지 커버(thumbnailImageUrl)가 아니라 실제 선물 사진을 보여줍니다.
    // 아직 선물이 정해지지 않았으면(TOGETHER_GIFT 투표 전 등) 커버 이미지로 대체합니다.
    thumbnailImage: giftImage ?? funding.thumbnailImageUrl,
    targetAmount: funding.targetAmount,
    currentAmount: funding.collectedAmount,
    gaugePercent: funding.progressRate,
    anniversaryDate,
  }
}

/** 펀딩 유형별 대시보드를 조회해 D-day 기준 기념일과 대표 선물 사진을 함께 가져옵니다. */
async function getAnniversaryAndGiftImage(
  funding: MyFunding,
): Promise<{ anniversaryDate: string; giftImage: string | null }> {
  if (funding.fundingType === 'TOGETHER_GIFT') {
    const dashboard = await getTogetherGiftDashboard(funding.fundingId)
    // 선물이 확정됐으면(confirmedGifts) 그 사진을, 아직 투표 중이면 최다 득표 후보(topGifts) 사진을 사용합니다.
    const giftImage =
      dashboard.confirmedGifts?.[0]?.giftImageUrl ?? dashboard.topGifts?.[0]?.giftImageUrl ?? null
    return { anniversaryDate: dashboard.anniversaryDate, giftImage }
  }
  const dashboard = await getMyGiftDashboard(funding.fundingId)
  return { anniversaryDate: dashboard.anniversaryDate, giftImage: dashboard.gifts[0]?.giftImageUrl ?? null }
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
        const { anniversaryDate, giftImage } = await getAnniversaryAndGiftImage(funding)
        return toMyFundingSummary(funding, anniversaryDate, giftImage)
      } catch {
        // 향후 목록 API에 기념일이 추가되면 상세 조회 실패 시에도 표시할 수 있습니다.
        return toMyFundingSummary(funding, funding.anniversaryDate ?? '', null)
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
