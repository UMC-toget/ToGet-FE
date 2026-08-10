import CheckIcon from '../../components/icons/CheckIcon'
import type { MemberWithStatus } from './ConfirmPage'

// ConfirmPage 서브 컴포넌트 (개설자 전용) | 2단계 정산인원 확정하기 — 카드 탭으로 포함·제외

function PlainAvatar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="20" fill="#F7F5F8" />
    </svg>
  )
}

interface Props {
  members: MemberWithStatus[]
  onToggle: (memberId: number) => void
  onSetAll: (included: boolean) => void
}

function getRoleLabel(role: string) {
  if (role === 'CREATOR') return '방장'
  if (role === 'ADMIN') return '공동관리자'
  return '참여자'
}

export default function ConfirmStep2({ members, onToggle, onSetAll }: Props) {
  const includedCount = members.filter(m => m.included).length
  const totalCount = members.length
  const allSelected = totalCount > 0 && includedCount === totalCount

  return (
    <div className="flex flex-col gap-5 px-[18px] pb-4">
      <h2 className="text-h3-sb text-black">2. 정산인원 확정하기</h2>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-b1-m text-black">정산 인원</p>
          <div className="flex items-center justify-between">
            <p className="text-caption1-r text-gray-500">
              참여자 {totalCount}명 중 {includedCount}명 포함
            </p>
            <button
              type="button"
              onClick={() => onSetAll(!allSelected)}
              className="flex items-center gap-2"
            >
              <span
                className={`flex size-4 items-center justify-center rounded ${
                  allSelected ? 'bg-gray-200 text-white' : 'border border-gray-200'
                }`}
              >
                {allSelected && <CheckIcon className="size-3" />}
              </span>
              <span className="text-caption1-m text-gray-700">전체 선택</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {members.map(member => (
            <button
              key={member.fundingMemberId}
              type="button"
              onClick={() => onToggle(member.fundingMemberId)}
              className={`flex items-center justify-between rounded-xl border bg-white px-[14px] py-3 text-left transition-colors ${
                member.included ? 'border-[#feaac9]' : 'border-gray-100'
              }`}
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

              <CheckIcon
                className={`size-6 shrink-0 ${member.included ? 'text-pink-500' : 'text-gray-200'}`}
              />
            </button>
          ))}
        </div>
      </div>

      {includedCount === 0 && (
        <p className="text-center text-caption1-r text-pink-500">최소 1명 이상 포함해야 해요</p>
      )}
    </div>
  )
}
