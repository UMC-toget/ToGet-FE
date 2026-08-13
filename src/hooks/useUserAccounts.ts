import { useQuery } from '@tanstack/react-query'
import { detectBanks, getBanks, getUserAccounts } from '../api/userAccounts'
import { useAuth } from './useAuth'
import { useDebouncedValue } from './useDebouncedValue'

export const USER_ACCOUNTS_QUERY_KEY = ['userAccounts']
export const BANKS_QUERY_KEY = ['banks']

/** 로그인한 사용자의 등록 계좌 목록 (GET /api/v1/user-accounts 연동) */
export function useUserAccounts() {
  const { isLoggedIn } = useAuth()
  return useQuery({
    queryKey: USER_ACCOUNTS_QUERY_KEY,
    queryFn: getUserAccounts,
    enabled: isLoggedIn,
  })
}

/** 은행 목록 (아이콘 URL 포함, GET /api/v1/banks 연동). 로그인 여부와 무관한 참조 데이터라 항상 조회합니다. */
export function useBanks() {
  return useQuery({
    queryKey: BANKS_QUERY_KEY,
    queryFn: getBanks,
    staleTime: 60 * 60 * 1000,
  })
}

/**
 * 추천 칩으로 보여줄 최대 은행 개수. 계좌번호 자릿수 체계상 여러 은행이 동시에 매칭될 수 있어
 * 서버가 후보를 다수(많게는 10개 가까이) 내려줄 때가 있는데, 전부 보여주면 "추천"이 아니라
 * "은행 목록 나열"이 돼버립니다. 토스가 1개 강제 대신 상위 3개 추천으로 정확도를 끌어올린 사례를
 * 참고해 상위 3개만 노출합니다(서버 응답은 이미 신뢰도 순으로 정렬되어 내려옵니다).
 */
const MAX_SUGGESTED_BANKS = 3

/**
 * 계좌번호로 추론되는 은행 목록 (POST /api/v1/banks/detections 연동).
 * 타이핑 중 매 자리마다 호출되지 않도록 300ms 디바운스하고, 은행을 이미 골랐거나
 * 계좌번호가 너무 짧으면(3자리 미만) 호출하지 않습니다.
 */
export function useBankDetection(accountNumber: string, enabled: boolean) {
  const debouncedAccountNumber = useDebouncedValue(accountNumber, 300)
  return useQuery({
    queryKey: ['bankDetection', debouncedAccountNumber],
    queryFn: () => detectBanks(debouncedAccountNumber),
    enabled: enabled && debouncedAccountNumber.length >= 3,
    staleTime: 5 * 60 * 1000,
    select: (banks) => banks.slice(0, MAX_SUGGESTED_BANKS),
  })
}
