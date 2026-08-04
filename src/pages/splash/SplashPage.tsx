import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import splashVideo from '../../assets/splash.mp4'

// 영상이 재생되지 않거나 ended가 발생하지 않는 경우를 대비한 안전장치 (영상 길이 4초보다 넉넉하게)
const SPLASH_FALLBACK_MS = 6000

/**
 * 서비스 진입 시 처음 표시되는 스플래시 화면. 디자이너 제공 영상 재생이 끝나면 홈 화면으로 이동합니다.
 *
 * 로그인 화면으로 바로 보내지 않는 이유: 구글 OAuth 브랜딩 인증 요건상 비로그인 사용자도
 * 로그인 없이 서비스 내용을 볼 수 있는 홈페이지가 로그인 화면보다 먼저 노출돼야 한다.
 * 홈 화면은 원래 비로그인 상태(B01)를 지원하도록 설계되어 있어 그대로 목적지로 쓸 수 있다.
 */
export default function SplashPage() {
  const navigate = useNavigate()
  const navigatedRef = useRef(false)

  const goToHome = useCallback(() => {
    if (navigatedRef.current) return
    navigatedRef.current = true
    navigate('/home', { replace: true })
  }, [navigate])

  useEffect(() => {
    const timer = setTimeout(goToHome, SPLASH_FALLBACK_MS)
    return () => clearTimeout(timer)
  }, [goToHome])

  return (
    <div className="mx-auto flex h-svh w-full max-w-[402px] items-center justify-center overflow-hidden bg-white">
      <video
        autoPlay
        muted
        playsInline
        onEnded={goToHome}
        onError={goToHome}
        className="size-full object-cover"
      >
        <source src={splashVideo} type="video/mp4" />
      </video>
    </div>
  )
}
