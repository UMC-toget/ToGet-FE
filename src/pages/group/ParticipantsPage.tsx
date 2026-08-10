import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import DefaultAvatar from '../../components/common/DefaultAvatar'
import { getTogetherGiftDashboard, updateMemberRole, type MemberSummary } from '../../api/groupFundings'
import { MOCK_DASHBOARD } from './groupMock'
import GroupSegmentTabs from './GroupSegmentTabs'
import { ROLE_LABELS } from './groupConstants'
import { useMyProfile } from '../../hooks/useMyProfile'

// 접근: 로그인한 모든 역할 (역할 변경·권한 부여는 개설자·공동관리자) | 참여자 더보기
const BADGE: Record<MemberSummary['role'], { label: string; className: string }> = {
  CREATOR: { label: '방장', className: 'bg-pink-500 text-white' },
  ADMIN: { label: '부방장', className: 'bg-[#FFE3ED] text-pink-500' },
  PARTICIPANT: { label: '참여자', className: 'bg-[#C1BCC0] text-white' },
}


export default function ParticipantsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: profile } = useMyProfile()
  const [members, setMembers] = useState<MemberSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return
    getTogetherGiftDashboard(id)
      .then(data => setMembers(data.members))
      .catch(() => { if (import.meta.env.DEV) setMembers(MOCK_DASHBOARD.members) })
      .finally(() => setLoading(false))
  }, [id])

  const handleRoleChange = async (memberId: number, newRole: 'ADMIN' | 'PARTICIPANT') => {
    setOpenMenuId(null)
    setMembers(prev => prev.map(m => m.fundingMemberId === memberId ? { ...m, role: newRole } : m))
    try {
      await updateMemberRole(id!, memberId, newRole)
    } catch {
      getTogetherGiftDashboard(id!).then(data => setMembers(data.members)).catch(() => {})
    }
  }

  const managers = members.filter(m => m.role === 'CREATOR' || m.role === 'ADMIN')
  const regularMembers = members.filter(m => m.role === 'PARTICIPANT')

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="함께 선물 페이지" />

      {/* 세그먼트 탭 */}
      <GroupSegmentTabs
        tabs={[
          { label: '함께 선물 페이지', active: false, onClick: () => navigate(`/group/${id}`) },
          { label: '참여자 관리', active: true },
        ]}
      />

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-b2-r text-gray-400">불러오는 중...</span>
          </div>
        ) : (
          <div className="flex flex-col px-[18px]">
            {/* 제목 + 캡션 */}
            <div className="flex flex-col gap-2">
              <h2 className="text-h3-sb text-[#000]">참여자 관리하기</h2>
              <p className="text-caption1-r text-[#7F7779]">참여자를 확인하고 권한을 부여하여 함께 페이지를 관리해요.</p>
            </div>

            {/* 통계 박스 */}
            <div className="mt-5 flex items-center justify-center gap-12 rounded-xl border border-[#EAE9EA] bg-white px-[14px] py-3">
              <StatItem label="전체" count={members.length} />
              <StatItem label="관리자" count={managers.length} />
              <StatItem label="일반 참여자" count={regularMembers.length} />
            </div>

            {/* 안내 문구 */}
            <p className="mt-2 text-caption2-r text-[#7F7779]">
              전체 참여자는 최대 50명, 공동 관리자는 최대 10명까지 초대할 수 있어요
            </p>

            {/* 참여자 목록 */}
            <div className="mt-5 flex flex-col gap-4">
              <MemberSection
                title="관리자"
                members={managers}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onRoleChange={handleRoleChange}
                myUserId={profile?.userId}
                myNickname={profile?.nickname}
                myName={profile?.name}
                myProfileImageUrl={profile?.profileImageUrl}
              />
              <MemberSection
                title="일반 참여자"
                members={regularMembers}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onRoleChange={handleRoleChange}
                myUserId={profile?.userId}
                myNickname={profile?.nickname}
                myName={profile?.name}
                myProfileImageUrl={profile?.profileImageUrl}
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

interface MemberSectionProps {
  title: string
  members: MemberSummary[]
  openMenuId: number | null
  setOpenMenuId: (id: number | null) => void
  onRoleChange: (memberId: number, role: 'ADMIN' | 'PARTICIPANT') => void
  myUserId?: number
  myNickname?: string
  myName?: string
  myProfileImageUrl?: string | null
}

function MemberSection({ title, members, openMenuId, setOpenMenuId, onRoleChange, myUserId, myNickname, myName, myProfileImageUrl }: MemberSectionProps) {
  if (members.length === 0) return null
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-b1-m text-black">{title}</h3>
      <div className="flex flex-col gap-2">
        {members.map(m => (
          <MemberCard
            key={m.fundingMemberId}
            member={m}
            menuOpen={openMenuId === m.fundingMemberId}
            onToggleMenu={() => setOpenMenuId(openMenuId === m.fundingMemberId ? null : m.fundingMemberId)}
            onCloseMenu={() => setOpenMenuId(null)}
            onRoleChange={onRoleChange}
            myUserId={myUserId}
            myNickname={myNickname}
            myName={myName}
            myProfileImageUrl={myProfileImageUrl}
          />
        ))}
      </div>
    </div>
  )
}

interface MemberCardProps {
  member: MemberSummary
  menuOpen: boolean
  onToggleMenu: () => void
  onCloseMenu: () => void
  onRoleChange: (memberId: number, role: 'ADMIN' | 'PARTICIPANT') => void
  myUserId?: number
  myNickname?: string
  myName?: string
  myProfileImageUrl?: string | null
}

function MemberCard({ member, menuOpen, onToggleMenu, onCloseMenu, onRoleChange, myUserId, myNickname, myName, myProfileImageUrl }: MemberCardProps) {
  const { role, name, userId, profileImageUrl, fundingMemberId } = member
  const displayName = name || (userId === myUserId ? myNickname : '') || ''
  const isMe = (myUserId != null && String(userId) === String(myUserId)) ||
    (Boolean(myNickname) && name === myNickname) ||
    (Boolean(myName) && name === myName)
  const displayProfileImageUrl = isMe ? (myProfileImageUrl ?? profileImageUrl) : profileImageUrl
  const badge = BADGE[role]
  const canChangeRole = role === 'ADMIN' || role === 'PARTICIPANT'
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCloseMenu()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen, onCloseMenu])

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#EAE9EA] bg-white px-[14px] py-3">
      <div className="flex items-center gap-2">
        <div className="shrink-0">
          {displayProfileImageUrl ? (
            <img src={displayProfileImageUrl} alt={displayName} className="size-10 rounded-full object-cover" />
          ) : (
            <DefaultAvatar className="size-10 shrink-0" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-b2-r text-[#797378]">{ROLE_LABELS[role]}</span>
          <span className="text-b2-r text-black">{displayName}</span>
        </div>
      </div>

      {/* 뱃지 + 드롭다운 */}
      <div ref={menuRef} className="relative">
        <button
          type="button"
          disabled={!canChangeRole}
          onClick={onToggleMenu}
          className={`flex h-[25px] w-[57px] items-center justify-center rounded text-caption2-m ${badge.className}`}
        >
          {badge.label}
        </button>

        {menuOpen && canChangeRole && (
          <div
            className="absolute right-0 z-50 flex w-[100px] flex-col rounded-lg bg-white py-1 shadow-[0_0_10px_0_rgba(0,0,0,0.20)]"
            style={{ top: '8.5px' }}
          >
            <button
              type="button"
              className="w-full pl-[9px] pr-2 py-1 text-left text-caption2-r text-black"
              onClick={() => onRoleChange(fundingMemberId, 'PARTICIPANT')}
            >
              참여자
            </button>
            <div className="mx-[9px] h-px bg-[#EAE9EA]" />
            <button
              type="button"
              className="w-full pl-[9px] pr-2 py-1 text-left text-caption2-r text-black"
              onClick={() => onRoleChange(fundingMemberId, 'ADMIN')}
            >
              부방장
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
