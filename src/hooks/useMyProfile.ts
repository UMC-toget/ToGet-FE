import { useQuery } from '@tanstack/react-query'
import { getMyProfile } from '../api/users'
import { useAuth } from './useAuth'

/** 로그인한 사용자의 프로필 정보 (GET /api/v1/users/me 연동) */
export function useMyProfile() {
  const { isLoggedIn } = useAuth()
  return useQuery({
    queryKey: ['myProfile'],
    queryFn: getMyProfile,
    enabled: isLoggedIn,
  })
}
