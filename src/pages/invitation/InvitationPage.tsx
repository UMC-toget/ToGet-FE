import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import heroBgGlow from '../../assets/hero-bg-glow.svg'
import InvitationHero from './InvitationHero'

// TODO: BE 연동 후 실제 펀딩 데이터로 교체 (개설자 이름/제목/인사말)
const MOCK_INVITATION = {
  title: '생일 초대장이 도착했어요',
  message: '안녕!!\n내가 이번 생일에 진짜 필요한 선물을 사고 싶은데\n혹시 함께해줄 수 있을까...',
  senderName: '희주',
}

/**
 * E01) 내 선물 참여: 초대장 팝업
 * 카톡 링크로 진입 시 처음 보이는 초대장 페이지.
 * 레이아웃 수치는 피그마 E01 프레임(402×874) 실측값 기준.
 */
export default function InvitationPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-white">
      {/* 핑크 글로우 배경 (피그마: x58 y292 286×286, blur 100px — 카드 영역 뒤까지 이어짐)
          402px 고정 크기로 중앙 배치해 좁은 화면에서도 수직 위치가 어긋나지 않게 함 */}
      <img
        src={heroBgGlow}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[92px] w-[402px] max-w-none -translate-x-1/2"
      />

      <InvitationHero />

      <div className="relative flex flex-1 flex-col items-center gap-5 px-[18px]">
        {/* 초대장 카드 (피그마: w366, padding 20, radius 20, shadow 0 4px 20px 15%) */}
        <article className="flex w-full flex-col gap-2.5 rounded-[20px] bg-white p-5 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.15)]">
          <h2 className="text-h3-sb text-black">{MOCK_INVITATION.title}</h2>
          <p className="whitespace-pre-line text-b2-r leading-relaxed text-gray-700">
            {MOCK_INVITATION.message}
          </p>
          <p className="text-right text-b2-m text-pink-500">from. {MOCK_INVITATION.senderName}</p>
        </article>

        <div className="flex w-full flex-col items-center gap-3">
          {/* TODO: E02(#27) 머지 전까지는 /funding/:id 라우트가 없어 빈 화면으로 이동함 — E02 작업에서 연결 */}
          <Button onClick={() => navigate(`/funding/${id}`)}>축하하러 가기</Button>
          <p className="text-caption1-r text-gray-500">
            축하 메시지를 남기거나, 선물에 마음을 보탤 수 있어요
          </p>
        </div>

        {/* /gift/about = PR #25(준영님)에서 정한 C02 서비스 소개 경로. PR #25 머지 전까지는 빈 화면으로 이동함 */}
        <button
          type="button"
          onClick={() => navigate('/gift/about')}
          className="mt-auto pb-[43px] pt-6 text-caption1-r text-gray-700"
        >
          투겟이 처음이신가요?
          <span className="ml-2 text-caption1-m">이용 방법 보러가기 {'>'}</span>
        </button>
      </div>
    </div>
  )
}
