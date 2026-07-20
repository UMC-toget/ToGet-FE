import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getMockFunding } from './fundingMock'

/**
 * mock 확인용 쿼리를 파싱해 펀딩 데이터를 반환합니다.
 * ?owner=1(개설자) / ?hide=progress,amount,count,names,messages(D04 토글 OFF) / ?over=1(초과 달성)
 * TODO: BE 연동 시 이 훅을 API 조회(useFunding)로 교체
 */
export function useMockFunding() {
  const [searchParams] = useSearchParams()
  return useMemo(() => {
    const isOwner = searchParams.get('owner') === '1'
    const hidden = new Set(searchParams.get('hide')?.split(',') ?? [])
    const isOverAchieved = searchParams.get('over') === '1'
    return getMockFunding(isOwner, hidden, isOverAchieved)
  }, [searchParams])
}
