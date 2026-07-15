import PlusIcon from '../../components/icons/PlusIcon'
import heroCat from '../../assets/hero-cat.svg'
import bannerCat from '../../assets/banner-cat.svg'

// TODO: 가입 API 연동 후 실제 사용자 닉네임으로 교체
const MOCK_NICKNAME = '희주'

/** 홈 상단 배너: 인사말 + 선물 페이지 만들기 버튼 + 캐릭터 그래픽 */
export default function HomeBanner() {
  return (
    <section className="relative h-[184px] w-full">
      <div className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-b from-pink-100/50 to-[#fbfcee]">
        <img src={heroCat} alt="" className="absolute -right-11 top-1 h-[167px]" />
      </div>
      <img src={bannerCat} alt="" className="absolute -bottom-2 right-1 h-[148px]" />
      <div className="relative flex h-full flex-col justify-between px-[18px] py-[19px]">
        <div className="flex flex-col gap-1.5">
          <p className="whitespace-nowrap text-h3-sb leading-normal text-black">
            {MOCK_NICKNAME}님!
            <br />
            선물을 함께 준비할까요?
          </p>
          <p className="whitespace-nowrap text-caption1-r leading-normal text-gray-700">
            나를 위한 선물도, 친구를 위한 선물도
            <br />
            함께 마음을 모아 준비해 보세요.
          </p>
        </div>
        <button
          type="button"
          className="flex h-[34px] w-fit items-center gap-2 rounded-lg bg-pink-500 px-2.5 text-white"
        >
          {/* TODO: 선물 페이지 만들기 플로우 구현 후 연결 */}
          <span className="text-xs font-semibold">선물 페이지 만들기</span>
          <PlusIcon className="size-4" />
        </button>
      </div>
    </section>
  )
}
