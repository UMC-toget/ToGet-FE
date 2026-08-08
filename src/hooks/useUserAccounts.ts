import { useQuery } from '@tanstack/react-query'
import { getBanks, getUserAccounts } from '../api/userAccounts'
import { useAuth } from './useAuth'

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
