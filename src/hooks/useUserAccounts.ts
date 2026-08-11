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
  })
}
