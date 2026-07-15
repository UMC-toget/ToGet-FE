import { useContext } from 'react'
import { AuthContext } from '../contexts/auth'

/** 로그인 상태와 login/logout 함수를 반환합니다. AuthProvider 안에서만 사용 가능합니다. */
export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다')
  return auth
}
