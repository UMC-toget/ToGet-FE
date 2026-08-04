import { useState } from 'react'
import type { MemberWithStatus } from './ConfirmPage'

// ConfirmPage 서브 컴포넌트 (개설자 전용) | 2단계 정산인원 확정하기 — 포함·제외 토글
function PlainAvatar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="20" fill="#F7F5F8" />
    </svg>
  )
}

interface Props {
  members: MemberWithStatus[]
  onToggle: (memberId: number) => void
}

function getRoleLabel(role: string) {
  if (role === 'HOST') return '방장'
  if (role === 'CO_HOST') return '공동관리자'
  return '참여자'
}

export default function ConfirmStep2({ members, onToggle }: Props) {
  const includedCount = members.filter(m => m.included).length
  const totalCount = members.length
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  const handleMenuSelect = (memberId: number, setIncluded: boolean) => {
    const member = members.find(m => m.fundingMemberId === memberId)
    if (member && member.included !== setIncluded) {
      onToggle(memberId)
    }
    setOpenMenuId(null)
  }

  return (
    <div className="flex flex-col gap-5 px-[18px] pb-4">
      {openMenuId !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
      )}

      <h2 className="text-h3-sb text-black">2. 정산인원 확정하기</h2>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-b1-m text-black">정산 인원</p>
          <p className="text-caption1-r text-[#7F7779]">
            참여자 {totalCount}명 중 {includedCount}명 포함
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {members.map(member => (
            <div
              key={member.fundingMemberId}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-[14px] py-3"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {member.profileImageUrl ? (
                  <img
                    src={member.profileImageUrl}
                    alt={member.name}
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <PlainAvatar className="size-10 shrink-0" />
                )}
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-b2-r text-[#797378]">
                    {getRoleLabel(member.role)}
                  </span>
                  <span className="truncate text-b2-r text-black">{member.name}</span>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenuId(
                      openMenuId === member.fundingMemberId ? null : member.fundingMemberId,
                    )
                  }
                  className={`flex h-[25px] items-center justify-center rounded px-[10px] text-caption2-m text-white outline-none transition-colors ${
                    member.included ? 'bg-gray-900' : 'bg-[#C1BCC0]'
                  }`}
                >
                  {member.included ? '포함하기' : '제외하기'}
                </button>

                {openMenuId === member.fundingMemberId && (
                  <div
                    className="absolute right-0 z-50 flex h-[48px] w-[100px] flex-col justify-center overflow-hidden rounded-lg bg-white px-[5px] py-1 shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                    style={{ top: 'calc(100% + 3.5px)' }}
                  >
                    <div className="flex w-full flex-col">
                      <button
                        type="button"
                        onClick={() => handleMenuSelect(member.fundingMemberId, true)}
                        className="w-full py-1 pl-1 pr-3 text-left text-caption2-r text-black"
                        style={{ borderBottom: '0.4px solid #D5D2D5' }}
                      >
                        포함하기
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMenuSelect(member.fundingMemberId, false)}
                        className="w-full py-1 pl-1 pr-3 text-left text-caption2-r text-[#FF0000]"
                      >
                        제외하기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {includedCount === 0 && (
        <p className="text-center text-caption1-r text-pink-500">최소 1명 이상 포함해야 해요</p>
      )}
    </div>
  )
}
