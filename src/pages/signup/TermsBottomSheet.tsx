import { useState } from 'react'
import BottomSheet from '../../components/common/BottomSheet'
import Button from '../../components/common/Button'
import CheckIcon from '../../components/icons/CheckIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'

const TERMS = [
  { id: 'service', label: '[필수] 이용약관 동의', required: true, hasDetail: true },
  { id: 'privacy', label: '[필수] 개인정보 처리방침', required: true, hasDetail: true },
  { id: 'marketing', label: '[선택] 마케팅 정보 수신 동의', required: false, hasDetail: false },
] as const

type TermId = (typeof TERMS)[number]['id']

interface TermsBottomSheetProps {
  open: boolean
  onClose: () => void
  /** 필수 약관 동의 후 "동의하고 시작하기" 클릭 시 호출 */
  onConfirm: () => void
}

/** 소셜 로그인 시 노출되는 약관 동의 바텀시트 */
export default function TermsBottomSheet({ open, onClose, onConfirm }: TermsBottomSheetProps) {
  const [agreed, setAgreed] = useState<Set<TermId>>(new Set())

  const allAgreed = agreed.size === TERMS.length
  const requiredAgreed = TERMS.filter((t) => t.required).every((t) => agreed.has(t.id))

  const toggleAll = () => {
    setAgreed(allAgreed ? new Set() : new Set(TERMS.map((t) => t.id)))
  }

  const toggle = (id: TermId) => {
    setAgreed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex w-full flex-col gap-6">
        <p className="text-h3-sb text-black">약관 동의</p>
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={toggleAll}
            className="flex w-full items-center gap-2 rounded-lg bg-background px-3.5 py-3"
          >
            <span
              className={`flex size-4 items-center justify-center rounded text-white ${allAgreed ? 'bg-gray-900' : 'bg-gray-300'}`}
            >
              <CheckIcon className="size-3.5" />
            </span>
            <span className="text-b2-m text-gray-700">전체 동의</span>
          </button>
          <ul className="flex flex-col">
            {TERMS.map((term) => (
              <li key={term.id} className="flex items-center justify-between py-2 pl-[13px] pr-3.5">
                <button type="button" onClick={() => toggle(term.id)} className="flex items-center gap-2">
                  <CheckIcon className={`size-4 ${agreed.has(term.id) ? 'text-gray-900' : 'text-gray-300'}`} />
                  <span className="text-b2-r text-gray-700">{term.label}</span>
                </button>
                {term.hasDetail && (
                  /* TODO: 약관 상세 페이지 연결 */
                  <button type="button" aria-label={`${term.label} 자세히 보기`} className="text-gray-700">
                    <ChevronRightIcon className="size-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        <Button disabled={!requiredAgreed} onClick={onConfirm}>
          동의하고 시작하기
        </Button>
      </div>
    </BottomSheet>
  )
}
