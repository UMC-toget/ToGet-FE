import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import ConfirmModal from '../../components/common/ConfirmModal'
import Toast from '../../components/common/Toast'
import TogetherStep2Account from '../../components/create/TogetherStep2Account'
import { useTogetherCreateStore } from '../../store/togetherCreateStore'
import { getFundingAccount, updateFundingAccount } from '../../api/fundings'
import { BANK_NAME_LABELS, createUserAccount, getUserAccounts, updateUserAccount, type BankName } from '../../api/userAccounts'

// 접근: 개설자 전용 | 선물 페이지 수정 2단계 — 계좌 정보 (G섹션 스텝 재사용)

const BANK_NAME_ALIASES: Partial<Record<string, BankName>> = {
  국민은행: 'KB',
  우체국예금: 'POST_OFFICE',
  대구은행: 'IM_BANK',
}

function resolveBankCode(displayName: string): BankName | undefined {
  return BANK_NAME_ALIASES[displayName] ??
    (Object.entries(BANK_NAME_LABELS) as Array<[BankName, string]>).find(([, label]) => label === displayName)?.[0]
}

export default function GroupEditAccountPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { accounts, selectedAccountId } = useTogetherCreateStore()

  const [initialSelectedAccountId, setInitialSelectedAccountId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  // 현재 펀딩 계좌의 userAccountId를 초기 선택값으로 씁니다.
  useEffect(() => {
    if (!id) return
    let cancelled = false
    getFundingAccount(id)
      .then((fundingAccount) => {
        if (cancelled || fundingAccount.userAccountId == null) return
        setInitialSelectedAccountId(fundingAccount.userAccountId)
      })
      .catch(() => {
        // 계좌 미등록 등으로 조회 실패 시엔 새 계좌 등록 흐름으로 진행합니다.
      })
    return () => { cancelled = true }
  }, [id])

  const handleSave = async () => {
    if (!id || isSaving) return
    const selectedAccount = accounts.find((account) => account.id === selectedAccountId)
    if (!selectedAccount) {
      setSaveError('사용할 계좌를 선택해 주세요.')
      return
    }
    const bankName = resolveBankCode(selectedAccount.bankName)
    if (!bankName) {
      setSaveError('선택한 은행 정보를 확인해 주세요.')
      return
    }

    setIsSaving(true)
    setSaveError('')
    try {
      const normalizedAccount = selectedAccount.accountNumber.replace(/\D/g, '')
      let userAccountId: number

      if (/^\d+$/.test(selectedAccount.id)) {
        // 기존 등록 계좌 — 내용이 바뀌었으면 계좌 자체도 서버에 반영합니다.
        userAccountId = Number(selectedAccount.id)
        const registeredAccounts = await getUserAccounts()
        const original = registeredAccounts.find((account) => account.userAccountId === userAccountId)
        const changed = !original ||
          original.bankName !== bankName ||
          original.account !== normalizedAccount ||
          original.accountOwner !== selectedAccount.accountHolder
        if (changed) {
          await updateUserAccount(userAccountId, {
            bankName,
            accountOwner: selectedAccount.accountHolder,
            account: normalizedAccount,
          })
        }
      } else {
        // 새로 입력한 계좌 — 먼저 등록하고 그 id를 사용합니다.
        userAccountId = (await createUserAccount({
          bankName,
          accountOwner: selectedAccount.accountHolder,
          account: normalizedAccount,
        })).userAccountId
      }

      await updateFundingAccount(id, userAccountId)
      navigate(-1)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '계좌 정보를 저장하지 못했어요.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header
        title="2단계 : 계좌 정보"
        right={
          <button type="button" onClick={() => setShowLeaveConfirm(true)} className="text-b2-m text-gray-600">
            나가기
          </button>
        }
      />

      <div className="flex flex-1 flex-col overflow-hidden px-[18px] pb-6 pt-5">
        <TogetherStep2Account onNext={handleSave} initialSelectedAccountId={initialSelectedAccountId} />
      </div>

      <Toast open={Boolean(saveError)} message={saveError} standalone />

      <ConfirmModal
        open={showLeaveConfirm}
        title="페이지를 나가시겠어요?"
        description={'페이지를 나가면,\n수정한 내용이 저장되지 않아요'}
        cancelText="나가기"
        confirmText="이어서 작성하기"
        onCancel={() => navigate(-1)}
        onConfirm={() => setShowLeaveConfirm(false)}
      />
    </div>
  )
}
