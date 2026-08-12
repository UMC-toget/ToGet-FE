import { useState } from 'react'
import TextField from './TextField'
import BankSelectSheet from './BankSelectSheet'
import CaretDownIcon from '../icons/CaretDownIcon'
import { BANK_NAME_LABELS } from '../../api/userAccounts'
import type { BankName } from '../../api/userAccounts'
import { formatAccountNumber, normalizeAccountNumber } from '../../utils/accountNumber'

interface AccountFormFieldsProps {
  /** 상단 안내 문구 표시 여부. 기본 true (등록/수정 화면 모두 피그마에서 항상 노출) */
  showIntro?: boolean
  accountHolder: string
  onAccountHolderChange: (value: string) => void
  accountNumber: string
  onAccountNumberChange: (value: string) => void
  bankCode: BankName | ''
  onBankCodeChange: (bank: BankName) => void
}

/**
 * 계좌 등록/수정 폼의 예금주·계좌번호·은행명 입력 부분 (피그마 "새로운 계좌 등록하기"/"계좌 수정하기" 화면 기준).
 * 마이(I) 계좌 관리, 내 선물 페이지 만들기(D), 함께 선물 페이지 만들기(G)에서 공통으로 씁니다.
 * Header, 제출 버튼, 저장 확인 모달은 화면마다 배치가 달라 이 컴포넌트 밖에서 각자 렌더링합니다.
 *
 * @example
 * <AccountFormFields
 *   accountHolder={accountHolder} onAccountHolderChange={setAccountHolder}
 *   accountNumber={accountNumber} onAccountNumberChange={setAccountNumber}
 *   bankCode={bankCode} onBankCodeChange={setBankCode}
 * />
 */
export default function AccountFormFields({
  showIntro = true,
  accountHolder,
  onAccountHolderChange,
  accountNumber,
  onAccountNumberChange,
  bankCode,
  onBankCodeChange,
}: AccountFormFieldsProps) {
  const [bankSheetOpen, setBankSheetOpen] = useState(false)

  return (
    <>
      {showIntro && (
        <div className="flex flex-col gap-3 px-[18px] pt-8">
          <p className="text-h3-sb text-black">선물 준비에 사용할 계좌를 등록해 주세요</p>
          <p className="text-caption1-r text-gray-600">친구들이 선물에 함께할 때 이 계좌 정보를 확인할 수 있어요</p>
        </div>
      )}

      <div className="flex flex-col gap-5 px-[18px] pt-6">
        <TextField
          label={
            <>
              예금주 <span className="text-pink-500">*</span>
            </>
          }
          value={accountHolder}
          onChange={(e) => onAccountHolderChange(e.target.value.replace(/[^가-힣ㄱ-ㅣa-zA-Z\s]/g, ''))}
          placeholder="예금주 이름을 정확히 입력해 주세요"
          maxLength={25}
          hideCounter
        />

        <TextField
          label={
            <>
              계좌번호 <span className="text-pink-500">*</span>
            </>
          }
          value={formatAccountNumber(accountNumber, bankCode)}
          onChange={(e) => onAccountNumberChange(normalizeAccountNumber(e.target.value).slice(0, 15))}
          placeholder="본인의 계좌번호를 정확히 입력해주세요"
          inputMode="numeric"
          maxLength={19}
          hideCounter
        />

        <div className="flex flex-col gap-3">
          <label className="text-b1-m text-black">
            은행명 <span className="text-pink-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setBankSheetOpen(true)}
            className="flex h-12 w-full items-center justify-between gap-2 rounded-lg bg-background px-4"
          >
            <span className={`text-b1-m ${bankCode ? 'text-black' : 'text-gray-400'}`}>
              {bankCode ? BANK_NAME_LABELS[bankCode] : '은행명을 정확히 선택해 주세요'}
            </span>
            <CaretDownIcon className="size-10 shrink-0 text-black" />
          </button>
          {bankCode === '' && (
            <p className="text-caption1-r text-gray-600">계좌번호를 입력하면 해당 은행을 추천해 드려요</p>
          )}
        </div>
      </div>

      <BankSelectSheet
        open={bankSheetOpen}
        onClose={() => setBankSheetOpen(false)}
        onSelect={(bank) => {
          onBankCodeChange(bank)
          setBankSheetOpen(false)
        }}
      />
    </>
  )
}
