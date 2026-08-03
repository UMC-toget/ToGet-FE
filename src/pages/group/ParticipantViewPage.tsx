import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import { getTogetherGiftDashboard, type MemberSummary } from '../../api/groupFundings'
import { MOCK_DASHBOARD } from './groupMock'
import { ROLE_LABELS } from './groupConstants'

// 접근: 로그인한 모든 역할 | 참여자 더보기 — 조회 전용 (권한 변경 없음)

const BADGE: Record<MemberSummary['role'], { label: string; className: string }> = {
  HOST:    { label: '방장',  className: 'bg-pink-500 text-white' },
  CO_HOST: { label: '부방장', className: 'bg-[#FFE3ED] text-pink-500' },
  MEMBER:  { label: '참여자', className: 'bg-[#C1BCC0] text-white' },
}

export default function ParticipantViewPage() {
  const { id } = useParams<{ id: string }>()
  const [members, setMembers] = useState<MemberSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getTogetherGiftDashboard(id)
      .then(data => setMembers(data.members))
      .catch(() => { if (import.meta.env.DEV) setMembers(MOCK_DASHBOARD.members) })
      .finally(() => setLoading(false))
  }, [id])

  const managers = members.filter(m => m.role === 'HOST' || m.role === 'CO_HOST')
  const regularMembers = members.filter(m => m.role === 'MEMBER')

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="참여자 더보기" />

      <div className="flex-1 overflow-y-auto pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-b2-r text-gray-400">불러오는 중...</span>
          </div>
        ) : (
          <div className="flex flex-col px-[18px] pt-[30px]">
            <div className="flex flex-col gap-2">
              <h2 className="text-h3-sb text-[#000]">참여자 현황</h2>
              <p className="text-caption1-r text-[#7F7779]">현재 함께선물 페이지에 참여한 참여자 목록</p>
            </div>

            <div className="mt-5 flex items-center justify-center gap-12 rounded-xl border border-[#EAE9EA] bg-white px-[14px] py-3">
              <StatItem label="전체" count={members.length} />
              <StatItem label="관리자" count={managers.length} />
              <StatItem label="일반 참여자" count={regularMembers.length} />
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <MemberSection title="관리자" members={managers} />
              <MemberSection title="일반 참여자" members={regularMembers} />
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

function MemberSection({ title, members }: { title: string; members: MemberSummary[] }) {
  if (members.length === 0) return null
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-b1-m text-black">{title}</h3>
      <div className="flex flex-col gap-2">
        {members.map(m => <MemberCard key={m.fundingMemberId} member={m} />)}
      </div>
    </div>
  )
}

function MemberCard({ member }: { member: MemberSummary }) {
  const { role, name, profileImageUrl } = member
  const badge = BADGE[role]

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#EAE9EA] bg-white px-[14px] py-3">
      <div className="flex items-center gap-2">
        <div className="shrink-0">
          {profileImageUrl
            ? <img src={profileImageUrl} alt={name} className="size-10 rounded-full object-cover" />
            : <div className="size-10 rounded-full bg-[#F7F5F8]" />
          }
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-b2-r text-[#797378]">{ROLE_LABELS[role]}</span>
          <span className="text-b2-r text-black">{name}</span>
        </div>
      </div>

      <div className={`flex h-[25px] w-[57px] items-center justify-center rounded text-caption2-m ${badge.className}`}>
        {badge.label}
      </div>
    </div>
  )
}
