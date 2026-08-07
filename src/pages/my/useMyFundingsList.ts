import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { getMyFundings } from '../../api/users'
import type { MyFunding, FundingType } from '../../api/users'

const FETCH_PAGE_SIZE = 50

/** 목록 API가 페이징만 지원해 hasNext를 따라 전부 모읍니다. 탭 필터·정렬은 화면에서 클라이언트 처리합니다 */
async function fetchAllMyFundings(): Promise<MyFunding[]> {
  const all: MyFunding[] = []
  let page = 0
  let hasNext = true
  while (hasNext) {
    const res = await getMyFundings({ page, size: FETCH_PAGE_SIZE })
    all.push(...res.fundings)
    hasNext = res.hasNext
    page += 1
  }
  return all
}

/** 마이페이지 '내 선물 페이지'/'함께 선물 페이지' 목록 전용 훅 (GET /api/v1/users/me/fundings 전체 조회 후 fundingType으로 필터) */
export function useMyFundingsList(fundingType: FundingType) {
  const { isLoggedIn } = useAuth()
  const query = useQuery({
    queryKey: ['myFundings', 'all'],
    queryFn: fetchAllMyFundings,
    enabled: isLoggedIn,
  })
  const fundings = (query.data ?? []).filter((funding) => funding.fundingType === fundingType)
  return { fundings, isLoading: query.isLoading }
}
