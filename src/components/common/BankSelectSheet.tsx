import { useMemo } from 'react'
import BottomSheet from './BottomSheet'
import BankIcon from '../icons/BankIcon'
import { useBanks } from '../../hooks/useUserAccounts'
import type { BankName } from '../../api/userAccounts'

interface BankSelectSheetProps {
  open: boolean
  onClose: () => void
  onSelect: (bank: BankName) => void
}

// 백엔드 sortOrder가 피그마 노출 순서와 아직 안 맞아 프론트에서 고정 순서로 재정렬합니다.
const BANK_DISPLAY_ORDER: BankName[] = [
  'KB',
  'SHINHAN',
  'NH',
  'KAKAO_BANK',
  'WOORI',
  'HANA',
  'TOSS_BANK',
  'IBK',
  'MG_SAEMAEUL',
  'SHINHYUP',
  'POST_OFFICE',
  'K_BANK',
  'BUSAN',
  'IM_BANK',
  'GYEONGNAM',
  'GWANGJU',
  'JEONBUK',
  'SUHYUP',
  'SC',
  'JEJU',
  'CITI',
  'KDB',
]

/** "KB국민은행" -> "KB국민" 처럼 그리드 카드에 쓸 짧은 은행명 (끝의 "은행"만 제거) */
function shortBankLabel(displayName: string): string {
  return displayName.replace(/은행$/, '')
}

/**
 * 계좌 등록/수정 시 은행을 아이콘 그리드에서 골라 선택하는 바텀시트 (피그마 기준).
 * 마이(I) 계좌 관리, 내 선물 페이지 만들기(D), 함께 선물 페이지 만들기(G)에서 공통으로 씁니다.
 */
export default function BankSelectSheet({ open, onClose, onSelect }: BankSelectSheetProps) {
  const { data: banks } = useBanks()
  const sortedBanks = useMemo(
    () =>
      [...(banks ?? [])].sort(
        (a, b) => BANK_DISPLAY_ORDER.indexOf(a.code) - BANK_DISPLAY_ORDER.indexOf(b.code),
      ),
    [banks],
  )

  return (
    <BottomSheet open={open} onClose={onClose} drag={{ peekOffsetPx: 460, expandedOffsetPx: 320 }}>
      <div className="flex w-full flex-col items-start gap-5">
        <p className="text-h3-sb text-black">은행명</p>
        <div className="grid w-full grid-cols-3 gap-3">
          {sortedBanks.map((bank) => (
            <button
              key={bank.bankId}
              type="button"
              onClick={() => onSelect(bank.code)}
              className="flex flex-col items-center justify-center gap-1.5 rounded-lg bg-background pb-3 pt-3"
            >
              {bank.iconUrl ? (
                <img src={bank.iconUrl} alt="" className="size-[60px] object-contain" />
              ) : (
                <BankIcon className="size-[60px] p-4 text-gray-400" />
              )}
              <span className="text-b2-r text-black">{shortBankLabel(bank.displayName)}</span>
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  )
}
