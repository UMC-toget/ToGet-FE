import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Header from '../../components/common/Header'
import ConfirmModal from '../../components/common/ConfirmModal'
import Toast from '../../components/common/Toast'
import PlusIcon from '../../components/icons/PlusIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import BankIcon from '../../components/icons/BankIcon'
import { useBanks, useUserAccounts, USER_ACCOUNTS_QUERY_KEY } from '../../hooks/useUserAccounts'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { BANK_NAME_LABELS, deleteUserAccount } from '../../api/userAccounts'
import type { BankName } from '../../api/userAccounts'

// 로고 자산 자체에 여백 없이 꽉 차 있어, 박스 안에 작게 띄우면(object-contain) 어색한 은행들
const FULL_BLEED_ICON_BANKS = new Set<BankName>(['KAKAO_BANK', 'K_BANK', 'GWANGJU', 'JEONBUK'])

/** 계좌번호(하이픈 제외 숫자)를 3-3-6 형태로 보기 좋게 표시합니다. 형식이 다르면 원문 그대로 둡니다. */
function formatAccountNumber(account: string): string {
  const match = account.match(/^(\d{3})(\d{3})(\d{4,})$/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : account
}

/** 등록된 나의 계좌 목록 (I. 마이 > 계좌) */
export default function AccountListPage() {
  useRequireAuth()
  const navigate = useNavigate()
  const { data: accounts } = useUserAccounts()
  const accountList = accounts ?? []
  const { data: banks } = useBanks()
  const bankByCode = useMemo(() => new Map(banks?.map((bank) => [bank.code, bank]) ?? []), [banks])
  const queryClient = useQueryClient()

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [errorToastOpen, setErrorToastOpen] = useState(false)
  const [brokenIconCodes, setBrokenIconCodes] = useState<Set<BankName>>(new Set())

  const deleteMutation = useMutation({
    mutationFn: (userAccountId: number) => deleteUserAccount(userAccountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_ACCOUNTS_QUERY_KEY })
      setDeleteTargetId(null)
    },
    onError: () => {
      setDeleteTargetId(null)
      setErrorToastOpen(true)
      setTimeout(() => setErrorToastOpen(false), 2500)
    },
  })

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="등록된 나의 계좌" />

      <div className="px-[18px] pt-4">
        <button
          type="button"
          onClick={() => navigate('/my/accounts/new')}
          className="flex w-full items-center gap-3 rounded-xl border border-gray-100 px-3.5 py-3"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-background">
            <PlusIcon className="size-4 text-black" />
          </span>
          <span className="flex-1 text-left text-b2-m text-black">새로운 계좌 등록하기</span>
          <ChevronRightIcon className="size-6 text-black" />
        </button>
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-5 bg-background px-[18px] pt-5 pb-8">
        {accountList.length > 0 ? (
          <>
            <p className="text-b1-m text-black">등록된 {accountList.length}개 계좌</p>
            <div className="flex flex-col gap-4">
              {accountList.map((account) => (
                <div
                  key={account.userAccountId}
                  className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white px-3.5 py-3"
                >
                  <div className="flex gap-3">
                    <span className="flex size-[63px] shrink-0 items-center justify-center rounded-md bg-background">
                      {bankByCode.get(account.bankName)?.iconUrl && !brokenIconCodes.has(account.bankName) ? (
                        <img
                          src={bankByCode.get(account.bankName)?.iconUrl ?? undefined}
                          alt=""
                          className={
                            FULL_BLEED_ICON_BANKS.has(account.bankName)
                              ? 'size-[63px] rounded-md object-cover'
                              : 'size-[50px] object-contain'
                          }
                          onError={() =>
                            setBrokenIconCodes((prev) => new Set(prev).add(account.bankName))
                          }
                        />
                      ) : (
                        <BankIcon className="size-6 text-gray-400" />
                      )}
                    </span>
                    <div className="flex flex-col gap-3">
                      <p className="text-caption1-r text-gray-700">{BANK_NAME_LABELS[account.bankName]}</p>
                      <div className="flex flex-col gap-1.5">
                        <p className="text-b2-m text-black">{account.accountOwner}</p>
                        <p className="text-b2-m text-black">{formatAccountNumber(account.account)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(account.userAccountId)}
                      className="flex h-9 flex-1 items-center justify-center rounded-lg bg-gray-100 px-2.5 py-2"
                    >
                      <span className="text-caption1-m text-black">삭제하기</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/my/accounts/${account.userAccountId}/edit`)}
                      className="flex h-9 flex-1 items-center justify-center rounded-lg bg-gray-900 px-2.5 py-2"
                    >
                      <span className="text-caption1-m text-white">수정하기</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 pb-20">
            <PlusIcon className="size-12 text-gray-400" />
            <p className="text-b1-m text-gray-600">등록된 계좌가 없어요</p>
          </div>
        )}
      </div>

      <ConfirmModal
        open={deleteTargetId !== null}
        title="계좌를 삭제할까요?"
        description={'삭제한 계좌는 필요할 때\n다시 등록할 수 있어요.'}
        confirmText="삭제하기"
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId !== null) deleteMutation.mutate(deleteTargetId)
        }}
      />
      <Toast open={errorToastOpen} message="계좌 삭제에 실패했어요. 다시 시도해 주세요." standalone />
    </div>
  )
}
