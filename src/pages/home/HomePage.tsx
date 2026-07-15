import BottomNav from '../../components/common/BottomNav'
import HomeBanner from './HomeBanner'
import GiftBrowseSection from './GiftBrowseSection'
import togetLogo from '../../assets/toget-logo.svg'

/** 홈 페이지 (B02: 로그인, 진행 중인 선물이 없을 때 기준) */
export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-32">
      <header className="flex h-[50px] shrink-0 items-center px-[18px]">
        <img src={togetLogo} alt="To Get" className="h-6" />
      </header>

      <div className="mt-6 flex flex-col gap-9 px-[18px]">
        <HomeBanner />
        <GiftBrowseSection />
      </div>

      <BottomNav active="home" />
    </div>
  )
}
