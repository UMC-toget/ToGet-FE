import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import EnvelopeButton from '../funding/EnvelopeButton'
import LetterModal from '../funding/LetterModal'
import { getContributions } from '../../api/contributions'
import type { ContributionItem } from '../../api/contributions'
import { getTogetherGiftDashboard } from '../../api/groupFundings'
import { MOCK_CONTRIBUTIONS, MOCK_DASHBOARD } from './groupMock'

// 접근: 전체 | 함께 선물 축하 메세지 더보기 — 봉투 그리드, 탭하면 편지 팝업
export default function GroupMessagesPage() {
  const { id } = useParams()
  const [contributions, setContributions] = useState<ContributionItem[]>([])
  const [recipientName, setRecipientName] = useState('')
  const [selectedLetter, setSelectedLetter] = useState<ContributionItem | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.allSettled([
      getContributions(id),
      getTogetherGiftDashboard(id),
    ]).then(([contribsRes, dashboardRes]) => {
      if (contribsRes.status === 'fulfilled') {
        setContributions(contribsRes.value.contributions.filter(c => !!c.content))
      } else if (import.meta.env.DEV) {
        setContributions(MOCK_CONTRIBUTIONS)
      }
      if (dashboardRes.status === 'fulfilled') {
        setRecipientName(dashboardRes.value.recipientName)
      } else if (import.meta.env.DEV) {
        setRecipientName(MOCK_DASHBOARD.recipientName)
      }
    }).catch(console.error)
  }, [id])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="축하메세지 더보기" />

      <div className="flex flex-col gap-4 px-[18px] pt-6">
        <div className="flex flex-col gap-[9px]">
          <h1 className="text-h3-sb leading-normal text-black">축하 메세지</h1>
          <p className="text-caption1-r leading-normal text-gray-600">봉투를 탭하면 메세지를 확인할 수 있어요</p>
        </div>
        <div className="grid grid-cols-4 justify-items-center gap-y-6">
          {contributions.map(c => (
            <EnvelopeButton
              key={c.contributionId}
              label={c.isAnonymous ? '익명' : (c.senderName ?? '참여자')}
              canOpen={!!c.content}
              onOpen={() => setSelectedLetter(c)}
            />
          ))}
        </div>
      </div>

      <LetterModal
        open={selectedLetter !== null}
        hostName={`${recipientName}님`}
        content={selectedLetter?.content ?? ''}
        senderLabel={selectedLetter?.isAnonymous ? '익명' : (selectedLetter?.senderName ?? null)}
        onClose={() => setSelectedLetter(null)}
      />
    </div>
  )
}
