import { useState } from 'react'
import type { LetterColor } from './letterColors'
import CaretDownIcon from '../../components/icons/CaretDownIcon'

// TODO: BE 연동 후 펀딩 상세 응답의 개설자 계좌 정보로 교체 (D05에서 등록한 계좌)
const MOCK_ACCOUNT = {
  bankName: '카카오뱅크',
  accountNumber: '3333-22-1234567',
  holderName: '김희주',
}

interface DepositStepProps {
  hostName: string
  letter: string
  letterColor: LetterColor
  /** 0이면 금액 없이 참여(마음만 보내기) → 계좌 안내 숨김 */
  amount: number
}

/** E03 4단계: 마음 전하기 (피그마 #1714:68700) */
export default function DepositStep({ hostName, letter, letterColor, amount }: DepositStepProps) {
  const [letterOpen, setLetterOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyAccountNumber = async () => {
    let ok = true
    try {
      await navigator.clipboard.writeText(MOCK_ACCOUNT.accountNumber)
    } catch {
      // 카톡 인앱 브라우저 등 clipboard API 미지원 환경 fallback
      const textarea = document.createElement('textarea')
      textarea.value = MOCK_ACCOUNT.accountNumber
      document.body.appendChild(textarea)
      textarea.select()
      ok = document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(ok)
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-h3-sb leading-normal text-black">4. 마음 전하기</h2>

      <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-b1-m leading-normal text-black">축하 메세지</p>
        <button
          type="button"
          onClick={() => setLetterOpen((prev) => !prev)}
          className="flex flex-col rounded-xl border px-4 py-3"
          style={{ backgroundColor: letterColor.bg, borderColor: letterColor.border }}
        >
          <span className="flex w-full items-center justify-between">
            <span className="text-b1-m text-black">
              {hostName}에게{!letterOpen && '···'}
            </span>
            <CaretDownIcon className={`size-6 text-gray-700 ${letterOpen ? 'rotate-180' : ''}`} />
          </span>
          {letterOpen && (
            <span
              className="mt-2 block w-full whitespace-pre-line pb-[28px] text-left text-b2-r leading-[28px] text-gray-800"
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 27px, ${letterColor.border} 27px, ${letterColor.border} 28px)`,
              }}
            >
              {letter}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-b1-m leading-normal text-black">참여 금액</p>
        <div className="flex h-12 items-center rounded-lg bg-background px-4">
          <span className="text-b1-m text-black">{amount > 0 ? `${amount.toLocaleString()}원` : '마음만 보내기'}</span>
        </div>
      </div>

      {amount > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-b1-m leading-normal text-black">입금계좌</p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
              {[
                ['은행', MOCK_ACCOUNT.bankName],
                ['계좌번호', MOCK_ACCOUNT.accountNumber],
                ['예금주', MOCK_ACCOUNT.holderName],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`flex items-center justify-between ${index < 2 ? 'border-b border-gray-200 pb-2' : ''}`}
                >
                  <span className="text-b2-m font-semibold leading-normal text-gray-500">{label}</span>
                  <span className="text-b2-m font-semibold leading-normal text-gray-700">{value}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={copyAccountNumber}
              className="flex h-[50px] items-center justify-center rounded-lg bg-gray-700 text-b1-m text-white"
            >
              계좌번호 복사
            </button>
            {copied && (
              <p className="text-caption1-m leading-normal text-pink-500">계좌번호가 복사되었습니다.</p>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
