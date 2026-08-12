import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Toast from '../../components/common/Toast'
import TogetherStep3Invite, { type TogetherInviteInitialValue } from '../../components/create/TogetherStep3Invite'
import { useTogetherCreateStore } from '../../store/togetherCreateStore'
import { getInvitationCard, updateFundingInvitation } from '../../api/fundings'

// 접근: 개설자 전용 | 선물 페이지 수정 3단계 — 초대장 (G섹션 스텝 재사용, 진행바 없음)
export default function GroupEditInvitationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { inviteTitle, inviteContent, inviteBackgroundId, inviteCharacter } = useTogetherCreateStore()

  const [initialValue, setInitialValue] = useState<TogetherInviteInitialValue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // 현재 초대장 값을 불러와 폼에 채웁니다. (색상은 backgroundId로 스텝 내부에서 자동 동기화)
  useEffect(() => {
    if (!id) return
    let cancelled = false
    getInvitationCard(id)
      .then((card) => {
        if (cancelled) return
        setInitialValue({
          title: card.title,
          content: card.content,
          characterId: card.characterId,
          backgroundId: card.backgroundId,
        })
      })
      .catch(() => {
        // 조회 실패 시엔 빈 폼으로 진행합니다.
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const handleSave = async () => {
    if (!id || isSaving) return
    if (!inviteBackgroundId) {
      setSaveError('초대장 배경색을 선택해 주세요.')
      return
    }
    setIsSaving(true)
    setSaveError('')
    try {
      await updateFundingInvitation(id, {
        characterId: inviteCharacter,
        backgroundId: inviteBackgroundId,
        title: inviteTitle,
        content: inviteContent,
      })
      navigate(-1)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '초대장을 저장하지 못했어요.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header
        title="3단계 : 초대장"
        right={
          <button type="button" onClick={() => navigate(-1)} className="text-b2-m text-black">
            나가기
          </button>
        }
      />
      <div className="flex flex-1 flex-col overflow-hidden px-[18px] pb-6 pt-5">
        {isLoading ? (
          <p className="py-16 text-center text-b2-r text-gray-400">불러오는 중...</p>
        ) : (
          <TogetherStep3Invite
            onNext={handleSave}
            submitLabel={isSaving ? '저장 중...' : '저장'}
            disabled={isSaving}
            initialValue={initialValue ?? undefined}
          />
        )}
      </div>

      <Toast open={Boolean(saveError)} message={saveError} standalone />
    </div>
  )
}
