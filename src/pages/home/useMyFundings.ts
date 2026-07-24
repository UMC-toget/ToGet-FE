import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getMockMyFundings } from './myFundingsMock'

/**
 * 홈 화면 '진행 중인 내 선물 모으기' 카드 목록을 반환합니다.
 * ?mine=0|1|3 쿼리로 진행 중인 선물 없음/1개/여러 개 상태를 확인할 수 있습니다.
 * TODO: BE 연동 시 이 훅을 API 조회로 교체
 */
export function useMyFundings() {
  const [searchParams] = useSearchParams()
  return useMemo(() => {
    const count = Number(searchParams.get('mine') ?? 0)
    return getMockMyFundings(Number.isFinite(count) ? count : 0)
  }, [searchParams])
}
