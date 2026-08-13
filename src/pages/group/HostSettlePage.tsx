import { Fragment, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import DefaultAvatar from '../../components/common/DefaultAvatar'
import GroupSegmentTabs from './GroupSegmentTabs'
import {
  getFundingSettlements,
  updateSettlementStatus,
  type SettlementInfo,
  type SettlementStatus,
} from '../../api/groupFundings'
import { MOCK_SETTLEMENTS } from './groupMock'

// 접근: 개설자 전용 | 정산내역 확인 — 참여자 입금 상태(PAID·UNPAID) 관리

const STATUS_CONFIG: Record<SettlementStatus, { label: string; badgeClass: string; clickable: boolean }> = {
  UNPAID:    { label: '미 입금',  badgeClass: 'bg-[#C1BCC0] text-white', clickable: false },
  PAID:      { label: '입금완료', badgeClass: 'bg-gray-900 text-white',   clickable: true  },
  CONFIRMED: { label: '확인완료', badgeClass: 'bg-pink-500 text-white',   clickable: false },
}

function getNextActions(status: SettlementStatus): { label: string; to: SettlementStatus }[] {
  if (status === 'PAID') return [{ label: '확인완료', to: 'CONFIRMED' }, { label: '미입금', to: 'UNPAID' }]
  return []
}

export default function HostSettlePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [settlements, setSettlements] = useState<SettlementInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return
    getFundingSettlements(id)
      .then(data => setSettlements(data.settlements))
      .catch(() => { if (import.meta.env.DEV) setSettlements(MOCK_SETTLEMENTS.settlements) })
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (memberId: number, nextStatus: SettlementStatus) => {
    setOpenMenuId(null)
    setSettlements(prev =>
      prev.map(s => s.fundingMemberId === memberId ? { ...s, settlementStatus: nextStatus } : s),
    )
    try {
      await updateSettlementStatus(id!, memberId, nextStatus)
    } catch {
      getFundingSettlements(id!).then(data => setSettlements(data.settlements)).catch(() => {})
    }
  }

  const confirmed = settlements.filter(s => s.settlementStatus === 'CONFIRMED')
  const paid      = settlements.filter(s => s.settlementStatus === 'PAID')
  const unpaid    = settlements.filter(s => s.settlementStatus === 'UNPAID')
  const paidAll   = [...confirmed, ...paid]

  const paidCount   = confirmed.length + paid.length
  const unpaidCount = unpaid.length

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="함께선물 페이지" />

      <GroupSegmentTabs
        tabs={[
          { label: '함께 선물 페이지', active: false, onClick: () => navigate(`/group/${id}`) },
          { label: '정산 내역', active: true },
        ]}
      />

      <div className="flex-1 overflow-y-auto pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-b2-r text-gray-400">불러오는 중...</span>
          </div>
        ) : (
          <div className="flex flex-col px-[18px]">
            {/* 제목 + 캡션 */}
            <div className="flex flex-col gap-3">
              <h2 className="text-h3-sb text-black">정산인원 확정하기</h2>
              <p className="text-caption1-r text-[#7F7779]">참여자별 입금 상태를 확인해요</p>
            </div>

            {/* 통계 박스 */}
            <div className="mt-5 flex items-center justify-center gap-12 rounded-xl border border-[#EAE9EA] bg-white px-[14px] py-3">
              <StatItem label="전체"    count={settlements.length} />
              <StatItem label="입금완료" count={paidCount} />
              <StatItem label="미 입금"  count={unpaidCount} />
            </div>

            {/* 참여자 목록 */}
            <div className="mt-5 flex flex-col gap-4">
              <SettlementSection
                title="입금 완료"
                members={paidAll}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onAction={handleStatusChange}
              />
              <SettlementSection
                title="미 입금"
                members={unpaid}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onAction={handleStatusChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatItem({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-caption1-r text-[#797378]">{label}</span>
      <span className="text-[18px] font-medium text-black">{count}명</span>
    </div>
  )
}

interface SettlementSectionProps {
  title: string
  members: SettlementInfo[]
  openMenuId: number | null
  setOpenMenuId: (id: number | null) => void
  onAction: (memberId: number, nextStatus: SettlementStatus) => void
}

function SettlementSection({ title, members, openMenuId, setOpenMenuId, onAction }: SettlementSectionProps) {
  if (members.length === 0) return null
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-b1-m text-black">{title}</h3>
      <div className="flex flex-col gap-2">
        {members.map(m => (
          <SettlementCard
            key={m.fundingMemberId}
            member={m}
            menuOpen={openMenuId === m.fundingMemberId}
            onToggleMenu={() => setOpenMenuId(openMenuId === m.fundingMemberId ? null : m.fundingMemberId)}
            onCloseMenu={() => setOpenMenuId(null)}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  )
}

interface SettlementCardProps {
  member: SettlementInfo
  menuOpen: boolean
  onToggleMenu: () => void
  onCloseMenu: () => void
  onAction: (memberId: number, nextStatus: SettlementStatus) => void
}

function SettlementCard({ member, menuOpen, onToggleMenu, onCloseMenu, onAction }: SettlementCardProps) {
  const config  = STATUS_CONFIG[member.settlementStatus]
  const actions = getNextActions(member.settlementStatus)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onCloseMenu()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen, onCloseMenu])

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#EAE9EA] bg-white px-[14px] py-3">
      <div className="flex items-center gap-2">
        <div className="shrink-0">
          {member.profileImageUrl
            ? <img src={member.profileImageUrl} alt={member.name} className="size-10 rounded-full object-cover" />
            : <DefaultAvatar className="size-10 shrink-0" />
          }
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-b2-r text-[#797378]">참여자</span>
          <span className="text-b2-r text-black">{member.name}</span>
        </div>
      </div>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          disabled={!config.clickable}
          onClick={onToggleMenu}
          className={`flex h-[25px] w-[57px] items-center justify-center rounded text-caption2-m ${config.badgeClass}`}
        >
          {config.label}
        </button>

        {menuOpen && actions.length > 0 && (
          <div
            className="absolute right-0 z-50 flex w-[100px] flex-col rounded-lg bg-white py-1 shadow-[0_0_10px_0_rgba(0,0,0,0.20)]"
            style={{ top: '28.5px' }}
          >
            {actions.map((action, i) => (
              <Fragment key={action.to}>
                {i > 0 && <div className="mx-[9px] h-px bg-[#EAE9EA]" />}
                <button
                  type="button"
                  className={`w-full pl-[9px] pr-2 py-1 text-left text-caption2-r ${action.to === 'UNPAID' ? 'text-[#FF3448]' : 'text-black'}`}
                  onClick={() => { onCloseMenu(); onAction(member.fundingMemberId, action.to) }}
                >
                  {action.label}
                </button>
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
