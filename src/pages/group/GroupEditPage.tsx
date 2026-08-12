import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import StickyBottomBar from '../../components/common/StickyBottomBar'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import { getTogetherGiftDashboard } from '../../api/groupFundings'
import type { GroupFundingStatus } from '../../api/groupFundings'
import { getFundingAccount, getInvitationCard } from '../../api/fundings'
import { BANK_NAME_LABELS } from '../../api/userAccounts'
import { fetchInvitationBackgrounds } from '../../api/metaApi'
import { isTogetherStepDirty, useTogetherCreateStore } from '../../store/togetherCreateStore'
import { MOCK_DASHBOARD } from './groupMock'
import { STATUS_LABELS, STATUS_ORDER } from './groupConstants'

// 접근: 개설자 전용 | 선물 페이지 수정하기 — 기본정보·계좌·초대장 수정 3단계 진입점
const EDIT_STEPS = [
  { step: 1, label: '1단계 : 기본 정보', desc: '선물 페이지 제목, 날짜, 소개글, 페이지 이미지', path: 'basic' },
  { step: 2, label: '2단계 : 계좌 정보', desc: '계좌 정보 수정', path: 'account' },
  { step: 3, label: '3단계 : 초대장', desc: '초대장 제목, 내용, 색상, 캐릭터', path: 'invitation' },
]

export default function GroupEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editState = useTogetherCreateStore()
  const { editFundingId, loadForEdit, commitAsFunding } = editState
  const [status, setStatus] = useState<GroupFundingStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      getTogetherGiftDashboard(id),
      getFundingAccount(id),
      getInvitationCard(id),
      fetchInvitationBackgrounds(),
    ])
      .then(([data, account, invitation, backgrounds]) => {
        setStatus(data.status)
        // 세부 단계에서 돌아온 경우 최초 스냅샷을 유지해야 변경 단계가 계속 표시됩니다.
        if (editFundingId === id) return
        const accountId = account.userAccountId != null ? String(account.userAccountId) : null
        const background = backgrounds.find(item => item.id === invitation.backgroundId)
        loadForEdit(id, {
          roomName: data.fundingTitle ?? '',
          recipientName: data.recipientName ?? '',
          giftDate: data.anniversaryDate ?? '',
          memo: data.introduction ?? '',
          thumbnailImage: data.thumbnailImageUrl ?? null,
          accounts: accountId ? [{
            id: accountId,
            bankName: BANK_NAME_LABELS[account.bankName],
            accountNumber: account.account,
            accountHolder: account.accountOwner,
          }] : [],
          selectedAccountId: accountId,
          inviteTitle: invitation.title,
          inviteContent: invitation.content,
          inviteBackgroundId: invitation.backgroundId,
          inviteColor: background?.hexCode ?? '#FCE4F0',
          inviteCharacter: invitation.characterId,
        })
      })
      .catch(() => { if (import.meta.env.DEV) setStatus(MOCK_DASHBOARD.status) })
      .finally(() => setLoading(false))
  }, [id, editFundingId, loadForEdit])

  const dirtySteps = new Set(EDIT_STEPS.filter(item => isTogetherStepDirty(editState, item.step)).map(item => item.step))
  const hasChanges = dirtySteps.size > 0

  const handleComplete = () => {
    if (id && hasChanges) commitAsFunding(id)
    navigate(-1)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="선물 페이지 수정하기" />

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-b2-r text-gray-400">불러오는 중...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-7 px-[18px] pb-[120px] pt-6">
          {/* 상태 선택 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-h3-sb text-black">수정하고 싶은 상태를 선택해 주세요</h2>
              <p className="text-caption1-r text-gray-600">함께 선물하기 상태를 수정할 수 있어요</p>
            </div>
            <div className="-mx-[18px] flex items-center gap-2 overflow-x-auto px-[18px] pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {STATUS_ORDER.map(s => (
                <span
                  key={s}
                  className={`shrink-0 rounded-full border px-4 py-2 text-b2-m ${
                    status === s
                      ? 'border-[#5B565A] bg-[#5B565A] text-white'
                      : 'border-[#C1BCC0] bg-white text-[#C1BCC0]'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </span>
              ))}
            </div>
          </div>

          {/* 단계 선택 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <h2 className="text-h3-sb text-black">수정하고 싶은 단계를 선택해 주세요</h2>
              <p className="text-caption1-r text-gray-600">해당 단계의 내용을 수정할 수 있어요</p>
            </div>
            <div className="flex flex-col gap-3">
              {EDIT_STEPS.map(step => (
                <button
                  key={step.label}
                  type="button"
                  onClick={() => navigate(`/group/${id}/edit/${step.path}`)}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-[14px] py-3"
                >
                  <div className="flex flex-col gap-2 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-b1-m text-black">{step.label}</span>
                      {dirtySteps.has(step.step) && (
                        <span className="rounded bg-pink-100/70 px-1.5 py-0.5 text-caption2-m text-pink-500">
                          변경됨
                        </span>
                      )}
                    </div>
                    <span className="text-b2-r text-gray-700">{step.desc}</span>
                  </div>
                  <ChevronRightIcon className="size-6 shrink-0 text-black" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 수정 완료 CTA */}
      <StickyBottomBar>
        <Button className="pointer-events-auto" onClick={handleComplete}>
          수정 완료
        </Button>
      </StickyBottomBar>
    </div>
  )
}
