import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import InvitationHero from '../../components/invitation/InvitationHero'
import { useInvitationCard } from '../../components/invitation/useInvitationCard'

/**
 * E01) 내 선물 참여: 초대장 팝업
 * 카톡 링크로 진입 시 처음 보이는 초대장 페이지.
 * 레이아웃 수치는 피그마 E01 프레임(402×874) 실측값 기준.
 */
export default function InvitationPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const invitation = useInvitationCard(id)

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-white">
      {/* 글로우·로고·별·캐릭터는 InvitationHero가 한 덩어리로 그린다(J 등 타 섹션과 공용) */}
      <InvitationHero
        characterImageUrl={invitation.characterImageUrl}
        characterId={invitation.characterId}
        logoColor={invitation.themeColor}
        whiteLogo={invitation.whiteLogo}
      />

      <div className="relative flex flex-1 flex-col items-center gap-5 px-[18px]">
        {/* 초대장 카드 (피그마: w366, padding 20, radius 20, shadow 0 4px 20px 15%) */}
        <article className="flex w-full flex-col items-start gap-2.5 rounded-[20px] bg-white p-5 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.15)]">
          <h2 className="text-h3-sb text-black">{invitation.title}</h2>
          {invitation.content && (
            <p className="whitespace-pre-line text-b2-r leading-relaxed text-gray-700">
              {invitation.content}
            </p>
          )}
          {invitation.creatorName && (
            <p className="self-end text-b2-m text-pink-500">from. {invitation.creatorName}</p>
          )}
        </article>

        <div className="flex w-full flex-col items-center gap-3">
          <Button onClick={() => navigate(`/funding/${id}`)}>축하하러 가기</Button>
          <p className="text-caption1-r text-gray-500">
            축하 메세지를 남기거나, 선물에 마음을 보탤 수 있어요
          </p>
        </div>

        {/* /gift/about = C02 서비스 소개 경로 */}
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
