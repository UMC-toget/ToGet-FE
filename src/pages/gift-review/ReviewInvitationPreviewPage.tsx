import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import InvitationHero from '../../components/invitation/InvitationHero'
import { useInvitationCard } from '../../components/invitation/useInvitationCard'
import { REVIEW_API_TYPE, REVIEW_WRITE_TYPES } from './reviewTypes'
import type { ReviewWriteType } from './reviewTypes'

/**
 * J03-2) 전달완료 소식·마음전하기 초대장 미리보기 (/gift/review/complete/:type/:fundingId/invitation-preview)
 * ReviewCompletePage의 '전달 소식/초대장 미리보기'에서 진입(news/message). 방금 저장된 초대장(캐릭터·배경색·개설자)을
 * 실제 조회 API로 보여주고, 하단 버튼으로 대시보드 조회 화면(GiftReviewDetailPage)까지 연결한다.
 */
export default function ReviewInvitationPreviewPage() {
  useRequireAuth()

  const { type, fundingId } = useParams<{ type: string; fundingId: string }>()
  const navigate = useNavigate()
  const invitation = useInvitationCard(fundingId)

  const config = type && type in REVIEW_WRITE_TYPES ? REVIEW_WRITE_TYPES[type as ReviewWriteType] : null
  if (!config || !fundingId) return <Navigate to="/home" replace />

  const letterTitle = config.invitationLetterTitle
  const letterText = config.invitationLetterText ?? ''

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-white">
      <Header title="초대장 미리보기" />

      <div className="flex flex-1 flex-col">
        <InvitationHero
          characterImageUrl={invitation.characterImageUrl}
          characterId={invitation.characterId}
          logoColor={invitation.themeColor}
          whiteLogo={invitation.whiteLogo}
          title={config.heroHeading}
        />

        <div className="flex flex-1 flex-col px-[18px]">
          <article className="flex min-h-[185px] w-full flex-col gap-2 rounded-[20px] bg-white p-5 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.15)]">
            <div className="flex w-full flex-col gap-6">
              {letterTitle && (
                <p className="text-center text-b1-m font-medium text-black">{letterTitle}</p>
              )}
              <p className={`whitespace-pre-line text-b2-m leading-[20px] text-gray-700 ${letterTitle ? 'text-center' : ''}`}>
                {letterText}
              </p>
            </div>
            {config.showFrom && invitation.creatorName && (
              <p className="self-end text-b1-m font-semibold text-pink-500">from. {invitation.creatorName}</p>
            )}
          </article>
        </div>
      </div>

      <div className="px-[18px] pb-[34px] pt-10">
        <Button
          onClick={() => navigate(`/gift/review/${fundingId}/${fundingId}?type=${REVIEW_API_TYPE[config.key]}`)}
        >
          {config.invitationPreviewButtonLabel}
        </Button>
      </div>
    </div>
  )
}
