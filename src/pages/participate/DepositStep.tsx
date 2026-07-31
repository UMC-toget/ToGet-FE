import { useEffect, useState } from 'react'
import type { LetterColor } from '../../components/common/letterPalette'
import LetterCard from '../../components/common/LetterCard'
import { getFundingAccount } from '../../api/fundings'
import { BANK_NAME_LABELS } from '../../api/userAccounts'

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
  fundingId?: string
}

/** E03 4단계: 마음 전하기 (피그마 #1714:68700) */
export default function DepositStep({ hostName, letter, letterColor, amount, fundingId }: DepositStepProps) {
  const [letterOpen, setLetterOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [account, setAccount] = useState(MOCK_ACCOUNT)
  const [accountLoaded, setAccountLoaded] = useState(false)

  useEffect(() => {
    if (!fundingId) return
    getFundingAccount(fundingId)
      .then((acc) => {
        setAccount({
          bankName: BANK_NAME_LABELS[acc.bankName] ?? acc.bankName,
          accountNumber: acc.account,
          holderName: acc.accountOwner,
        })
        setAccountLoaded(true)
      })
      .catch(console.error)
  }, [fundingId])

  const copyAccountNumber = async () => {
    // 은행 앱 계좌 입력란에 바로 붙여넣을 수 있게 하이픈 없이 숫자만 복사
    const digits = account.accountNumber.replace(/-/g, '')
    let ok = true
    try {
      await navigator.clipboard.writeText(digits)
    } catch {
      // 카톡 인앱 브라우저 등 clipboard API 미지원 환경 fallback
      const textarea = document.createElement('textarea')
      textarea.value = digits
      document.body.appendChild(textarea)
      textarea.select()
      ok = document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-h3-sb leading-normal text-black">4. 마음 전하기</h2>

      <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-b1-m leading-normal text-black">축하 메세지</p>
        <LetterCard
          color={letterColor}
          state={letterOpen ? 'open' : 'folded'}
          title={`${hostName}에게`}
          content={letter}
          onToggle={() => setLetterOpen((prev) => !prev)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-b1-m leading-normal text-black">참여 금액</p>
        <div className="flex h-12 items-center rounded-lg bg-background px-4">
          <span className="text-b1-m text-black">{amount > 0 ? `${amount.toLocaleString()}원` : '마음만 보내기'}</span>
        </div>
      </div>

      {amount > 0 && accountLoaded && (
        <div className="flex flex-col gap-2">
          <p className="text-b1-m leading-normal text-black">입금계좌</p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
              {[
                ['은행', account.bankName],
                ['계좌번호', account.accountNumber],
                ['예금주', account.holderName],
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
