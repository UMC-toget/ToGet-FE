import { useState } from 'react'
import { Link } from 'react-router-dom'
import BottomSheet from '../../components/common/BottomSheet'
import Button from '../../components/common/Button'
import CheckIcon from '../../components/icons/CheckIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'

const TERMS = [
  { id: 'service', label: '[필수] 이용약관 동의', required: true, detailPath: '/terms' },
  { id: 'privacy', label: '[필수] 개인정보 처리방침', required: true, detailPath: '/privacy-policy' },
] as const

type TermId = (typeof TERMS)[number]['id']

interface TermsBottomSheetProps {
  open: boolean
  onClose: () => void
  /** 필수 약관 동의 후 "동의하고 시작하기" 클릭 시 호출 */
  onConfirm: () => void
  /** 약관 상세 페이지 이동 후 돌아와도 체크 상태가 유지되도록 세션에 저장할 때 쓰는 키 (보통 signupToken) */
  persistKey?: string
}

function readPersistedAgreed(storageKey: string | null): Set<TermId> {
  if (!storageKey) return new Set()
  try {
    const stored = sessionStorage.getItem(storageKey)
    return stored ? new Set(JSON.parse(stored) as TermId[]) : new Set()
  } catch {
    return new Set()
  }
}

/** 소셜 로그인 시 노출되는 약관 동의 바텀시트 */
export default function TermsBottomSheet({ open, onClose, onConfirm, persistKey }: TermsBottomSheetProps) {
  const storageKey = persistKey ? `signup:agreedTerms:${persistKey}` : null
  const [agreed, setAgreed] = useState<Set<TermId>>(() => readPersistedAgreed(storageKey))

  const allAgreed = agreed.size === TERMS.length
  const requiredAgreed = TERMS.filter((t) => t.required).every((t) => agreed.has(t.id))

  const applyAgreed = (next: Set<TermId>) => {
    setAgreed(next)
    if (storageKey) sessionStorage.setItem(storageKey, JSON.stringify([...next]))
  }

  const toggleAll = () => {
    applyAgreed(allAgreed ? new Set() : new Set(TERMS.map((t) => t.id)))
  }

  const toggle = (id: TermId) => {
    const next = new Set(agreed)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    applyAgreed(next)
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
                {term.detailPath && (
                  <Link to={term.detailPath} aria-label={`${term.label} 자세히 보기`} className="text-gray-700">
                    <ChevronRightIcon className="size-4" />
                  </Link>
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
