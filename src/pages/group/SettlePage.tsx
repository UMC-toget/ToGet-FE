import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import StickyBottomBar from '../../components/common/StickyBottomBar'
import Toast from '../../components/common/Toast'
import {
  getFundingSettlements,
  getTogetherGiftDashboard,
  type ConfirmedGift,
} from '../../api/groupFundings'
import { getFundingAccount, type FundingAccount } from '../../api/fundings'
import { BANK_NAME_LABELS } from '../../api/userAccounts'
import { useMyProfile } from '../../hooks/useMyProfile'
import { MOCK_SETTLEMENTS, MOCK_ACCOUNT, MOCK_DASHBOARD } from './groupMock'
import { copyToClipboard } from '../../utils/clipboard'
import EmojiPopup from '../../components/common/EmojiPopup'

// 접근: 로그인한 모든 역할 | 정산하기 — 계좌 조회 및 입금 확인 요청 (참여자 뷰)
interface InfoRowProps {
  label: string
  value: string
  valueClassName?: string
}

function InfoRow({ label, value, valueClassName = 'text-gray-700' }: InfoRowProps) {
  return (
    // 위아래 대칭 패딩(py)으로 글자를 칸 세로 중앙에 배치. 구분선은 컨테이너의 divide-y가 담당
    <div className="flex items-center justify-between py-4">
      <span className="font-semibold text-b2-m text-gray-500">{label}</span>
      <span className={`font-semibold text-b2-m ${valueClassName}`}>{value}</span>
    </div>
  )
}

export default function SettlePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: profile } = useMyProfile()

  const [account, setAccount] = useState<FundingAccount | null>(null)
  const [giftItems, setGiftItems] = useState<ConfirmedGift[]>([])
  const [recipientName, setRecipientName] = useState('')
  const [totalAmount, setTotalAmount] = useState(0)
  const [participantCount, setParticipantCount] = useState(0)
  const [myShare, setMyShare] = useState(0)
  const [toastOpen, setToastOpen] = useState(false)
  const [depositConfirmOpen, setDepositConfirmOpen] = useState(false)
  const [depositDoneOpen, setDepositDoneOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.allSettled([
      getFundingAccount(id),
      getFundingSettlements(id),
      getTogetherGiftDashboard(id),
    ]).then(([accountRes, settlementRes, dashboardRes]) => {
      if (accountRes.status === 'fulfilled') setAccount(accountRes.value)
      else if (import.meta.env.DEV) setAccount(MOCK_ACCOUNT)
      if (dashboardRes.status === 'fulfilled') {
        const d = dashboardRes.value
        setRecipientName(d.recipientName)
        setGiftItems(d.confirmedGifts ?? [])
      } else if (import.meta.env.DEV) {
        setRecipientName(MOCK_DASHBOARD.recipientName)
        setGiftItems(MOCK_DASHBOARD.confirmedGifts ?? [])
      }
      if (settlementRes.status === 'fulfilled') {
        const s = settlementRes.value
        setTotalAmount(s.totalSettlementAmount)
        setParticipantCount(s.settlementParticipantCount)
        const myEntry = profile
          ? s.settlements.find(entry => entry.userId === profile.userId)
          : undefined
        setMyShare(
          myEntry?.amountDue ??
            Math.ceil(s.totalSettlementAmount / (s.settlementParticipantCount || 1)),
        )
      } else if (import.meta.env.DEV) {
        setTotalAmount(MOCK_SETTLEMENTS.totalSettlementAmount)
        setParticipantCount(MOCK_SETTLEMENTS.settlementParticipantCount)
        setMyShare(Math.ceil(MOCK_SETTLEMENTS.totalSettlementAmount / (MOCK_SETTLEMENTS.settlementParticipantCount || 1)))
      }
    }).finally(() => setLoading(false))
  }, [id, profile])

  const accountNumber = account?.account ?? ''
  const bankLabel = account ? (BANK_NAME_LABELS[account.bankName] ?? account.bankName) : ''
  const accountOwner = account?.accountOwner ?? ''

  const copyAccount = async () => {
    if (!accountNumber) return
    await copyToClipboard(accountNumber)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2000)
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
        <Header title="정산 확인" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-b2-r text-gray-400">불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-[140px]">
      <Header title="정산 확인" />

      <div className="flex flex-col gap-6 px-[18px] py-5">

        {/* ── 정산 금액 확인 ── */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-h3-sb text-black">정산 금액을 확인해요</h2>
            <p className="text-caption1-r text-gray-600">최종 선물 금액을 참여자 수로 나눠요</p>
          </div>

          {giftItems.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-b1-m text-black">최종 선물 목록</p>
              <div className="flex flex-col gap-2">
                {giftItems.map(item => (
                  <div
                    key={item.fundingGiftId}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 px-[14px] py-3"
                  >
                    {item.giftImageUrl ? (
                      <img
                        src={item.giftImageUrl}
                        alt={item.giftName}
                        className="size-12 shrink-0 rounded-[6px] object-cover"
                      />
                    ) : (
                      <div className="size-12 shrink-0 rounded-[6px] bg-background" />
                    )}
                    <div className="flex flex-1 items-center justify-between">
                      <span className="text-b2-m text-black">{item.giftName}</span>
                      <span className="text-b2-m text-black">{item.giftPrice.toLocaleString()}원</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalAmount > 0 && (
            <div className="flex flex-col gap-4">
              <p className="text-b1-m text-black">정산 금액</p>
              <div className="rounded-xl border border-[#D5D2D5] px-4">
                <div className="flex flex-col divide-y divide-gray-200">
                  <InfoRow label="총 금액" value={`${totalAmount.toLocaleString()}원`} />
                  <InfoRow label="정산 인원" value={`${participantCount}명`} />
                  <InfoRow
                    label="내 입금 금액"
                    value={`${myShare.toLocaleString()}원`}
                    valueClassName="text-pink-500"
                  />
                </div>
              </div>
            </div>
          )}

          {account && (
            <div className="flex flex-col gap-3">
              <p className="text-b1-m text-black">입금계좌</p>
              <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-[#D5D2D5] px-4">
                  <div className="flex flex-col divide-y divide-gray-200">
                    <InfoRow label="은행" value={bankLabel} />
                    <InfoRow label="계좌번호" value={accountNumber} />
                    <InfoRow label="예금주" value={accountOwner} />
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
          )}
        </section>

        {recipientName && (
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <h2 className="text-h3-sb text-black">편지 남기기</h2>
              <p className="text-caption1-r text-gray-600">
                편지를 남기면 {recipientName}님에게 함께 전달해요
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/group/${id}/letter`, { state: { recipientName } })}
              className="flex items-center gap-3 rounded-xl border border-gray-100 px-[14px] py-3"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-[6px] bg-background">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M12 4.94531V12.0041M3 12.0041H12M12 12.0041V19.063M12 12.0041H21" stroke="#1E1D1E" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-b2-m text-black">편지 남기기</span>
            </button>
          </section>
        )}
      </div>

      {/* 하단 고정 CTA */}
      <StickyBottomBar>
        <Button
          className="pointer-events-auto"
          onClick={() => setDepositConfirmOpen(true)}
        >
          입금 완료
        </Button>
      </StickyBottomBar>

      <Toast open={toastOpen} message="계좌번호 복사되었습니다" variant="pink" bottomClass="bottom-[102px]" />

      {/* 입금 완료 확인 — 완료하기(좌·회색)/변경하기(우·검정), 배경 탭은 닫힘(변경, 안전) */}
      <EmojiPopup
        open={depositConfirmOpen}
        title="입금을 완료하셨나요?"
        description="완료하기 버튼을 누르면, 변경이 불가해요."
        buttons={[
          {
            label: '완료하기',
            variant: 'secondary',
            onClick: () => {
              setDepositConfirmOpen(false)
              setDepositDoneOpen(true)
            },
          },
          { label: '변경하기', variant: 'primary', onClick: () => setDepositConfirmOpen(false) },
        ]}
        onDimClick={() => setDepositConfirmOpen(false)}
      />

      {/* 입금 완료 완료 — 체크 아이콘 + 홈으로 돌아가기 */}
      <EmojiPopup
        open={depositDoneOpen}
        icon="success"
        title="입금 완료되었습니다"
        buttons={[{ label: '홈으로 돌아가기', variant: 'primary', onClick: () => navigate('/home') }]}
      />
    </div>
  )
}
