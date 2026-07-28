import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import Toast from '../../components/common/Toast'
import DefaultAvatar from '../../components/common/DefaultAvatar'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import LinkIcon from '../../components/icons/LinkIcon'
import CandidateCard from './CandidateCard'
import { getTogetherGiftDashboard } from '../../api/groupFundings'
import type { TogetherGiftDashboard } from '../../api/groupFundings'
import { getContributions } from '../../api/contributions'
import type { ContributionItem } from '../../api/contributions'
import { useMyProfile } from '../../hooks/useMyProfile'

const STATUS_LABEL: Record<string, string> = {
  SELECTING: '선물 고르는 중',
  SETTLING: '금액 모으는 중',
  PURCHASING: '금액 모으는 중',
  DELIVERING: '금액 모으는 중',
  ENDED: '선물 전달 완료',
}

/** H01) 함께 선물 참여 메인 페이지 (피그마 일반 참여자 ver #2369:35709) */
export default function GroupPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: profile } = useMyProfile()

  const [group, setGroup] = useState<TogetherGiftDashboard | null>(null)
  const [contributions, setContributions] = useState<ContributionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.allSettled([
      getTogetherGiftDashboard(id),
      getContributions(id),
    ]).then(([dashboardRes, contribsRes]) => {
      if (dashboardRes.status === 'fulfilled') setGroup(dashboardRes.value)
      if (contribsRes.status === 'fulfilled') {
        setContributions(contribsRes.value.contributions.filter(c => !!c.content))
      }
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
        <Header title="함께 선물 페이지" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-b2-r text-gray-400">불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
        <Header title="함께 선물 페이지" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-b2-r text-gray-400">펀딩 정보를 불러올 수 없어요</p>
        </div>
      </div>
    )
  }

  const visibleMembers = group.members.slice(0, 3)
  const extraCount = Math.max(0, group.members.length - visibleMembers.length)
  const myRole = group.members.find(m => m.userId === profile?.userId)?.role
  const isHost = myRole === 'HOST'
  const isAdmin = myRole === 'HOST' || myRole === 'CO_HOST'
  const settleRoute = isHost ? `/group/${id}/settle/host` : `/group/${id}/settle`

  const copyInviteLink = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2000)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-[140px]">
      <Header title="함께 선물 페이지" />

      {/* 대표 이미지 + 상태 칩 */}
      <div className="relative flex h-[190px] items-end bg-background px-[18px] pb-[18px]">
        {group.thumbnailImageUrl && (
          <img src={group.thumbnailImageUrl} alt="" className="absolute inset-0 size-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-black/10" />
        <div className="relative z-10 flex w-full items-center justify-between">
          <span className="rounded-full border border-gray-300 bg-white px-4 py-[7px] text-b2-m text-gray-700">
            {STATUS_LABEL[group.status] ?? group.status}
          </span>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex flex-col gap-8 px-[18px] pt-6">
        {/* 타이틀 + 기본 정보 */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-1">
              <p className="text-b2-m text-gray-900">선물 받는 분: {group.recipientName}</p>
              <p className="text-b2-r text-gray-600">
                기념일: {(() => { const [y, m, d] = group.anniversaryDate.split('-'); return `${y}년 ${m}월 ${d}일` })()}
              </p>
            </div>
          </div>

          {/* 소개글 카드 */}
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-gray-300 bg-background-2 px-[14px] py-3">
              <p className="whitespace-pre-line text-b2-m text-gray-800">{group.introduction}</p>
            </div>

            {/* 참여자 카드 */}
            <div className="rounded-xl border border-gray-300 px-[14px] py-3">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-b2-m text-black">참여자</span>
                  <button
                    type="button"
                    onClick={() => navigate(`/group/${id}/participants`)}
                    className="flex items-center"
                  >
                    <ChevronRightIcon className="size-5 text-gray-600" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {visibleMembers.map((m, i) => (
                      <span key={m.fundingMemberId} style={{ marginLeft: i > 0 ? '-8px' : 0 }}>
                        {m.profileImageUrl ? (
                          <img src={m.profileImageUrl} alt={m.name} className="size-[31px] shrink-0 rounded-full object-cover" />
                        ) : (
                          <DefaultAvatar className="size-[31px] shrink-0" />
                        )}
                      </span>
                    ))}
                  </div>
                  {extraCount > 0 && (
                    <span className="text-caption2-r text-gray-600">+{extraCount}명</span>
                  )}
                </div>

                {/* 초대장 공유 */}
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 py-2"
                >
                  <LinkIcon className="size-5 text-black" />
                  <span className="text-caption1-m text-black">초대장 공유</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 선물 후보 섹션 (SELECTING 단계에서만 표시) */}
        {group.status === 'SELECTING' && group.topGifts && group.topGifts.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-h3-sb text-black">선물 후보</span>
                <button
                  type="button"
                  onClick={() => navigate(`/group/${id}/candidates`)}
                  className="text-b1-m text-gray-600"
                >
                  더보기
                </button>
              </div>
              <p className="text-caption1-r text-gray-600">
                더보기를 통해 더 많은 선물 후보를 둘러보고 투표하세요
              </p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {group.topGifts.map((gift, idx) => (
                <CandidateCard key={gift.fundingGiftId} candidate={gift} rank={idx + 1} />
              ))}
            </div>
          </div>
        )}

        {/* 축하 메세지 섹션 */}
        {contributions.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-h3-sb text-black">축하 메세지 {contributions.length}</span>
              <button
                type="button"
                onClick={() => navigate(`/group/${id}/letter`, { state: { recipientName: group.recipientName } })}
                className="text-b2-m text-pink-500"
              >
                편지 남기기
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {contributions.slice(0, 5).map(c => (
                <div key={c.contributionId} className="rounded-xl bg-background px-[14px] py-3">
                  <p className="text-caption2-m text-gray-600">
                    {c.isAnonymous ? '익명' : (c.senderName ?? '참여자')}
                  </p>
                  <p className="mt-1 text-b2-r text-black line-clamp-2">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 고정 CTA */}
      <div className="pointer-events-none fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-gradient-to-b from-white/0 to-white/80 px-[18px] pb-[34px] pt-10">
        {group.status === 'SELECTING' && (
          isAdmin ? (
            <div className="pointer-events-auto flex flex-col gap-2">
              <Button onClick={() => navigate(`/group/${id}/candidates`)}>
                함께 선물 참여하기
              </Button>
              <button
                type="button"
                onClick={() => navigate(`/group/${id}/candidates/new`)}
                className="flex h-[52px] w-full items-center justify-center rounded-xl border border-gray-300 bg-white text-b1-m text-black"
              >
                선물 후보 등록하기
              </button>
            </div>
          ) : (
            <Button
              className="pointer-events-auto"
              onClick={() => navigate(`/group/${id}/candidates`)}
            >
              함께 선물 참여하기
            </Button>
          )
        )}
        {(group.status === 'SETTLING' || group.status === 'PURCHASING' || group.status === 'DELIVERING') && (
          <Button
            className="pointer-events-auto"
            onClick={() => navigate(settleRoute)}
          >
            {isHost ? '정산 내역 관리' : '정산하기'}
          </Button>
        )}
      </div>
      <Toast open={toastOpen} message="초대장 링크가 복사되었어요" />
    </div>
  )
}
