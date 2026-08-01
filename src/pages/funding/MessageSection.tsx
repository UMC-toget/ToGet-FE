import { useNavigate, useParams } from 'react-router-dom'
import type { FundingDetail, FundingMessage } from '../../types/funding'
import { canOpenMessage, canViewMessages, getMessageDisplayName } from './messageUtils'
import EnvelopeButton from './EnvelopeButton'

interface MessageSectionProps {
  funding: FundingDetail
  onOpenMessage: (message: FundingMessage) => void
}

/** E02 축하 메세지 섹션 (피그마 #1200:8788) — 이름/내용 공개 정책은 messageUtils 참조 */
export default function MessageSection({ funding, onOpenMessage }: MessageSectionProps) {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="text-h3-sb leading-normal text-black">축하 메세지</h2>
          <button
            type="button"
            onClick={() => navigate(`/funding/${id}/messages`)}
            className="text-b1-m text-gray-600"
          >
            더보기
          </button>
        </div>
        {canViewMessages(funding) && (
          <p className="text-caption1-r leading-normal text-gray-600">봉투를 탭하면 메세지를 확인할 수 있어요</p>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {funding.messages.map((message) => (
          <EnvelopeButton
            key={message.id}
            label={getMessageDisplayName(message, funding)}
            canOpen={canOpenMessage(message, funding)}
            onOpen={() => onOpenMessage(message)}
          />
        ))}
      </div>
    </section>
  )
}
