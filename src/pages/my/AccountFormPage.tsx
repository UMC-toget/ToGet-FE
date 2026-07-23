import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import TextField from '../../components/common/TextField'
import Button from '../../components/common/Button'
import SearchIcon from '../../components/icons/SearchIcon'
import { MOCK_ACCOUNTS } from './mockAccounts'

/** 계좌 등록/수정 폼 (I. 마이 > 계좌). id가 있으면 수정, 없으면 새 계좌 등록입니다. */
export default function AccountFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const editingAccount = id ? MOCK_ACCOUNTS.find((a) => a.id === Number(id)) : undefined

  const [bankName, setBankName] = useState(editingAccount?.bankName ?? '')
  const [accountNumber, setAccountNumber] = useState(editingAccount?.accountNumber ?? '')
  const [accountHolder, setAccountHolder] = useState(editingAccount?.accountHolder ?? '')

  const isValid = bankName.length > 0 && accountNumber.length > 0 && accountHolder.length > 0

  const handleSubmit = () => {
    // TODO: 계좌 등록/수정 API 연동
    navigate('/my/accounts')
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title={editingAccount ? '계좌 수정하기' : '계좌 등록하기'} />

      <div className="flex flex-col gap-4 px-[18px] pt-4">
        <div className="flex flex-col gap-2">
          <label className="text-b1-m text-black">
            은행명 <span className="text-pink-500">*</span>
          </label>
          <div className="flex h-12 w-full items-center justify-between gap-2 rounded-lg bg-background px-4">
            <input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="은행명을 검색해 주세요"
              className="min-w-0 flex-1 bg-transparent text-b1-m text-black outline-none placeholder:text-gray-400"
            />
            <SearchIcon className="size-6 shrink-0 text-black" />
          </div>
          {/* TODO: 실제 은행 검색/선택 플로우 연동 (지금은 자유 입력) */}
        </div>

        <TextField
          label={
            <>
              계좌번호 <span className="text-pink-500">*</span>
            </>
          }
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="계좌번호를 입력해 주세요"
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
          placeholder="예금주명을 입력해 주세요"
        />
      </div>

      <div className="mt-auto flex flex-col gap-3 px-[18px] pb-8 pt-4">
        <Button disabled={!isValid} onClick={handleSubmit}>
          {editingAccount ? '저장하기' : '등록하기'}
        </Button>
      </div>
    </div>
  )
}
