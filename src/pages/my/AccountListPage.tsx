import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import PlusIcon from '../../components/icons/PlusIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import EditPencilIcon from '../../components/icons/EditPencilIcon'
import BankIcon from '../../components/icons/BankIcon'
import { useUserAccounts } from '../../hooks/useUserAccounts'
import { BANK_NAME_LABELS } from '../../api/userAccounts'
import bankShinhan from '../../assets/bank-shinhan.png'
import bankKakao from '../../assets/bank-kakao.png'

// 지금은 신한/카카오뱅크 로고 자산만 있어 나머지 은행은 아이콘으로 대체합니다.
const BANK_LOGOS: Partial<Record<string, string>> = {
  SHINHAN: bankShinhan,
  KAKAO_BANK: bankKakao,
}

/** 계좌번호(하이픈 제외 숫자)를 3-3-6 형태로 보기 좋게 표시합니다. 형식이 다르면 원문 그대로 둡니다. */
function formatAccountNumber(account: string): string {
  const match = account.match(/^(\d{3})(\d{3})(\d{4,})$/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : account
}

/** 등록된 나의 계좌 목록 (I. 마이 > 계좌) */
export default function AccountListPage() {
  const navigate = useNavigate()
  const { data: accounts } = useUserAccounts()
  const accountList = accounts ?? []

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

      <div className="mt-5 flex flex-1 flex-col gap-5 bg-background px-[18px] pt-5">
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
                      {BANK_LOGOS[account.bankName] ? (
                        <img src={BANK_LOGOS[account.bankName]} alt="" className="size-[50px] object-contain" />
                      ) : (
                        <BankIcon className="size-6 text-gray-400" />
                      )}
                    </span>
                    <div className="flex flex-col gap-3">
                      <p className="text-caption1-r text-gray-700">{BANK_NAME_LABELS[account.bankName]}</p>
                      <div className="flex flex-col gap-1">
                        <p className="text-b2-m text-black">{account.accountOwner}</p>
                        <p className="text-b2-m text-black">{formatAccountNumber(account.account)}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/my/accounts/${account.userAccountId}/edit`)}
                    className="flex items-center justify-center gap-3 rounded-lg bg-gray-100 px-2.5 py-2"
                  >
                    <EditPencilIcon className="size-5 text-black" />
                    <span className="text-caption1-m text-black">계좌 수정하기</span>
                  </button>
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
    </div>
  )
}
