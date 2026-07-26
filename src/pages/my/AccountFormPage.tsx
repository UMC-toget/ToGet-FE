import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Header from '../../components/common/Header'
import TextField from '../../components/common/TextField'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'
import SearchIcon from '../../components/icons/SearchIcon'
import BankSelectSheet from './BankSelectSheet'
import { useUserAccounts, USER_ACCOUNTS_QUERY_KEY } from '../../hooks/useUserAccounts'
import { createUserAccount, updateUserAccount, BANK_NAME_LABELS } from '../../api/userAccounts'
import type { BankName } from '../../api/userAccounts'
import { ApiError } from '../../lib/apiClient'

/** 계좌 등록/수정 폼 (I. 마이 > 계좌). id가 있으면 수정, 없으면 새 계좌 등록입니다. */
export default function AccountFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: accounts } = useUserAccounts()
  const editingAccount = id ? accounts?.find((a) => a.userAccountId === Number(id)) : undefined
  const queryClient = useQueryClient()

  const [bankName, setBankName] = useState<BankName | ''>(editingAccount?.bankName ?? '')
  const [accountNumber, setAccountNumber] = useState(editingAccount?.account ?? '')
  const [accountHolder, setAccountHolder] = useState(editingAccount?.accountOwner ?? '')
  const [bankSheetOpen, setBankSheetOpen] = useState(false)
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
      navigate('/my/accounts')
    },
  })

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title={editingAccount ? '계좌 수정하기' : '새로운 계좌 등록하기'} />

      <div className="flex flex-col gap-4 px-[18px] pt-4">
        <div className="flex flex-col gap-4">
          <label className="text-b1-m text-black">
            은행명 <span className="text-pink-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setBankSheetOpen(true)}
            className="flex h-12 w-full items-center justify-between gap-2 rounded-lg bg-background px-4"
          >
            <span className={`text-b1-m ${bankName ? 'text-black' : 'text-gray-400'}`}>
              {bankName ? BANK_NAME_LABELS[bankName] : '은행명을 정확히 선택해주세요'}
            </span>
            <SearchIcon className="size-6 shrink-0 text-black" />
          </button>
        </div>

        <TextField
          label={
            <>
              계좌번호 <span className="text-pink-500">*</span>
            </>
          }
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
          placeholder="본인의 계좌번호를 정확히 입력해주세요"
          inputMode="numeric"
        />

        <TextField
          label={
            <>
              예금주 <span className="text-pink-500">*</span>
            </>
          }
          value={accountHolder}
          onChange={(e) => setAccountHolder(e.target.value)}
          placeholder="예금주 이름을 정확히 입력해 주세요"
        />

        {saveMutation.isError && (
          <p className="text-caption1-r text-pink-500">
            {saveMutation.error instanceof ApiError
              ? saveMutation.error.message
              : `${editingAccount ? '계좌 수정' : '계좌 등록'}에 실패했어요. 다시 시도해 주세요.`}
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3 px-[18px] pb-8 pt-4">
        <Button disabled={!isValid || saveMutation.isPending} onClick={() => setConfirmModalOpen(true)}>
          {editingAccount ? '수정 완료' : '등록 완료'}
        </Button>
      </div>

      <BankSelectSheet
        open={bankSheetOpen}
        onClose={() => setBankSheetOpen(false)}
        onSelect={(bank) => {
          setBankName(bank)
          setBankSheetOpen(false)
        }}
      />

      <ConfirmModal
        open={confirmModalOpen}
        title="계좌 정보를 확인해 주세요"
        description={'입력한 계좌로 선물 금액이 전달돼요.\n계좌 정보가 맞는지 다시 확인해 주세요.'}
        cancelText="다시 확인할게요"
        confirmText="네, 확인했어요"
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={() => {
          setConfirmModalOpen(false)
          saveMutation.mutate()
        }}
      />
    </div>
  )
}
