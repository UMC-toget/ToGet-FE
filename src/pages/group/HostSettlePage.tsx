import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import DefaultAvatar from '../../components/common/DefaultAvatar'
import ConfirmModal from '../../components/common/ConfirmModal'
import {
  getFundingSettlements,
  updateSettlementStatus,
  type SettlementInfo,
  type SettlementStatus,
} from '../../api/groupFundings'

export default function HostSettlePage() {
  const { id } = useParams<{ id: string }>()

  const [settlements, setSettlements] = useState<SettlementInfo[]>([])
  const [total, setTotal] = useState(0)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [pendingChange, setPendingChange] = useState<{
    member: SettlementInfo
    nextStatus: SettlementStatus
  } | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    getFundingSettlements(id)
      .then(data => {
        setSettlements(data.settlements)
        setTotal(data.totalSettlementAmount)
        setCount(data.settlementParticipantCount)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleToggle = (member: SettlementInfo) => {
    // HOST 가능 전이: PAID→CONFIRMED, CONFIRMED→PAID
    // UNPAID는 참여자 본인만 PAID로 변경 가능 → HOST 액션 없음
    if (member.settlementStatus === 'UNPAID') return
    const nextStatus: SettlementStatus =
      member.settlementStatus === 'CONFIRMED' ? 'PAID' : 'CONFIRMED'
    setPendingChange({ member, nextStatus })
  }

  const confirmChange = async () => {
    if (!id || !pendingChange || updating) return
    setUpdating(true)
    try {
      const result = await updateSettlementStatus(
        id,
        pendingChange.member.fundingMemberId,
        pendingChange.nextStatus,
      )
      setSettlements(prev =>
        prev.map(s =>
          s.fundingMemberId === result.fundingMemberId
            ? { ...s, settlementStatus: result.settlementStatus }
            : s,
        ),
      )
    } catch (e) {
      console.error(e)
    } finally {
      setUpdating(false)
      setPendingChange(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
        <Header title="정산 내역" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-b2-r text-gray-400">불러오는 중...</p>
        </div>
      </div>
    )
  }

  const completedCount = settlements.filter(s => s.settlementStatus === 'CONFIRMED').length
  const amountPerPerson = count > 0 ? Math.ceil(total / count) : 0

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-8">
      <Header title="정산 내역" />

      <div className="flex flex-col gap-5 px-[18px] py-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-h3-sb text-black">정산 현황</h2>
          <p className="text-caption1-r text-gray-500">
            {count}명 중 {completedCount}명 입금 확인 완료
          </p>
        </div>

        {/* 요약 카드 */}
        <div className="flex items-center justify-around rounded-xl border border-gray-100 px-[14px] py-3">
          <SummaryItem label="정산 인원" value={`${count}명`} />
          <div className="h-8 w-px bg-gray-100" />
          <SummaryItem label="총 금액" value={`${total.toLocaleString()}원`} />
          <div className="h-8 w-px bg-gray-100" />
          <SummaryItem label="1인당" value={`${amountPerPerson.toLocaleString()}원`} />
        </div>

        {/* 참여자 목록 */}
        <div className="flex flex-col gap-3">
          <h3 className="text-b1-m text-black">참여자 목록</h3>
          <div className="flex flex-col gap-2">
            {settlements.map(member => (
              <SettlementRow
                key={member.fundingMemberId}
                member={member}
                amountPerPerson={amountPerPerson}
                onToggle={() => handleToggle(member)}
              />
            ))}
          </div>
        </div>
      </div>

      {pendingChange && (
        <ConfirmModal
          open
          title={
            pendingChange.nextStatus === 'CONFIRMED'
              ? '입금을 확인했나요?'
              : '입금 확인을 취소할까요?'
          }
          description={
            pendingChange.nextStatus === 'CONFIRMED'
              ? `${pendingChange.member.name}님의 입금을 확인 완료로 변경해요`
              : `${pendingChange.member.name}님을 입금 대기 상태로 되돌려요`
          }
          confirmText={pendingChange.nextStatus === 'CONFIRMED' ? '확인 완료' : '되돌리기'}
          cancelText="취소"
          onCancel={() => !updating && setPendingChange(null)}
          onConfirm={confirmChange}
        />
      )}
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-caption1-r text-gray-500">{label}</span>
      <span className="text-h3-sb text-black">{value}</span>
    </div>
  )
}

const STATUS_CONFIG = {
  UNPAID: {
    label: '미입금',
    className: 'border border-gray-300 text-gray-400',
    clickable: false,
  },
  PAID: {
    label: '입금 대기',
    className: 'bg-pink-100 text-pink-500',
    clickable: true,
  },
  CONFIRMED: {
    label: '입금 확인',
    className: 'bg-pink-500 text-white',
    clickable: true,
  },
}

function SettlementRow({
  member,
  amountPerPerson,
  onToggle,
}: {
  member: SettlementInfo
  amountPerPerson: number
  onToggle: () => void
}) {
  const config = STATUS_CONFIG[member.settlementStatus]

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 px-[14px] py-3">
      <div className="flex items-center gap-3">
        {member.profileImageUrl ? (
          <img
            src={member.profileImageUrl}
            alt={member.name}
            className="size-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <DefaultAvatar className="size-10 shrink-0" />
        )}
        <div className="flex flex-col gap-0.5">
          <span className="text-b2-m text-black">{member.name}</span>
          <span className="text-caption1-r text-gray-500">
            {(member.amountDue || amountPerPerson).toLocaleString()}원
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={config.clickable ? onToggle : undefined}
        disabled={!config.clickable}
        className={`rounded-lg px-3 py-[6px] text-caption1-m transition-colors ${config.className} disabled:cursor-default`}
      >
        {config.label}
      </button>
    </div>
  )
}
