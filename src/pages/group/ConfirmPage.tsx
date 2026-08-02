import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import ProcessBar from '../../components/common/ProcessBar'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'
import ConfirmStep1 from './ConfirmStep1'
import ConfirmStep2 from './ConfirmStep2'
import ConfirmStep3 from './ConfirmStep3'
import ConfirmStep4 from './ConfirmStep4'
import { getTogetherGiftDashboard, getGiftCandidates, type GiftCandidateItem, type MemberSummary } from '../../api/groupFundings'
import { getFundingAccount, type FundingAccount } from '../../api/fundings'
import { MOCK_CANDIDATES, MOCK_DASHBOARD, MOCK_ACCOUNT } from './groupMock'

export interface ConfirmedGift {
  id: number
  name: string
  price: number
  imageUrl: string | null
}

export interface MemberWithStatus extends MemberSummary {
  included: boolean
}

const STEPS = ['선물 확정하기', '정산인원 확정하기', '금액 확정하기', '정산 시작하기'] as const

export default function ConfirmPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // ConfirmEditPage에서 돌아올 때 state로 복원
  const returnState = location.state as {
    step?: number
    selectedGiftId?: number | null
    includedMemberIds?: number[]
    confirmedGifts?: ConfirmedGift[]
  } | null

  const [step, setStep] = useState<1 | 2 | 3 | 4>((returnState?.step as 1 | 2 | 3 | 4) ?? 1)
  const [selectedGiftId, setSelectedGiftId] = useState<number | null>(returnState?.selectedGiftId ?? null)
  const [candidates, setCandidates] = useState<GiftCandidateItem[]>([])
  const [members, setMembers] = useState<MemberWithStatus[]>([])
  const [confirmedGifts, setConfirmedGifts] = useState<ConfirmedGift[]>(returnState?.confirmedGifts ?? [])
  const [account, setAccount] = useState<FundingAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExitModal, setShowExitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.allSettled([
      getGiftCandidates(id),
      getTogetherGiftDashboard(id),
      getFundingAccount(id),
    ]).then(([candidatesRes, dashboardRes, accountRes]) => {
      const rawCandidates =
        candidatesRes.status === 'fulfilled'
          ? candidatesRes.value.candidates
          : import.meta.env.DEV ? MOCK_CANDIDATES.candidates : []

      const rawMembers =
        dashboardRes.status === 'fulfilled'
          ? dashboardRes.value.members
          : import.meta.env.DEV ? MOCK_DASHBOARD.members : []

      setCandidates(rawCandidates)

      // 돌아온 경우 includedMemberIds로 복원, 아니면 모두 포함
      const savedIds = returnState?.includedMemberIds
      setMembers(
        rawMembers.map(m => ({
          ...m,
          included: savedIds ? savedIds.includes(m.fundingMemberId) : true,
        })),
      )

      if (accountRes.status === 'fulfilled') {
        setAccount(accountRes.value)
      } else if (import.meta.env.DEV) {
        setAccount(MOCK_ACCOUNT)
      }
    }).finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const includedMembers = members.filter(m => m.included)

  const canGoNext =
    step === 1 ? selectedGiftId !== null :
    step === 2 ? includedMembers.length > 0 :
    step === 3 ? confirmedGifts.length > 0 :
    true

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3 | 4)
    else setShowExitModal(true)
  }

  const handleNext = async () => {
    if (step === 1 && selectedGiftId !== null) {
      // 선택된 선물을 확정 목록 초기값으로 설정
      const selected = candidates.find(c => c.fundingGiftId === selectedGiftId)
      if (selected) {
        setConfirmedGifts([{
          id: selected.fundingGiftId,
          name: selected.giftName,
          price: selected.giftPrice,
          imageUrl: selected.giftImageUrl,
        }])
      }
      setStep(2)
      return
    }
    if (step < 4) {
      setStep((step + 1) as 2 | 3 | 4)
      return
    }
    // 4단계: 정산 시작 API 호출 (BE 미구현 → 홈으로 이동)
    if (submitting) return
    setSubmitting(true)
    try {
      // TODO: await confirmGiftsAndStartSettlement(id!, { ... })
      navigate(`/group/${id}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoToEdit = () => {
    navigate(`/group/${id}/confirm/edit`, {
      state: {
        confirmedGifts,
        step,
        selectedGiftId,
        includedMemberIds: members.filter(m => m.included).map(m => m.fundingMemberId),
      },
    })
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
        <Header title="선물 확정하기" onBack={handleBack} right={<ExitButton onClick={() => setShowExitModal(true)} />} />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-b2-r text-gray-400">불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header
        title="선물 확정하기"
        onBack={handleBack}
        right={<ExitButton onClick={() => setShowExitModal(true)} />}
      />

      <div className="px-[18px] pb-4 pt-5">
        <ProcessBar steps={STEPS} currentStep={step} />
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {step === 1 && (
          <ConfirmStep1
            candidates={candidates}
            selectedGiftId={selectedGiftId}
            onSelect={setSelectedGiftId}
          />
        )}
        {step === 2 && (
          <ConfirmStep2
            members={members}
            onToggle={memberId =>
              setMembers(prev =>
                prev.map(m =>
                  m.fundingMemberId === memberId ? { ...m, included: !m.included } : m,
                ),
              )
            }
          />
        )}
        {step === 3 && (
          <ConfirmStep3
            confirmedGifts={confirmedGifts}
            includedCount={includedMembers.length}
            onEditGifts={handleGoToEdit}
          />
        )}
        {step === 4 && (
          <ConfirmStep4
            confirmedGifts={confirmedGifts}
            includedCount={includedMembers.length}
            account={account}
          />
        )}
      </div>

      <div className="px-[18px] pb-8 pt-4">
        <Button disabled={!canGoNext || submitting} onClick={handleNext}>
          {step === 4 ? '정산하고 안내하기' : '다음'}
        </Button>
      </div>

      <ConfirmModal
        open={showExitModal}
        title="선물 확정을 그만 두시겠어요?"
        description="지금 나가면 확정 내용이 저장되지 않아요"
        confirmText="나가기"
        cancelText="계속하기"
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => navigate(`/group/${id}`)}
      />
    </div>
  )
}

function ExitButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-b2-m text-black">
      나가기
    </button>
  )
}
