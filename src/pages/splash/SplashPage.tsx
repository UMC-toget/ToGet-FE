import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import togetLogo from '../../assets/toget-logo.svg'

const SPLASH_DURATION_MS = 2000

/** 서비스 진입 시 처음 표시되는 스플래시 화면. 일정 시간 후 로그인 페이지로 이동합니다. */
export default function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/login', { replace: true }), SPLASH_DURATION_MS)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      {/* TODO: 디자이너에게 스플래시 영상 원본(mp4)을 받으면 <video autoPlay muted playsInline>으로 교체 */}
      <img src={togetLogo} alt="To Get" className="w-[207px]" />
    </div>
  )
}
