import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import ProcessBar from '../../components/common/ProcessBar'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'
import EmojiPopup from '../../components/common/EmojiPopup'
import ConfirmStep1 from './ConfirmStep1'
import ConfirmStep2 from './ConfirmStep2'
import ConfirmStep3 from './ConfirmStep3'
import ConfirmStep4 from './ConfirmStep4'
import { getTogetherGiftDashboard, getGiftCandidates, postFinalSelections, type GiftCandidateItem, type MemberSummary } from '../../api/groupFundings'
import { getFundingAccount, type FundingAccount } from '../../api/fundings'
import { MOCK_CANDIDATES, MOCK_DASHBOARD, MOCK_ACCOUNT } from './groupMock'

// 접근: 개설자 전용 | 선물 확정 플로우 4단계 (선물 확정 → 정산인원 → 금액 → 정산 시작)
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
    selectedGiftIds?: number[]
    includedMemberIds?: number[]
    confirmedGifts?: ConfirmedGift[]
  } | null

  // DEV 프리뷰: URL에 ?preview 가 있으면 실 API를 기다리지 않고 mock을 초기값으로 쓴다.
  // BE 지연/장애 시 UI만 확인하는 용도. 파라미터가 없으면 평소대로 실 API 호출.
  const isPreview = import.meta.env.DEV && new URLSearchParams(location.search).has('preview')
  const previewMembers = (): MemberWithStatus[] => {
    const savedIds = returnState?.includedMemberIds
    return MOCK_DASHBOARD.members.map(m => ({
      ...m,
      included: savedIds ? savedIds.includes(m.fundingMemberId) : true,
    }))
  }

  const [step, setStep] = useState<1 | 2 | 3 | 4>((returnState?.step as 1 | 2 | 3 | 4) ?? 1)
  const [selectedGiftIds, setSelectedGiftIds] = useState<number[]>(returnState?.selectedGiftIds ?? [])
  const [candidates, setCandidates] = useState<GiftCandidateItem[]>(isPreview ? MOCK_CANDIDATES.candidates : [])
  const [members, setMembers] = useState<MemberWithStatus[]>(isPreview ? previewMembers() : [])
  const [confirmedGifts, setConfirmedGifts] = useState<ConfirmedGift[]>(returnState?.confirmedGifts ?? [])
  const [account, setAccount] = useState<FundingAccount | null>(isPreview ? MOCK_ACCOUNT : null)
  const [loading, setLoading] = useState(!isPreview)
  const [showExitModal, setShowExitModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id || isPreview) return
    Promise.allSettled([
      getGiftCandidates(id),
      getTogetherGiftDashboard(id),
      getFundingAccount(id),
    ]).then(([candidatesRes, dashboardRes, accountRes]) => {
      const apiCandidates =
        candidatesRes.status === 'fulfilled' ? candidatesRes.value.candidates : []
      const rawCandidates = apiCandidates

      const apiMembers =
        dashboardRes.status === 'fulfilled' ? dashboardRes.value.members : []
      const rawMembers = apiMembers

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
      }
    }).finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const includedMembers = members.filter(m => m.included)

  const canGoNext =
    step === 1 ? selectedGiftIds.length > 0 :
    step === 2 ? includedMembers.length > 0 :
    step === 3 ? confirmedGifts.length > 0 :
    true

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3 | 4)
    else setShowExitModal(true)
  }

  const handleNext = async () => {
    if (step === 1 && selectedGiftIds.length > 0) {
      // 선택된 선물들을 확정 목록 초기값으로 설정 (선택 순서가 아니라 목록 순서 유지)
      setConfirmedGifts(
        candidates
          .filter(c => selectedGiftIds.includes(c.fundingGiftId))
          .map(c => ({
            id: c.fundingGiftId,
            name: c.giftName,
            price: c.giftPrice,
            imageUrl: c.giftImageUrl,
          })),
      )
      setStep(2)
      return
    }
    if (step < 4) {
      setStep((step + 1) as 2 | 3 | 4)
      return
    }
    // 4단계: 선물·정산 참여자 확정 → SETTLING 전환 후 홈으로
    if (submitting) return
    // 프리뷰 모드는 실제 제출 없이 성공 화면만 보여준다 (BE 미호출)
    if (isPreview) {
      setShowSuccess(true)
      return
    }
    setSubmitting(true)
    try {
      if (id) {
        await postFinalSelections(id, {
          giftIds: confirmedGifts.map(g => g.id),
          settlementMemberIds: includedMembers.map(m => m.fundingMemberId),
        })
      }
      setShowSuccess(true)
    } catch (e) {
      console.error('선물 확정 실패', e)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoToEdit = () => {
    // location.search를 유지해 DEV 프리뷰(?preview)가 편집 왕복에서 끊기지 않게 한다
    navigate(`/group/${id}/confirm/edit${location.search}`, {
      replace: true,
      state: {
        confirmedGifts,
        step,
        selectedGiftIds,
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
            selectedGiftIds={selectedGiftIds}
            onToggle={giftId =>
              setSelectedGiftIds(prev =>
                prev.includes(giftId) ? prev.filter(x => x !== giftId) : [...prev, giftId],
              )
            }
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
            onSetAll={included =>
              setMembers(prev => prev.map(m => ({ ...m, included })))
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

      <div className="sticky bottom-0 px-[18px] pb-8 pt-4">
        <Button disabled={!canGoNext || submitting} onClick={handleNext}>
          {step === 4 ? '저장하고 안내하기' : '다음'}
        </Button>
      </div>

      <ConfirmModal
        open={showExitModal}
        title="선물 확정을 그만 두시겠어요?"
        description="지금 나가면 확정 내용이 저장되지 않아요"
        confirmText="나가기"
        cancelText="계속하기"
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => navigate(-1)}
      />

      <EmojiPopup
        open={showSuccess}
        icon="success"
        title="선물 후보 확정이 완료되었습니다"
        buttons={[{ label: '선물 페이지로 돌아가기', variant: 'primary', onClick: () => navigate(`/group/${id}`, { replace: true }) }]}
      />
    </div>
  )
}

function ExitButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[#797378]"
      style={{ fontFamily: 'Noto Sans KR', fontSize: '14px', fontWeight: 500, lineHeight: '100%' }}
    >
      나가기
    </button>
  )
}
