import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import splashGif from '../../assets/splash.gif'

// GIF는 영상과 달리 재생 종료를 알려주는 이벤트가 없어(onEnded 같은 게 없음), 타이머로만
// 홈 이동을 트리거합니다. GIF 1회 재생 길이에 맞춰 조정하세요.
// 타이머는 onLoad(첫 프레임이 실제로 그려지기 시작하는 시점)부터 재는데, 마운트 시점부터 재면
// 다운로드가 느린 첫 방문(캐시 없음)에서 애니메이션이 끝나기 전에 홈으로 넘어가 버린다.
const SPLASH_DURATION_MS = 4000

/**
 * 서비스 진입 시 처음 표시되는 스플래시 화면. GIF 재생 후 홈 화면으로 이동합니다.
 *
 * 로그인 화면으로 바로 보내지 않는 이유: 구글 OAuth 브랜딩 인증 요건상 비로그인 사용자도
 * 로그인 없이 서비스 내용을 볼 수 있는 홈페이지가 로그인 화면보다 먼저 노출돼야 한다.
 * 홈 화면은 원래 비로그인 상태(B01)를 지원하도록 설계되어 있어 그대로 목적지로 쓸 수 있다.
 */
export default function SplashPage() {
  const navigate = useNavigate()
  const navigatedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goToHome = useCallback(() => {
    if (navigatedRef.current) return
    navigatedRef.current = true
    navigate('/home', { replace: true })
  }, [navigate])

  const handleLoad = useCallback(() => {
    if (timerRef.current) return
    timerRef.current = setTimeout(goToHome, SPLASH_DURATION_MS)
  }, [goToHome])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className="mx-auto flex h-svh w-full max-w-[402px] items-center justify-center overflow-hidden bg-white">
      <img
        src={splashGif}
        alt=""
        onLoad={handleLoad}
        onError={(e) => {
          console.error('스플래시 GIF 로드/디코딩 실패', e)
          goToHome()
        }}
        className="size-full object-cover"
      />
    </div>
  )
}
