import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlusIcon from '../../components/icons/PlusIcon'
import LogOutIcon from '../../components/icons/LogOutIcon'
import heroCat from '../../assets/hero-cat.svg'
import bannerCat from '../../assets/banner-cat.svg'
import { useMyProfile } from '../../hooks/useMyProfile'

// 피그마 배너 스펙 크기(402px 프레임 기준). 화면 폭에 맞춰 이 캔버스를 통째로 스케일링해서
// 텍스트/캐릭터/버튼 간 상대적 위치와 간격이 화면 크기와 무관하게 항상 피그마와 동일하게 유지됩니다.
const BANNER_WIDTH = 366
const BANNER_HEIGHT = 184

interface HomeBannerProps {
  isLoggedIn: boolean
  /** 로그인 상태에서 선물 페이지 만들기 버튼 클릭 시 호출 */
  onCreateClick: () => void
}

/** 홈 상단 배너: 인사말 + 선물 페이지 만들기/로그인 버튼 + 캐릭터 그래픽 (B01/B02) */
export default function HomeBanner({ isLoggedIn, onCreateClick }: HomeBannerProps) {
  const navigate = useNavigate()
  const { data: profile } = useMyProfile()
  const nickname = profile?.nickname
  const containerRef = useRef<HTMLElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const updateScale = () => setScale(el.offsetWidth / BANNER_WIDTH)
    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={containerRef} className="relative w-full" style={{ height: BANNER_HEIGHT * scale }}>
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: BANNER_WIDTH, height: BANNER_HEIGHT, transform: `scale(${scale})` }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-b from-pink-100/50 to-[#fbfcee]">
          <img src={heroCat} alt="" className="absolute -right-11 top-1 h-[167px]" />
        </div>
        <img src={bannerCat} alt="" className="absolute -bottom-2 right-1 h-[148px]" />
        <div className="relative flex h-full flex-col justify-between px-[18px] py-[19px]">
          {isLoggedIn ? (
            <div className="flex flex-col gap-1.5">
              <p className="whitespace-nowrap text-h3-sb leading-normal text-black">
                {nickname ?? '회원'}님!
                <br />
                선물을 함께 준비할까요?
              </p>
              <p className="whitespace-nowrap text-caption1-r leading-normal text-gray-700">
                나를 위한 선물도, 친구를 위한 선물도
                <br />
                함께 마음을 모아 준비해 보세요.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <p className="whitespace-nowrap text-h3-sb leading-normal text-black">
                마음을 모아, 원하는 선물을
                <br />
                함께 준비하는 서비스
              </p>
              <p className="whitespace-nowrap text-caption1-r leading-normal text-gray-700">
                선물을 담고 친구들과 함께
                <br />
                특별한 날을 준비해 보세요.
              </p>
            </div>
          )}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={onCreateClick}
              className="flex h-[34px] w-fit items-center gap-2 rounded-lg bg-pink-500 px-2.5 text-white"
            >
              <span className="text-xs font-semibold">선물 페이지 만들기</span>
              <PlusIcon className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex h-[34px] w-fit items-center gap-2 rounded-lg bg-pink-500 px-2.5 text-white"
            >
              <span className="text-xs font-semibold">로그인하고 시작하기</span>
              <LogOutIcon className="size-4 -scale-y-100 rotate-180" />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
