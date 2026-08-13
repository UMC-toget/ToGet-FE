import { useCallback, useEffect, useState } from 'react'
import type { LetterColor } from '../../components/common/letterPalette'
import LetterCard from '../../components/common/LetterCard'
import Toast from '../../components/common/Toast'
import { getFundingAccount } from '../../api/fundings'
import { BANK_NAME_LABELS } from '../../api/userAccounts'
import type { BankName } from '../../api/userAccounts'
import { formatAccountNumber, normalizeAccountNumber } from '../../utils/accountNumber'

const MOCK_ACCOUNT = {
  bankCode: 'KAKAO_BANK' as BankName,
  bankName: '카카오뱅크',
  accountNumber: '3333-22-1234567',
  holderName: '김희주',
}

interface DepositStepProps {
  hostName: string
  letter: string
  /** 선택된 편지지 색 (색 목록 로딩 전이면 undefined) */
  letterColor?: LetterColor
  /** 0이면 금액 없이 참여(마음만 보내기) → 계좌 안내 숨김 */
  amount: number
  fundingId?: string
}

/** E03 4단계: 마음 전하기 (피그마 #1714:68700) */
export default function DepositStep({ hostName, letter, letterColor, amount, fundingId }: DepositStepProps) {
  const [letterOpen, setLetterOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [account, setAccount] = useState<typeof MOCK_ACCOUNT | null>(null)
  const [accountError, setAccountError] = useState(false)

  const loadAccount = useCallback(() => {
    if (!fundingId) return
    getFundingAccount(fundingId)
      .then((acc) => {
        setAccount({
          bankCode: acc.bankName,
          bankName: BANK_NAME_LABELS[acc.bankName] ?? acc.bankName,
          accountNumber: formatAccountNumber(acc.account, acc.bankName),
          holderName: acc.accountOwner,
        })
        setAccountError(false)
      })
      .catch(() => {
        // 결제 흐름이라 실패 시 mock 계좌를 노출하면 엉뚱한 곳으로 송금될 수 있어
        // 운영에서는 에러 안내만 띄우고, BE 없는 DEV에서만 mock으로 화면 확인
        if (import.meta.env.DEV) setAccount(MOCK_ACCOUNT)
        else setAccountError(true)
      })
  }, [fundingId])

  useEffect(() => {
    loadAccount()
  }, [loadAccount])

  const copyAccountNumber = async () => {
    if (!account) return
    // 은행 앱 계좌 입력란에 바로 붙여넣을 수 있게 하이픈 없이 숫자만 복사
    const digits = normalizeAccountNumber(account.accountNumber)
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
        {letterColor && (
        <LetterCard
          color={letterColor}
          state={letterOpen ? 'open' : 'folded'}
          title={`${hostName}에게`}
          content={letter}
          onToggle={() => setLetterOpen((prev) => !prev)}
        />
        )}
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
          {account ? (
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
            </div>
          ) : accountError ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-6">
              <p className="text-b2-r leading-normal text-gray-700">계좌 정보를 불러오지 못했어요.</p>
              <button
                type="button"
                onClick={() => {
                  setAccountError(false)
                  loadAccount()
                }}
                className="flex h-10 items-center justify-center rounded-lg bg-gray-700 px-6 text-b2-m text-white"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div className="flex h-[92px] items-center justify-center rounded-xl border border-gray-200 bg-white">
              <p className="text-b2-r leading-normal text-gray-500">계좌 정보를 불러오는 중...</p>
            </div>
          )}
        </div>
      )}
      </div>

      {/* '마음 보내기' CTA 버튼 top(하단에서 86px)보다 20px 위 = bottom 106px */}
      <Toast open={copied} message="계좌번호가 복사되었습니다" bottomClass="bottom-[106px]" />
    </div>
  )
}
