import { useState } from 'react'
import type { FundingMessage } from '../../types/funding'
import Header from '../../components/common/Header'
import { useMockFunding } from './useMockFunding'
import { canOpenMessage, canViewMessages, getMessageDisplayName } from './messageUtils'
import EnvelopeButton from './EnvelopeButton'
import LetterModal from './LetterModal'

/**
 * E02) 축하메세지 더보기 (/funding/:id/messages)
 * 봉투 전체 그리드. 봉투를 탭하면 편지 팝업이 열림.
 */
export default function MessagesPage() {
  const [openedMessage, setOpenedMessage] = useState<FundingMessage | null>(null)
  const funding = useMockFunding()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="축하메세지 더보기" />

      <div className="flex flex-col gap-4 px-[18px] pt-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-h3-sb leading-normal text-black">축하 메세지</h1>
          {canViewMessages(funding) && (
            <p className="text-caption1-r leading-normal text-gray-600">봉투를 탭하면 메세지를 확인할 수 있어요</p>
          )}
        </div>
        <div className="grid grid-cols-4 justify-items-center gap-y-6">
          {funding.messages.map((message) => (
            <EnvelopeButton
              key={message.id}
              label={getMessageDisplayName(message, funding)}
              canOpen={canOpenMessage(message, funding)}
              onOpen={() => setOpenedMessage(message)}
            />
          ))}
        </div>
      </div>

      {/* content가 null이면(BE 계약 불일치 방어) 빈 편지 대신 모달을 열지 않음 */}
      <LetterModal
        open={openedMessage?.content != null}
        hostName={funding.hostName}
        content={openedMessage?.content ?? ''}
        senderLabel={openedMessage ? getMessageDisplayName(openedMessage, funding) : null}
        onClose={() => setOpenedMessage(null)}
      />
    </div>
  )
}
