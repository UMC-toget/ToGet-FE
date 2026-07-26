import { useQuery } from '@tanstack/react-query'
import { getUserAccounts } from '../api/userAccounts'
import { useAuth } from './useAuth'

export const USER_ACCOUNTS_QUERY_KEY = ['userAccounts']

/** 로그인한 사용자의 등록 계좌 목록 (GET /api/v1/user-accounts 연동) */
export function useUserAccounts() {
  const { isLoggedIn } = useAuth()
  return useQuery({
    queryKey: USER_ACCOUNTS_QUERY_KEY,
    queryFn: getUserAccounts,
    enabled: isLoggedIn,
  })
}
