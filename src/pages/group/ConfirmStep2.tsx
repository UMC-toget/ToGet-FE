import DefaultAvatar from '../../components/common/DefaultAvatar'
import type { MemberWithStatus } from './ConfirmPage'

interface Props {
  members: MemberWithStatus[]
  onToggle: (memberId: number) => void
}

export default function ConfirmStep2({ members, onToggle }: Props) {
  const includedCount = members.filter(m => m.included).length
  const totalCount = members.length

  return (
    <div className="flex flex-col gap-4 px-[18px] pb-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-h3-sb text-black">2. 정산인원 확정하기</h2>
        <p className="text-b1-m text-black">정산 인원</p>
        <p className="text-caption1-r text-gray-500">
          참여자 {totalCount}명 중 {includedCount}명 포함
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {members.map(member => (
          <div
            key={member.fundingMemberId}
            className={`flex items-center justify-between rounded-xl border px-[14px] py-3 transition-colors ${
              member.included ? 'border-gray-100 bg-white' : 'border-gray-100 bg-background'
            }`}
          >
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
              <span className={`text-b2-m ${member.included ? 'text-black' : 'text-gray-400'}`}>
                {member.name}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onToggle(member.fundingMemberId)}
              className={`rounded px-3 py-1.5 text-caption2-m transition-colors ${
                member.included
                  ? 'border border-gray-300 bg-white text-gray-700'
                  : 'bg-gray-900 text-white'
              }`}
            >
              {member.included ? '제외하기' : '포함하기'}
            </button>
          </div>
        ))}
      </div>

      {includedCount === 0 && (
        <p className="text-center text-caption1-r text-pink-500">최소 1명 이상 포함해야 해요</p>
      )}
    </div>
  )
}
