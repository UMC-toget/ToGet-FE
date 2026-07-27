import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import Toast from '../../components/common/Toast'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import { MOCK_GROUP, MOCK_SETTLEMENT } from './groupMock'

interface InfoRowProps {
  label: string
  value: string
  valueClassName?: string
  borderBottom?: boolean
}

function InfoRow({ label, value, valueClassName = 'text-gray-700', borderBottom = true }: InfoRowProps) {
  return (
    <div
      className={`flex items-center justify-between ${borderBottom ? 'border-b border-gray-200 pb-2' : ''}`}
    >
      <span className="font-semibold text-b2-m text-gray-500">{label}</span>
      <span className={`font-semibold text-b2-m ${valueClassName}`}>{value}</span>
    </div>
  )
}

export default function SettlePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const group = MOCK_GROUP
  const settlement = MOCK_SETTLEMENT

  const [toastOpen, setToastOpen] = useState(false)

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(settlement.accountNumber)
    } catch {
      const el = document.createElement('textarea')
      el.value = settlement.accountNumber
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2000)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-[140px]">
      <Header title="정산 확인" />

      <div className="flex flex-col gap-6 px-[18px] py-5">

        {/* ── 정산 금액 확인 ── */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-h3-sb text-black">정산 금액을 확인해요</h2>
            <p className="text-caption1-r text-gray-600">최종 선물 금액을 참여자 수로 나눠요</p>
          </div>

          {/* 최종 선물 목록 */}
          <div className="flex flex-col gap-3">
            <p className="text-b1-m text-black">최종 선물 목록</p>
            <div className="flex flex-col gap-2">
              {settlement.giftItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 px-[14px] py-3"
                >
                  <div className="size-12 shrink-0 rounded-[6px] bg-background" />
                  <div className="flex flex-1 items-center justify-between">
                    <span className="text-b2-m text-black">{item.name}</span>
                    <span className="text-b2-m text-black">{item.price.toLocaleString()}원</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 정산 금액 */}
          <div className="flex flex-col gap-3">
            <p className="text-b1-m text-black">정산 금액</p>
            <div className="rounded-xl border border-[#D5D2D5] px-4 py-3">
              <div className="flex flex-col gap-3">
                <InfoRow
                  label="총 금액"
                  value={`${settlement.totalAmount.toLocaleString()}원`}
                />
                <InfoRow
                  label="정산 인원"
                  value={`${settlement.participantCount}명`}
                />
                <InfoRow
                  label="내 입금 금액"
                  value={`${settlement.myShare.toLocaleString()}원`}
                  valueClassName="text-pink-500"
                  borderBottom={false}
                />
              </div>
            </div>
          </div>

          {/* 입금계좌 */}
          <div className="flex flex-col gap-3">
            <p className="text-b1-m text-black">입금계좌</p>
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-[#D5D2D5] px-4 py-3">
                <div className="flex flex-col gap-3">
                  <InfoRow label="은행" value={settlement.bankName} />
                  <InfoRow label="계좌번호" value={settlement.accountNumber} />
                  <InfoRow
                    label="예금주"
                    value={settlement.accountHolder}
                    borderBottom={false}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={copyAccount}
                className="flex h-[50px] w-full items-center justify-center rounded-lg bg-gray-700 text-b1-m text-white"
              >
                계좌번호 복사
              </button>
            </div>
          </div>
        </section>

        {/* ── 편지 남기기 ── */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-h3-sb text-black">편지 남기기</h2>
            <p className="text-caption1-r text-gray-600">
              편지를 남기면 {group.recipientName}님에게 함께 전달해요
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/group/${id}/letter`)}
            className="flex items-center justify-between rounded-xl border border-gray-100 px-[14px] py-3"
          >
            <span className="text-b2-m text-black">편지 남기기</span>
            <ChevronRightIcon className="size-5 text-gray-600" />
          </button>
        </section>
      </div>

      {/* 하단 고정 CTA */}
      <div className="pointer-events-none fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-gradient-to-b from-white/0 to-white/80 px-[18px] pb-[34px] pt-10">
        <Button
          className="pointer-events-auto"
          onClick={() => navigate(`/group/${id}`)}
        >
          입금 완료
        </Button>
      </div>

      <Toast open={toastOpen} message="계좌번호가 복사되었어요" />
    </div>
  )
}
