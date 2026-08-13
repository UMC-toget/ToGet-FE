import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import ConfirmModal from '../../components/common/ConfirmModal'
import StepIndicator from '../../components/create/StepIndicator'
import TogetherStep1BasicInfo from '../../components/create/TogetherStep1BasicInfo'
import TogetherStep2Account from '../../components/create/TogetherStep2Account'
import TogetherStep3Invite from '../../components/create/TogetherStep3Invite'
import TogetherStepComplete from '../../components/create/TogetherStepComplete'
import Toast from '../../components/common/Toast'
import { useTogetherCreateStore } from '../../store/togetherCreateStore'
import { createFunding } from '../../api/fundings'
import { BANK_NAME_LABELS, createUserAccount, getUserAccounts, type BankName } from '../../api/userAccounts'
import { getMyFundings } from '../../api/users'
import { useAuth } from '../../hooks/useAuth'
import { uploadImage } from '../../utils/uploadImage'
import { deleteTogetherDraft, getTogetherDraft, saveTogetherDraft } from '../../api/togetherDraft'

const STEPS = ['기본 정보', '계좌 정보', '초대장 만들기']
const TOTAL_STEPS = STEPS.length
const REQUEST_TIMEOUT_MS = 20_000
const TOGETHER_DRAFT_META_KEY = 'toget:together-draft-meta'

const BANK_NAME_ALIASES: Partial<Record<string, BankName>> = {
  국민은행: 'KB',
  우체국예금: 'POST_OFFICE',
  대구은행: 'IM_BANK',
}

function resolveBankCode(displayName: string): BankName | undefined {
  return BANK_NAME_ALIASES[displayName] ??
    (Object.entries(BANK_NAME_LABELS) as Array<[BankName, string]>).find(
      ([, label]) => label === displayName,
    )?.[0]
}

function extractFundingId(result: unknown): number | null {
  const rawId = typeof result === 'number' || typeof result === 'string'
    ? result
    : result && typeof result === 'object'
      ? ('fundingId' in result ? result.fundingId : 'id' in result ? result.id : null)
      : null
  const fundingId = Number(rawId)
  return Number.isInteger(fundingId) && fundingId > 0 ? fundingId : null
}

function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error(message)), REQUEST_TIMEOUT_MS)
    promise.then(
      (value) => {
        window.clearTimeout(timeoutId)
        resolve(value)
      },
      (error) => {
        window.clearTimeout(timeoutId)
        reject(error)
      },
    )
  })
}

function getCreateErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const response = error.response?.data
    if (response && typeof response === 'object') {
      const code = 'code' in response && typeof response.code === 'string' ? response.code : ''
      const message = 'message' in response && typeof response.message === 'string'
        ? response.message
        : ''
      if (message) return code ? `${message} (${code})` : message
    }
    if (error.response?.status) return `요청에 실패했어요. (HTTP ${error.response.status})`
  }
  return error instanceof Error ? error.message : '함께 선물 페이지 생성에 실패했어요.'
}

/** 함께 선물 페이지 만들기 플로우 (G02) */
export default function GiftCreateTogetherPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn } = useAuth()
  const [wasLoggedInOnEntry] = useState(isLoggedIn)
  const continueDraft = Boolean((location.state as { continueDraft?: boolean } | null)?.continueDraft)
  const togetherForm = useTogetherCreateStore()
  const resetTogetherForm = useTogetherCreateStore((s) => s.reset)
  const [step, setStep] = useState(1)
  const [showExitModal, setShowExitModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createdFundingId, setCreatedFundingId] = useState<number | null>(null)
  const [draftId, setDraftId] = useState<number | null>(null)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isRestoringDraft, setIsRestoringDraft] = useState(continueDraft)
  const isComplete = step > TOTAL_STEPS

  useEffect(() => {
    if (!createError) return
    const timer = window.setTimeout(() => setCreateError(''), 2500)
    return () => window.clearTimeout(timer)
  }, [createError])

  useEffect(() => {
    if (!continueDraft) {
      resetTogetherForm()
      return
    }
    let cancelled = false
    getTogetherDraft()
      .then((draft) => {
        if (cancelled) return
        if (!draft) {
          resetTogetherForm()
          return
        }
        setDraftId(draft.togetherDraftsGiftId)
        const account = draft.account
        const restoredAccount = account
          ? {
              id: String(account.userAccountId),
              bankName: account.bankDisplayName,
              accountNumber: account.bankAccount,
              accountHolder: account.accountOwner,
            }
          : null
        let meta: { inviteBackgroundId?: number; inviteColor?: string; inviteCharacter?: number } = {}
        try {
          meta = JSON.parse(localStorage.getItem(TOGETHER_DRAFT_META_KEY) ?? '{}')
        } catch {
          // 손상된 로컬 메타데이터는 서버 draft 복원을 방해하지 않습니다.
        }
        useTogetherCreateStore.setState({
          roomName: draft.title ?? '',
          recipientName: draft.receiver ?? '',
          giftDate: draft.anniversaryDate ?? '',
          memo: draft.description ?? '',
          thumbnailImage: draft.thumbnailImageUrl,
          accounts: restoredAccount ? [restoredAccount] : [],
          selectedAccountId: restoredAccount?.id ?? null,
          inviteTitle: draft.cardTitle ?? '',
          inviteContent: draft.cardContent ?? '',
          inviteBackgroundId: meta.inviteBackgroundId ?? null,
          inviteColor: meta.inviteColor ?? '#FCE4F0',
          inviteCharacter: meta.inviteCharacter ?? 1,
        })
        const restoredStep = Number(draft.step)
        setStep(Number.isInteger(restoredStep) && restoredStep >= 1 && restoredStep <= TOTAL_STEPS ? restoredStep : 1)
      })
      .catch((error) => setCreateError(getCreateErrorMessage(error)))
      .finally(() => { if (!cancelled) setIsRestoringDraft(false) })
    return () => { cancelled = true }
  }, [continueDraft, resetTogetherForm])

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1)
    else setShowExitModal(true)
  }

  const handleNext = () => setStep((s) => s + 1)

  const handleSaveDraft = async () => {
    if (isSavingDraft) return
    setIsSavingDraft(true)
    setCreateError('')
    try {
      let thumbnailImageUrl = typeof togetherForm.thumbnailImage === 'string'
        ? togetherForm.thumbnailImage
        : undefined
      if (togetherForm.thumbnailImage instanceof File) {
        try {
          thumbnailImageUrl = await uploadImage('drafts/thumbnails', togetherForm.thumbnailImage)
        } catch {
          // 이미지 업로드 실패가 나머지 작성 내용의 임시저장을 막지 않게 합니다.
        }
      }
      const selectedAccount = togetherForm.accounts.find((account) => account.id === togetherForm.selectedAccountId)
      let userAccountId: number | undefined
      if (selectedAccount) {
        try {
          const bankName = resolveBankCode(selectedAccount.bankName)
          if (bankName) {
            const normalizedAccount = selectedAccount.accountNumber.replace(/\D/g, '')
            const registeredAccounts = await getUserAccounts()
            const registeredAccount = registeredAccounts.find((account) =>
              account.bankName === bankName &&
              account.account === normalizedAccount &&
              account.accountOwner === selectedAccount.accountHolder,
            )
            userAccountId = registeredAccount?.userAccountId ?? (await createUserAccount({
              bankName,
              accountOwner: selectedAccount.accountHolder,
              account: normalizedAccount,
            })).userAccountId
          }
        } catch {
          // 계좌 연동 실패 시에도 계좌를 제외한 작성 내용은 임시저장합니다.
        }
      }
      const savedDraft = await saveTogetherDraft({
        step,
        title: togetherForm.roomName || undefined,
        receiver: togetherForm.recipientName || undefined,
        anniversaryDate: togetherForm.giftDate || undefined,
        description: togetherForm.memo || undefined,
        thumbnailImageUrl,
        userAccountId,
        invitationCard: {
          title: togetherForm.inviteTitle,
          content: togetherForm.inviteContent,
        },
      })
      setDraftId(savedDraft.togetherDraftsGiftId)
      try {
        localStorage.setItem(TOGETHER_DRAFT_META_KEY, JSON.stringify({
          inviteBackgroundId: togetherForm.inviteBackgroundId,
          inviteColor: togetherForm.inviteColor,
          inviteCharacter: togetherForm.inviteCharacter,
        }))
      } catch {
        // 서버 draft 저장은 완료됐으므로 로컬 디자인 메타 저장 실패로 이동을 막지 않습니다.
      }
      setShowExitModal(false)
      navigate('/home')
    } catch (error) {
      setCreateError(getCreateErrorMessage(error))
      setShowExitModal(false)
    } finally {
      setIsSavingDraft(false)
    }
  }

  const completeCreation = (fundingId: number) => {
    setCreatedFundingId(fundingId)
    setStep(TOTAL_STEPS + 1)
  }

  const handleCreateFunding = async () => {
    if (isCreating) return

    const selectedAccount = togetherForm.accounts.find(
      (account) => account.id === togetherForm.selectedAccountId,
    )
    if (!selectedAccount || !togetherForm.inviteBackgroundId) {
      setCreateError('계좌 또는 초대장 정보를 다시 확인해 주세요.')
      return
    }

    const bankName = resolveBankCode(selectedAccount.bankName)
    if (!bankName) {
      setCreateError('선택한 은행 정보를 확인해 주세요.')
      return
    }

    setIsCreating(true)
    setCreateError('')
    try {
      const thumbnailImageUrl = togetherForm.thumbnailImage instanceof File
        ? await withTimeout(
          uploadImage('fundings/thumbnails', togetherForm.thumbnailImage),
          '대표 이미지 업로드 응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요.',
        )
        : togetherForm.thumbnailImage

      const normalizedAccount = selectedAccount.accountNumber.replace(/\D/g, '')
      const registeredAccounts = await withTimeout(
        getUserAccounts(),
        '계좌 정보 조회 응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요.',
      )
      const registeredAccount = registeredAccounts.find((account) =>
        account.bankName === bankName &&
        account.account === normalizedAccount &&
        account.accountOwner === selectedAccount.accountHolder,
      )
      const userAccountId = registeredAccount?.userAccountId ?? (await withTimeout(
        createUserAccount({
          bankName,
          accountOwner: selectedAccount.accountHolder,
          account: normalizedAccount,
        }),
        '계좌 등록 응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요.',
      )).userAccountId

      const result = await withTimeout(createFunding({
        fundingType: 'TOGETHER_GIFT',
        title: togetherForm.roomName,
        recipientName: togetherForm.recipientName,
        anniversaryDate: togetherForm.giftDate,
        // 화면에 없는 필드(준비 기간/목표 금액)는 null로 보내고, 선물 확정 단계에서 다시 설정한다.
        startDate: null,
        endDate: null,
        introduction: togetherForm.memo,
        thumbnailImageUrl,
        targetAmount: null,
        userAccountId,
        invitation: {
          characterId: togetherForm.inviteCharacter,
          backgroundId: togetherForm.inviteBackgroundId,
          title: togetherForm.inviteTitle,
          content: togetherForm.inviteContent,
        },
        visibility: null,
        gifts: [],
      }), '준비방 생성 응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요.')

      let fundingId = extractFundingId(result)
      if (fundingId == null) {
        const myFundings = await withTimeout(
          getMyFundings({ page: 0, size: 100 }),
          '생성된 준비방 확인 응답이 지연되고 있어요. 홈에서 준비방을 확인해 주세요.',
        )
        const justCreated = [...myFundings.fundings]
          .filter((funding) =>
            funding.fundingType === 'TOGETHER_GIFT' &&
            funding.title === togetherForm.roomName &&
            funding.recipientName === togetherForm.recipientName,
          )
          .sort((a, b) => {
            const createdAtDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            return createdAtDiff || b.fundingId - a.fundingId
          })[0]
        fundingId = justCreated?.fundingId ?? null
      }
      if (fundingId == null) {
        throw new Error('준비방은 생성됐지만 생성된 페이지를 찾지 못했어요. 홈에서 확인해 주세요.')
      }

      if (draftId != null) await deleteTogetherDraft(draftId).catch(() => undefined)
      localStorage.removeItem(TOGETHER_DRAFT_META_KEY)
      completeCreation(fundingId)
    } catch (error) {
      setCreateError(getCreateErrorMessage(error))
    } finally {
      setIsCreating(false)
    }
  }

  if (!wasLoggedInOnEntry) return <Navigate to="/login" replace />

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      {!isComplete && (
        <>
          <Header
            title="함께 선물 페이지 만들기"
            onBack={handleBack}
            right={
              <button type="button" onClick={() => setShowExitModal(true)} className="text-b2-m text-black">
                나가기
              </button>
            }
          />

          <div className="px-[18px] pt-5 pb-2">
            <StepIndicator currentStep={step} steps={STEPS} />
          </div>
        </>
      )}

      <div className="flex-1 px-[18px] pb-6 flex flex-col overflow-hidden">
        {isRestoringDraft && <p className="py-16 text-center text-b2-r text-gray-400">작성 내용을 불러오는 중...</p>}
        {!isRestoringDraft && (
          <>
        {step === 1 && <TogetherStep1BasicInfo onNext={handleNext} />}
        {step === 2 && <TogetherStep2Account onNext={handleNext} />}
        {step === 3 && (
          <TogetherStep3Invite
            onNext={handleCreateFunding}
            submitLabel={isCreating ? '생성 중...' : '저장'}
            disabled={isCreating}
          />
        )}
        {isComplete && createdFundingId != null && (
          <TogetherStepComplete
            fundingId={createdFundingId}
            onGoHome={() => navigate('/home')}
            onViewFunding={() => navigate(`/group/${createdFundingId}`)}
          />
        )}
          </>
        )}
      </div>

      <Toast open={Boolean(createError)} message={createError} standalone />

      <ConfirmModal
        open={showExitModal}
        title="작성 중인 선물 페이지를 저장할까요?"
        description={'지금 나가면 현재까지 입력한 내용이 저장되고,\n다음에 다시 이어서 작성할 수 있어요'}
        cancelText="계속 작성하기"
        confirmText={isSavingDraft ? '저장 중...' : '저장하고 나가기'}
        onCancel={() => setShowExitModal(false)}
        onConfirm={handleSaveDraft}
      />
    </div>
  )
}
