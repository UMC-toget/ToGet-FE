import { useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import DefaultAvatar from '../../components/common/DefaultAvatar'
import { MOCK_GROUP } from './groupMock'
import type { GroupParticipant, ParticipantRole } from '../../types/group'

const BADGE: Record<ParticipantRole, { label: string; className: string }> = {
  HOST: { label: '방장', className: 'bg-pink-500 text-white' },
  CO_HOST: { label: '부방장', className: 'bg-pink-100 text-pink-500' },
  MEMBER: { label: '참여자', className: 'bg-[#C1BCC0] text-white' },
}

export default function ParticipantsPage() {
  useParams()
  const group = MOCK_GROUP

  const managers = group.participants.filter(p => p.role === 'HOST' || p.role === 'CO_HOST')
  const members = group.participants.filter(p => p.role === 'MEMBER')

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-8">
      <Header title="참여자 더보기" />

      <div className="flex flex-col gap-5 px-[18px] py-5">
        {/* 참여자 현황 타이틀 */}
        <div className="flex flex-col gap-2">
          <h2 className="text-h3-sb text-black">참여자 현황</h2>
          <p className="text-caption1-r text-gray-500">현재 함께선물 페이지에 참여한 참여자 목록</p>
        </div>

        {/* 통계 카드 */}
        <div className="flex items-center justify-around rounded-xl border border-gray-100 px-[14px] py-3">
          <StatItem label="전체" count={group.totalParticipantCount} />
          <StatItem label="관리자" count={managers.length} />
          <StatItem label="일반 참여자" count={group.totalParticipantCount - managers.length} />
        </div>

        {/* 참여자 목록 */}
        <div className="flex flex-col gap-5">
          <ParticipantSection title="관리자" participants={managers} />
          <ParticipantSection title="일반 참여자" participants={members} />
        </div>
      </div>
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

function ParticipantSection({ title, participants }: { title: string; participants: GroupParticipant[] }) {
  if (participants.length === 0) return null
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-b1-m text-black">{title}</h3>
      <div className="flex flex-col gap-2">
        {participants.map(p => (
          <ParticipantCard key={p.id} participant={p} />
        ))}
      </div>
    </div>
  )
}

function ParticipantCard({ participant }: { participant: GroupParticipant }) {
  const { role, isMe, name } = participant
  const badge = BADGE[role]
  const roleLabel = role === 'HOST'
    ? isMe ? '개설자(나)' : '개설자'
    : isMe ? '참여자(나)' : '참여자'

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 px-[14px] py-3">
      <div className="flex items-center gap-2">
        <DefaultAvatar className="size-10 shrink-0" />
        <div className="flex flex-col gap-1">
          <span className="text-caption1-r text-gray-600">{roleLabel}</span>
          <span className="text-b2-r text-black">{name}</span>
        </div>
      </div>
      <span className={`rounded px-[10px] py-[5px] text-caption2-m ${badge.className}`}>
        {badge.label}
      </span>
    </div>
  )
}
