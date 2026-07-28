import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import DefaultAvatar from '../../components/common/DefaultAvatar'
import { getTogetherGiftDashboard, type MemberSummary } from '../../api/groupFundings'

const BADGE: Record<MemberSummary['role'], { label: string; className: string }> = {
  HOST: { label: '방장', className: 'bg-pink-500 text-white' },
  CO_HOST: { label: '부방장', className: 'bg-pink-100 text-pink-500' },
  MEMBER: { label: '참여자', className: 'bg-[#C1BCC0] text-white' },
}

const ROLE_LABEL: Record<MemberSummary['role'], string> = {
  HOST: '개설자',
  CO_HOST: '부방장',
  MEMBER: '참여자',
}

export default function ParticipantsPage() {
  const { id } = useParams<{ id: string }>()
  const [members, setMembers] = useState<MemberSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getTogetherGiftDashboard(id)
      .then(data => setMembers(data.members))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const managers = members.filter(m => m.role === 'HOST' || m.role === 'CO_HOST')
  const regularMembers = members.filter(m => m.role === 'MEMBER')

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-8">
      <Header title="참여자 더보기" />

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-b2-r text-gray-400">불러오는 중...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-[18px] py-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-h3-sb text-black">참여자 현황</h2>
            <p className="text-caption1-r text-gray-500">현재 함께선물 페이지에 참여한 참여자 목록</p>
          </div>

          <div className="flex items-center justify-around rounded-xl border border-gray-100 px-[14px] py-3">
            <StatItem label="전체" count={members.length} />
            <StatItem label="관리자" count={managers.length} />
            <StatItem label="일반 참여자" count={regularMembers.length} />
          </div>

          <div className="flex flex-col gap-5">
            <MemberSection title="관리자" members={managers} />
            <MemberSection title="일반 참여자" members={regularMembers} />
          </div>
        </div>
      )}
    </div>
  )
}

function StatItem({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-caption1-r text-gray-700">{label}</span>
      <span className="text-h3-m text-black">{count}명</span>
    </div>
  )
}

function MemberSection({ title, members }: { title: string; members: MemberSummary[] }) {
  if (members.length === 0) return null
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-b1-m text-black">{title}</h3>
      <div className="flex flex-col gap-2">
        {members.map(m => (
          <MemberCard key={m.fundingMemberId} member={m} />
        ))}
      </div>
    </div>
  )
}

function MemberCard({ member }: { member: MemberSummary }) {
  const { role, name, profileImageUrl } = member
  const badge = BADGE[role]

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 px-[14px] py-3">
      <div className="flex items-center gap-2">
        {profileImageUrl ? (
          <img src={profileImageUrl} alt={name} className="size-10 shrink-0 rounded-full object-cover" />
        ) : (
          <DefaultAvatar className="size-10 shrink-0" />
        )}
        <div className="flex flex-col gap-1">
          <span className="text-caption1-r text-gray-600">{ROLE_LABEL[role]}</span>
          <span className="text-b2-r text-black">{name}</span>
        </div>
      </div>
      <span className={`rounded px-[10px] py-[5px] text-caption2-m ${badge.className}`}>
        {badge.label}
      </span>
    </div>
  )
}
