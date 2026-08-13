import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import StickyBottomBar from '../../components/common/StickyBottomBar'
import Toast from '../../components/common/Toast'
import EmojiPopup from '../../components/common/EmojiPopup'
import PlusIcon from '../../components/icons/PlusIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import { LETTER_COLORS } from '../../components/common/letterPalette'
import {
  getFundingSettlements,
  getTogetherGiftDashboard,
  postSettlementContribution,
  type ConfirmedGift,
} from '../../api/groupFundings'
import { getFundingAccount, type FundingAccount } from '../../api/fundings'
import { BANK_NAME_LABELS } from '../../api/userAccounts'
import { formatAccountNumber } from '../../utils/accountNumber'
import { useMyProfile } from '../../hooks/useMyProfile'
import { MOCK_SETTLEMENTS, MOCK_ACCOUNT, MOCK_DASHBOARD } from './groupMock'
import { readLetterDraft, clearLetterDraft } from './letterDraft'
import { markSelfSettled } from './settlementFlag'
import { copyToClipboard } from '../../utils/clipboard'
import { trackEvent } from '../../lib/analytics'

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
  const [loading, setLoading] = useState(true)
  // 입금 완료 확인/완료 팝업 (편지 없이 바로 입금완료 신고). 편지까지 남기려면 '편지 남기기' 카드로 LetterPage 이동
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [doneOpen, setDoneOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorToastOpen, setErrorToastOpen] = useState(false)

  // 입금 완료 신고(POST /members/me/contributions). '편지 남기기'에서 로컬 저장한 draft가 있으면 함께 보낸다(선택).
  const submitContribution = async () => {
    if (submitting) return
    setSubmitting(true)
    setConfirmOpen(false)
    if (!import.meta.env.DEV && id) {
      try {
        const draft = readLetterDraft(id)
        const backgroundId =
          LETTER_COLORS.find(c => c.id === (draft?.colorId ?? 'white'))?.backgroundId ?? 1
        await postSettlementContribution(id, {
          backgroundId,
          content: draft?.content ?? '',
          isPrivate: draft?.isPrivate ?? false,
        })
      } catch (e) {
        // 이미 입금 완료(409)는 결과적으로 PAID라 성공 취급. 그 외 실패는 편지 draft를 유지하고
        // 완료 처리 없이 중단해, 사용자가 편지 유실 없이 재시도할 수 있게 한다.
        const status = (e as { response?: { status?: number } }).response?.status
        if (status !== 409) {
          console.error('입금 완료 신고 실패', e)
          setSubmitting(false)
          setErrorToastOpen(true)
          setTimeout(() => setErrorToastOpen(false), 2000)
          return
        }
      }
    }
    clearLetterDraft(id)
    // 정산 완료 표시 — 개설자 SETTLING 하단 버튼을 '금액 모으기 마감하기'로 전환하는 데 쓰인다
    markSelfSettled(id)
    trackEvent('funding_participate_complete', { funding_type: 'together' })
    setSubmitting(false)
    setDoneOpen(true)
  }

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
  const formattedAccountNumber = account ? formatAccountNumber(account.account, account.bankName) : ''
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
                    <InfoRow label="계좌번호" value={formattedAccountNumber} />
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

        {/* 편지 남기기 — 카드 탭 시 LetterPage로 이동해 편지 작성(+입금완료 신고) */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <h2 className="text-h3-sb text-black">편지 남기기</h2>
            <p className="text-caption1-r text-gray-600">
              편지를 남기면 {recipientName || '받는 분'}님에게 함께 전달해요
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/group/${id}/letter`, { state: { recipientName } })}
            className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white px-[14px] py-3"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-background">
              <PlusIcon className="size-5 text-black" />
            </span>
            <span className="flex-1 text-left text-b2-m text-black">편지 남기기</span>
            <ChevronRightIcon className="size-6 shrink-0 text-black" />
          </button>
        </section>
      </div>

      {/* 하단 고정 CTA — 편지 없이 바로 입금완료. 편지까지 남기려면 위 '편지 남기기' 카드로 진입 */}
      <StickyBottomBar>
        <Button
          className="pointer-events-auto"
          disabled={submitting}
          onClick={() => setConfirmOpen(true)}
        >
          입금 완료
        </Button>
      </StickyBottomBar>

      <Toast open={toastOpen} message="계좌번호 복사되었습니다" bottomClass="bottom-[102px]" />
      <Toast open={errorToastOpen} message="입금 완료 신고에 실패했어요. 잠시 후 다시 시도해주세요" bottomClass="bottom-[102px]" />

      {/* 입금 완료 확인 — 제출 시 PAID로 확정되고 변경 불가 */}
      <EmojiPopup
        open={confirmOpen}
        title="입금을 완료하셨나요?"
        description="완료하기 버튼을 누르면, 변경이 불가해요."
        buttons={[
          { label: '변경하기', variant: 'secondary', onClick: () => setConfirmOpen(false) },
          { label: '완료하기', variant: 'primary', onClick: submitContribution },
        ]}
        onDimClick={() => setConfirmOpen(false)}
      />

      {/* 입금 완료 완료 — 체크 아이콘 + 함께 선물 페이지로 */}
      <EmojiPopup
        open={doneOpen}
        icon="success"
        title="입금 완료되었습니다"
        buttons={[{ label: '홈으로 돌아가기', variant: 'primary', onClick: () => navigate(`/group/${id}`) }]}
      />
    </div>
  )
}
