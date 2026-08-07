import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import BankIcon from '../icons/BankIcon'
import { useBanks } from '../../hooks/useUserAccounts'
import { BANK_NAME_LABELS } from '../../api/userAccounts'
import type { BankName } from '../../api/userAccounts'

// 로고 자산 자체에 여백 없이 꽉 차 있어, 박스 안에 작게 띄우면(object-contain) 어색한 은행들
const FULL_BLEED_ICON_BANKS = new Set<BankName>(['KAKAO_BANK', 'K_BANK', 'GWANGJU', 'JEONBUK'])

/** 계좌번호(하이픈 제외 숫자)를 3-3-6 형태로 보기 좋게 표시합니다. 형식이 다르면 원문 그대로 둡니다. */
function formatAccountNumber(account: string): string {
  const match = account.match(/^(\d{3})(\d{3})(\d{4,})$/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : account
}

interface AccountCardProps {
  bankCode: BankName
  accountOwner: string
  /** 하이픈 제외 숫자만 (자동으로 3-3-6 형태로 표시) */
  account: string
  /** 계좌를 골라 쓰는 화면(선택형)에서 강조 표시. 기본 false */
  selected?: boolean
  /** 카드 하단 액션 영역(버튼 등) - 화면마다 배치·문구가 달라 각자 렌더링 */
  children?: ReactNode
}

/**
 * 은행 아이콘 + 은행명 + 예금주 + 계좌번호를 보여주는 계좌 카드 (피그마 "등록된 나의 계좌" 기준).
 * 마이(I) 계좌 목록, 내 선물 페이지 만들기(D), 함께 선물 페이지 만들기(G)에서 공통으로 씁니다.
 *
 * @example
 * <AccountCard bankCode="SHINHAN" accountOwner="김희주" account="110585123456">
 *   <div className="flex items-center gap-3">...버튼들...</div>
 * </AccountCard>
 */
export default function AccountCard({
  bankCode,
  accountOwner,
  account,
  selected = false,
  children,
}: AccountCardProps) {
  const { data: banks } = useBanks()
  const bankByCode = useMemo(() => new Map(banks?.map((bank) => [bank.code, bank]) ?? []), [banks])
  const [brokenIconCodes, setBrokenIconCodes] = useState<Set<BankName>>(new Set())

  const iconUrl = bankByCode.get(bankCode)?.iconUrl

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border bg-white px-3.5 py-3 ${
        selected ? 'border-gray-900' : 'border-gray-100'
      }`}
    >
      <div className="flex gap-3">
        <span className="flex size-[63px] shrink-0 items-center justify-center rounded-md bg-background">
          {iconUrl && !brokenIconCodes.has(bankCode) ? (
            <img
              src={iconUrl}
              alt=""
              className={
                FULL_BLEED_ICON_BANKS.has(bankCode)
                  ? 'size-[63px] rounded-md object-cover'
                  : 'size-[50px] object-contain'
              }
              onError={() => setBrokenIconCodes((prev) => new Set(prev).add(bankCode))}
            />
          ) : (
            <BankIcon className="size-6 text-gray-400" />
          )}
        </span>
        <div className="flex flex-col gap-3">
          <p className="text-caption1-r text-gray-700">{BANK_NAME_LABELS[bankCode]}</p>
          <div className="flex flex-col gap-1.5">
            <p className="text-b2-m text-black">{accountOwner}</p>
            <p className="text-b2-m text-black">{formatAccountNumber(account)}</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
