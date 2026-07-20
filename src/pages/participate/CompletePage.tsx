import { useNavigate, useParams } from 'react-router-dom'
import { useMockFunding } from '../funding/useMockFunding'
import completeCat from '../../assets/complete-cat.svg'
import heartBig from '../../assets/heart-big.svg'
import heartRight from '../../assets/heart-right.svg'
import heartSmall from '../../assets/heart-small.svg'

/**
 * E04) 내 선물 참여: 축하 완료 (피그마 1643-63087)
 */
export default function CompletePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const funding = useMockFunding()

  return (
    // antialiased 없으면 폰트가 피그마보다 굵게 렌더링됨
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-white antialiased">
      <div className="pointer-events-none absolute left-[58px] top-[292px] size-[286px] rounded-full bg-pink-500 opacity-45 blur-[100px]" />

      <img
        src={heartSmall}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[288px] top-[138px] w-[13.82px] rotate-[22.94deg]"
      />
      <img
        src={heartSmall}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[82px] top-[211px] w-[19.41px] -rotate-[19.05deg]"
      />
      <img
        src={heartSmall}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[319px] top-[289px] w-[29.46px] rotate-[6.31deg]"
      />
      <img
        src={heartBig}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[295px] top-[311px] w-[46.73px] rotate-[23.45deg]"
      />
      <img
        src={heartRight}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[38px] top-[505px] w-[34.84px] -rotate-[34.26deg]"
      />

      {/* relative: 배경 글로우/하트 위에 올라오도록 */}
      <div className="relative flex flex-col items-center pt-[154px]">
        {/* 24px 타이틀은 @theme에 대응 토큰이 없어 arbitrary 값 사용 */}
        <h1 className="text-center text-[24px] font-semibold leading-[35px] text-black">
          함께 축하해 주셔서
          <br />
          <span className="text-pink-500">정말 고마워요!</span>
        </h1>

        <p className="mt-[23px] w-[267px] text-center text-b2-m leading-[15px] text-gray-600">
          {funding.hostName}님의 특별한 날
          <br />
          따뜻한 마음을 모아 전달할게요
        </p>

        <img src={completeCat} alt="축하 완료" className="mt-[59px] w-[268px]" />
      </div>

      {/* 874px 화면에선 피그마 위치(top 659)와 동일, 작은 화면에선 콘텐츠 아래 최소 24px 간격 유지 */}
      <div className="relative mt-auto flex w-full flex-col gap-[5px] px-[18px] pb-[106px] pt-6">
        <button
          type="button"
          onClick={() => navigate(`/funding/${id}`)}
          className="flex h-[52px] w-full items-center justify-center rounded-xl bg-gray-900 text-h3-sb text-white"
        >
          선물 페이지 보기
        </button>
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="flex h-[52px] w-full items-center justify-center rounded-xl text-h3-sb text-[#978F96]"
        >
          홈으로 가기
        </button>
      </div>
    </div>
  )
}
