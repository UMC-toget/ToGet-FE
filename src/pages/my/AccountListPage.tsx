import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import PlusIcon from '../../components/icons/PlusIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import EditPencilIcon from '../../components/icons/EditPencilIcon'
import BankIcon from '../../components/icons/BankIcon'
import { MOCK_ACCOUNTS } from './mockAccounts'

/** 등록된 나의 계좌 목록 (I. 마이 > 계좌) */
export default function AccountListPage() {
  const navigate = useNavigate()

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
        {MOCK_ACCOUNTS.length > 0 ? (
          <>
            <p className="text-b1-m text-black">등록된 {MOCK_ACCOUNTS.length}개 계좌</p>
            <div className="flex flex-col gap-4">
              {MOCK_ACCOUNTS.map((account) => (
                <div key={account.id} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white px-3.5 py-3">
                  <div className="flex gap-3">
                    <span className="flex size-[63px] shrink-0 items-center justify-center rounded-md bg-background">
                      <img src={account.bankLogo} alt="" className="size-[50px] object-contain" />
                    </span>
                    <div className="flex flex-col gap-3">
                      <p className="text-caption1-r text-gray-700">{account.bankName}</p>
                      <div className="flex flex-col gap-1">
                        <p className="text-b2-m text-black">{account.accountHolder}</p>
                        <p className="text-b2-m text-black">{account.accountNumber}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/my/accounts/${account.id}/edit`)}
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
            <BankIcon className="size-12 text-gray-400" />
            <p className="text-b1-m text-gray-600">등록된 계좌가 없어요</p>
          </div>
        )}
      </div>
    </div>
  )
}
