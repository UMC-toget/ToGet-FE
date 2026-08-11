import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMyProfile } from './useMyProfile'
import { isAdminProfile } from '../lib/admin'

/**
 * 관리자 전용 화면 진입 가드. 실제 권한 검증은 백엔드가 API 호출 시 다시 하므로,
 * 이건 관리자가 아닌 사용자에게 관리 화면을 보여주지 않기 위한 UX용 가드다.
 */
export function useRequireAdmin() {
  const { data: profile, isLoading } = useMyProfile()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading) return
    if (!isAdminProfile(profile)) {
      navigate('/my', { replace: true })
    }
  }, [isLoading, profile, navigate])
}
