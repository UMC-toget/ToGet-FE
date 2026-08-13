import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import togetherFundingFallback from '../../assets/together-funding-empty.svg'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import DefaultAvatar from '../../components/common/DefaultAvatar'
import RoleRibbon from '../group/RoleRibbon'
import { ROLE_LABELS } from '../group/groupConstants'
import type { TogetherGiftDashboard, MemberSummary } from '../../api/groupFundings'
import { formatDateKorean } from '../../utils/formatDate'
import { useMyProfile } from '../../hooks/useMyProfile'

interface Props {
  dashboard: TogetherGiftDashboard
}

/**
 * 전달 소식(news) 조회 화면 상단에 쓰는 함께 선물 요약 — GroupPage.tsx의 모인금액·선물목록·참여자 UI를
 * 참고하되 개설자 전용 액션(편집/정산/나가기/구매내역 업로드/초대장 공유)은 뺀 read-only 버전이다.
 * GroupPage.tsx는 그대로 두고(회귀 방지) 이 화면 전용으로 새로 둔다.
 */
export default function GiftDashboardSummary({ dashboard }: Props) {
  const navigate = useNavigate()
  const { data: profile } = useMyProfile()
  const [giftListOpen, setGiftListOpen] = useState(false)

  const visibleMembers = dashboard.members.slice(0, 3)
  const extraCount = Math.max(0, dashboard.members.length - visibleMembers.length)
  const getMemberProfileImageUrl = (member: MemberSummary) => {
    const isMe = Boolean(profile) && (
      String(member.userId) === String(profile?.userId) ||
      member.name === profile?.nickname ||
      member.name === profile?.name
    )
    return isMe ? (profile?.profileImageUrl ?? member.profileImageUrl) : member.profileImageUrl
  }

  const { collectedAmount, targetAmount } = dashboard
  const progress = collectedAmount !== null && targetAmount !== null
    ? { collectedAmount, targetAmount, pct: Math.round((collectedAmount / targetAmount) * 100) }
    : null
  const gifts = dashboard.confirmedGifts ?? []

  return (
    <div className="flex flex-col gap-8">
      <div className="relative h-[190px] bg-background">
        <img
          src={dashboard.thumbnailImageUrl ?? togetherFundingFallback}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      <div className="flex flex-col gap-5 px-[18px]">
        <div className="flex flex-col gap-2.5">
          {dashboard.fundingTitle && <h2 className="text-h3-sb text-black">{dashboard.fundingTitle}</h2>}
          <div className="flex flex-col gap-2">
            <p className="text-b2-m text-[#1E1D1E]">선물 받는 분: {dashboard.recipientName}</p>
            <p className="text-b2-r text-[#797378]">
              기념일: {formatDateKorean(new Date(dashboard.anniversaryDate))}
            </p>
          </div>
        </div>

        {progress && (
          <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-3">
            <div className="flex flex-col gap-4">
              <p className="text-b2-m leading-normal text-black">모인 금액</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-[3px]">
                    <span className="text-b2-m leading-normal text-black">{progress.collectedAmount.toLocaleString()}원</span>
                    <span className="text-caption1-r leading-normal text-gray-700">/ {progress.targetAmount.toLocaleString()}원</span>
                  </p>
                  <span className="text-b2-m leading-normal text-black">{progress.pct}%</span>
                </div>
                <div className="h-[5px] w-full rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-pink-400" style={{ width: `${Math.min(100, progress.pct)}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-caption2-r leading-normal text-gray-700">{dashboard.members.length}명 참여</span>
                </div>
              </div>
            </div>

            {gifts.length > 0 && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setGiftListOpen((o) => !o)}
                  className="flex w-full items-center justify-between"
                >
                  <span className="text-b2-m text-gray-700">{dashboard.recipientName}님에게 보낸 선물</span>
                  <ChevronRightIcon className={`size-4 text-gray-500 transition-transform ${giftListOpen ? 'rotate-90' : ''}`} />
                </button>
                {giftListOpen && (
                  <ul className="mt-3 flex flex-col gap-2">
                    {gifts.map((gift, index) => (
                      <li key={gift.fundingGiftId} className={index > 0 ? 'border-t border-gray-100 pt-2' : ''}>
                        <div className="flex items-start justify-between gap-5">
                          {gift.giftImageUrl ? (
                            <img src={gift.giftImageUrl} alt="" className="size-[60px] shrink-0 rounded-[4px] object-cover" />
                          ) : (
                            <div className="size-[60px] shrink-0 rounded-[4px] bg-background-2" />
                          )}
                          <div className="flex flex-1 flex-col gap-2">
                            <p className="text-caption1-m leading-normal text-black">{gift.giftName}</p>
                            <p className="text-caption1-r leading-normal text-gray-600">{gift.giftPrice.toLocaleString()}원</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl border border-gray-300 px-[14px] py-3">
          <div className="flex flex-col gap-4">
            <span className="text-b2-m text-black">참여자</span>

            <div className="flex items-center gap-[30px]">
              {visibleMembers.map((m) => (
                <div key={m.fundingMemberId} className="flex items-center gap-2">
                  <div className="relative mt-[5px] flex shrink-0">
                    {getMemberProfileImageUrl(m) ? (
                      <img
                        src={getMemberProfileImageUrl(m) ?? undefined}
                        alt={m.name}
                        className="size-[26px] rounded-full object-cover"
                      />
                    ) : (
                      <DefaultAvatar plain className="size-[26px] shrink-0" />
                    )}
                    <RoleRibbon
                      role={m.role}
                      className="absolute bottom-[21px] left-1/2 h-[10.24px] w-[17px] -translate-x-1/2"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-normal leading-[10px] text-[#797378]">{ROLE_LABELS[m.role]}</span>
                    <span className="max-w-[34px] truncate text-caption1-m leading-[17px] text-[#111111]">
                      {m.name || (m.userId === profile?.userId ? profile?.nickname : '')}
                    </span>
                  </div>
                </div>
              ))}
              {extraCount > 0 && (
                <button
                  type="button"
                  onClick={() => navigate(`/group/${dashboard.fundingId}/participants`)}
                  className="flex items-center whitespace-nowrap"
                >
                  <span className="text-caption2-r text-[#797378]">+{extraCount}명</span>
                  <ChevronRightIcon className="size-6 text-[#797378]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
