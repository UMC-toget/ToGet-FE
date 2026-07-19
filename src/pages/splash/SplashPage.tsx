import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SplashLogo from './SplashLogo'

// 디자이너 제공 스플래시 영상(약 4초, 로고 필기가 ~3.45초에 완료된 뒤 정지)을 기준으로 맞춘 값입니다.
const SPLASH_DURATION_MS = 4000

/** 서비스 진입 시 처음 표시되는 스플래시 화면. 로고가 손글씨처럼 그려진 뒤 로그인 페이지로 이동합니다. */
export default function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/login', { replace: true }), SPLASH_DURATION_MS)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <SplashLogo />
    </div>
  )
}
