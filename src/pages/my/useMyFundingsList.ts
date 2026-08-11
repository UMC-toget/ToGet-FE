import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { getMyFundings } from '../../api/users'
import type { MyFunding, FundingType } from '../../api/users'
import { getTogetherGiftDashboard } from '../../api/groupFundings'

const FETCH_PAGE_SIZE = 50

/** 목록 API가 페이징만 지원해 hasNext를 따라 전부 모읍니다. 탭 필터·정렬은 화면에서 클라이언트 처리합니다 */
function isPastDate(dateString: string): boolean {
  const target = new Date(`${dateString.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(target.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return target.getTime() < today.getTime()
}

async function fetchAllMyFundings(fundingType: FundingType): Promise<MyFunding[]> {
  const all: MyFunding[] = []
  let page = 0
  let hasNext = true
  while (hasNext) {
    const res = await getMyFundings({ page, size: FETCH_PAGE_SIZE })
    all.push(...res.fundings)
    hasNext = res.hasNext
    page += 1
  }
  const filtered = all.filter((funding) => funding.fundingType === fundingType)
  if (fundingType !== 'TOGETHER_GIFT') return filtered

  return Promise.all(
    filtered.map(async funding => {
      if (funding.status === 'ENDED') return funding
      try {
        const dashboard = await getTogetherGiftDashboard(String(funding.fundingId))
        return isPastDate(dashboard.anniversaryDate)
          ? { ...funding, status: 'ENDED' }
          : funding
      } catch (error) {
        console.error('함께 선물 종료일 조회 실패:', error)
        return funding
      }
    }),
  )
}

/** 마이페이지 '내 선물 페이지'/'함께 선물 페이지' 목록 전용 훅 (GET /api/v1/users/me/fundings 전체 조회 후 fundingType으로 필터) */
export function useMyFundingsList(fundingType: FundingType) {
  const { isLoggedIn } = useAuth()
  const query = useQuery({
    queryKey: ['myFundings', 'all', fundingType],
    queryFn: () => fetchAllMyFundings(fundingType),
    enabled: isLoggedIn,
  })
  return { fundings: query.data ?? [], isLoading: query.isLoading }
}
