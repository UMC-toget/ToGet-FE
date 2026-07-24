import { useState } from 'react'
import BottomSheet from '../../components/common/BottomSheet'
import SearchIcon from '../../components/icons/SearchIcon'
import ArrowUpRightIcon from '../../components/icons/ArrowUpRightIcon'
import { BANK_NAMES, BANK_NAME_LABELS } from '../../api/userAccounts'
import type { BankName } from '../../api/userAccounts'

interface BankSelectSheetProps {
  open: boolean
  onClose: () => void
  onSelect: (bank: BankName) => void
}

/**
 * 은행명 앞부분이 검색어로 시작하면 매치된 부분을 회색으로, 나머지를 검게 표시합니다.
 * 매치가 한글 은행명이 아니라 영문 코드(예: SHINHAN)로만 된 경우엔 강조 없이 그대로 보여줍니다.
 */
function BankLabel({ label, query }: { label: string; query: string }) {
  if (query && label.startsWith(query)) {
    return (
      <p className="text-b1-m text-black">
        <span className="text-gray-400">{label.slice(0, query.length)}</span>
        {label.slice(query.length)}
      </p>
    )
  }
  return <p className="text-b1-m text-black">{label}</p>
}

// TODO: 지금은 클라이언트에 하드코딩된 BANK_NAMES 목록에서 검색합니다.
// 은행 목록/검색을 서버에서 내려주는 API가 생기면 그쪽으로 교체해야 합니다.
function searchBanks(query: string): BankName[] {
  if (!query) return []
  const normalized = query.trim().toLowerCase()
  return BANK_NAMES.filter(
    (bank) => BANK_NAME_LABELS[bank].startsWith(query.trim()) || bank.toLowerCase().startsWith(normalized),
  )
}

/** 계좌 등록/수정 시 은행을 검색해서 고르는 바텀시트 */
export default function BankSelectSheet({ open, onClose, onSelect }: BankSelectSheetProps) {
  const [query, setQuery] = useState('')
  const results = searchBanks(query)

  const handleClose = () => {
    setQuery('')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <div className="flex w-full flex-col items-start gap-5">
        <p className="text-h3-sb text-black">은행명</p>
        <div className="flex h-12 w-full items-center gap-2 rounded-lg bg-background px-4">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="은행명을 검색 후 선택해주세요"
            className="min-w-0 flex-1 bg-transparent text-b1-m text-black outline-none placeholder:text-gray-400"
          />
          <SearchIcon className="size-6 shrink-0 text-black" />
        </div>
        {results.length > 0 && (
          <ul className="flex max-h-[50vh] w-full flex-col overflow-y-auto">
            {results.map((bank) => (
              <li key={bank} className="w-full">
                <button
                  type="button"
                  onClick={() => {
                    onSelect(bank)
                    setQuery('')
                  }}
                  className="flex w-full items-center justify-between gap-2 py-2 pl-4 text-left"
                >
                  <BankLabel label={BANK_NAME_LABELS[bank]} query={query.trim()} />
                  <ArrowUpRightIcon className="size-6 shrink-0 text-gray-600" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BottomSheet>
  )
}
