import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import AccountFormFields from '../../components/common/AccountFormFields'
import AccountConfirmModal from '../../components/common/AccountConfirmModal'
import { useUserAccounts, USER_ACCOUNTS_QUERY_KEY } from '../../hooks/useUserAccounts'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { createUserAccount, updateUserAccount } from '../../api/userAccounts'
import type { BankName } from '../../api/userAccounts'
import { ApiError } from '../../lib/apiClient'

/** 계좌 등록/수정 폼 (I. 마이 > 계좌). id가 있으면 수정, 없으면 새 계좌 등록입니다. */
export default function AccountFormPage() {
  useRequireAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: accounts } = useUserAccounts()
  const editingAccount = id ? accounts?.find((a) => a.userAccountId === Number(id)) : undefined
  const queryClient = useQueryClient()

  const [bankName, setBankName] = useState<BankName | ''>(editingAccount?.bankName ?? '')
  const [accountNumber, setAccountNumber] = useState(editingAccount?.account ?? '')
  const [accountHolder, setAccountHolder] = useState(editingAccount?.accountOwner ?? '')
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)

  const isValid = bankName !== '' && accountNumber.length > 0 && accountHolder.length > 0

  // TODO: 계좌번호/예금주 조합이 실제로 유효한지 검증하는 계좌 실명조회 API가 생기면
  // 등록 완료 누르기 전에 검증 단계를 추가해야 합니다 (지금은 입력값을 그대로 신뢰).
  const saveMutation = useMutation({
    mutationFn: () => {
      if (bankName === '') throw new Error('은행을 선택해 주세요')
      const payload = { bankName, accountOwner: accountHolder, account: accountNumber }
      return editingAccount
        ? updateUserAccount(editingAccount.userAccountId, payload)
        : createUserAccount(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_ACCOUNTS_QUERY_KEY })
      navigate('/my/accounts', { replace: true })
    },
  })

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title={editingAccount ? '계좌 수정하기' : '새로운 계좌 등록하기'} />

      <AccountFormFields
        accountHolder={accountHolder}
        onAccountHolderChange={setAccountHolder}
        accountNumber={accountNumber}
        onAccountNumberChange={setAccountNumber}
        bankCode={bankName}
        onBankCodeChange={setBankName}
      />

      {saveMutation.isError && (
        <p className="px-[18px] pt-2 text-caption1-r text-pink-500">
          {saveMutation.error instanceof ApiError
            ? saveMutation.error.message
            : `${editingAccount ? '계좌 수정' : '계좌 등록'}에 실패했어요. 다시 시도해 주세요.`}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-3 px-[18px] pb-8 pt-4">
        <Button disabled={!isValid || saveMutation.isPending} onClick={() => setConfirmModalOpen(true)}>
          {editingAccount ? '수정 완료' : '등록 완료'}
        </Button>
      </div>

      <AccountConfirmModal
        open={confirmModalOpen}
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={() => {
          setConfirmModalOpen(false)
          saveMutation.mutate()
        }}
      />
    </div>
  )
}
