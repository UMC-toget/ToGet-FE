import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import LinkIcon from '../../components/icons/LinkIcon'
import CheckIcon from '../../components/icons/CheckIcon'
import CandidateCard from './CandidateCard'
import { getTogetherGiftDashboard } from '../../api/groupFundings'
import type { TogetherGiftDashboard } from '../../api/groupFundings'
import { getContributions } from '../../api/contributions'
import type { ContributionItem } from '../../api/contributions'
import { useMyProfile } from '../../hooks/useMyProfile'
import { MOCK_DASHBOARD } from './groupMock'
import ribbonHost from '../../assets/ribbon-host.svg'
import ribbonCoHost from '../../assets/ribbon-co-host.svg'
import { formatDateDots } from '../../utils/formatDate'

const ROLE_LABEL: Record<string, string> = {
  HOST: '방장',
  CO_HOST: '부방장',
  MEMBER: '참여자',
}

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
  const { data: _profile } = useMyProfile()

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
      else if (import.meta.env.DEV) setGroup(MOCK_DASHBOARD)
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

  // D-day 계산
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const anniversary = new Date(group.anniversaryDate)
  anniversary.setHours(0, 0, 0, 0)
  const diffDays = Math.round((anniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const dDayLabel = diffDays > 0 ? `D-${diffDays}` : diffDays === 0 ? 'D-Day' : `D+${Math.abs(diffDays)}`

  // TODO: 테스트용 임시 고정 — 확인 후 아래 원래 줄로 교체
  const myRole: 'HOST' | 'CO_HOST' | 'MEMBER' = 'HOST'
  // const myRole = group.members.find(m => m.userId === profile?.userId)?.role
  const isHost = myRole === 'HOST'
  const isAdmin = myRole === 'HOST' || myRole === 'CO_HOST'
  const isSettling = group.status === 'SETTLING' || group.status === 'PURCHASING' || group.status === 'DELIVERING'
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
    <div className="mx-auto flex h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="함께 선물 페이지" />

      {/* 세그먼트 탭: 참여자 관리는 HOST/CO_HOST만 */}
      <div className="mx-[18px] my-6 flex shrink-0 items-center gap-1 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          className={`flex items-center justify-center rounded py-2 px-[10px] text-b2-m text-black bg-white ${isAdmin ? 'flex-1' : 'w-full'}`}
        >
          함께 선물 페이지
        </button>
        {isAdmin && (
          isSettling && isHost ? (
            <button
              type="button"
              onClick={() => navigate(`/group/${id}/settle/host`)}
              className="flex flex-1 items-center justify-center rounded py-2 px-[10px] text-b2-m text-[#797378]"
            >
              정산 내역
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/group/${id}/participants`)}
              className="flex flex-1 items-center justify-center rounded py-2 px-[10px] text-b2-m text-[#797378]"
            >
              참여자 관리
            </button>
          )
        )}
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto pb-[140px]">
        {/* 대표 이미지 + 상태 칩 */}
        <div className="relative h-[190px] bg-background">
          {group.thumbnailImageUrl && (
            <img src={group.thumbnailImageUrl} alt="" className="absolute inset-0 size-full object-cover" />
          )}
          <div className="absolute inset-x-[18px] top-[18px] flex items-center justify-between">
            <span className="rounded-full border border-[#C1BCC0] bg-white px-4 py-2 text-b2-m text-[#5B565A]">
              {STATUS_LABEL[group.status] ?? group.status}
            </span>
            <span className="rounded-full border border-[#C1BCC0] bg-white px-4 py-2 text-b2-m text-[#5B565A]">
              {dDayLabel}
            </span>
          </div>
        </div>

      {/* 본문 */}
      <div className="flex flex-col gap-8 px-[18px] pt-8">
        {/* 타이틀 + 기본 정보 */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            {group.title && (
              <h2 className="text-h3-sb text-[#000]">{group.title}</h2>
            )}
            <div className="flex flex-col gap-1">
              <p className="text-b2-m text-[#1E1D1E]">선물 받는 분: {group.recipientName}</p>
              <p className="text-b2-r text-[#797378]">
                기념일: {(() => { const [y, m, d] = group.anniversaryDate.split('-'); return `${y}년 ${m}월 ${d}일` })()}
              </p>
            </div>
          </div>

          {/* 소개글 카드 */}
          <div className="flex flex-col gap-3">
            <div className="flex min-h-[101px] items-center justify-center rounded-xl border border-[#D5D2D5] bg-background-2 px-[14px] py-3">
              <p className="whitespace-pre-line text-center text-b2-m leading-[17px] text-gray-800">{group.introduction}</p>
            </div>

            {/* 펀딩창: SETTLING 이후 모인 금액 진행률 표시 */}
            {isSettling && group.collectedAmount !== null && group.targetAmount !== null && (
              <div className="rounded-xl border border-gray-200 bg-white px-[14px] py-3">
                <div className="flex items-center justify-between">
                  <span className="text-b2-m text-black">모인 금액</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-b2-m text-black">{group.collectedAmount.toLocaleString()}원</span>
                    <span className="text-caption1-r text-gray-700">/ {group.targetAmount.toLocaleString()}원</span>
                    <span className="text-b2-m text-black">
                      {Math.round((group.collectedAmount / group.targetAmount) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="my-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-pink-400"
                    style={{
                      width: `${Math.min(100, Math.round((group.collectedAmount / group.targetAmount) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-caption2-r text-gray-700">{group.members.length}명 참여 중</span>
                  <span className="text-caption2-r text-gray-700">마감 {formatDateDots(new Date(group.anniversaryDate))}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/group/${id}/candidates`)}
                  className="mt-3 flex w-full items-center justify-between border-t border-gray-100 pt-3"
                >
                  <span className="text-b2-m text-gray-700">{group.recipientName}님에게 보낼 선물</span>
                  <ChevronRightIcon className="size-4 text-gray-500" />
                </button>
              </div>
            )}

            {/* 참여자 카드 */}
            <div className="rounded-xl border border-gray-300 px-[14px] py-3">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-b2-m text-black">참여자</span>
                </div>

                {/* 이름+역할 있는 아바타 목록 */}
                <div className="flex items-center gap-[30px]">
                  {visibleMembers.map(m => (
                    <div key={m.fundingMemberId} className="flex items-center gap-2">
                      <div className="relative mt-[5px] shrink-0">
                        {m.profileImageUrl ? (
                          <img src={m.profileImageUrl} alt={m.name} className="size-[26px] rounded-full object-cover" />
                        ) : (
                          <div className="size-[26px] rounded-full bg-[#E4E4E4]" />
                        )}
                        {(m.role === 'HOST' || m.role === 'CO_HOST') && (
                          <img
                            src={m.role === 'HOST' ? ribbonHost : ribbonCoHost}
                            alt=""
                            className="absolute left-[5px] -top-[5px] w-[17px]"
                          />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-normal leading-[10px] text-[#797378]">{ROLE_LABEL[m.role]}</span>
                        <span className="max-w-[34px] truncate text-caption1-m text-[#111111]">{m.name}</span>
                      </div>
                    </div>
                  ))}
                  {extraCount > 0 && (
                    <button
                      type="button"
                      onClick={() => navigate(`/group/${id}/participants`)}
                      className="flex items-center whitespace-nowrap"
                    >
                      <span className="text-caption2-r text-[#797378]">+{extraCount}명</span>
                      <ChevronRightIcon className="size-6 text-[#797378]" />
                    </button>
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
          <div className="flex flex-col gap-5">
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
              <p className="text-caption1-r text-[#797378]">더보기를 통해 더 많은 선물 후보를 둘러보고 투표하세요</p>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-b1-m text-[#000]">실시간 득표수가 높은 선물후보</p>
              <div className="grid grid-cols-2 gap-3">
                {group.topGifts.map((gift, idx) => (
                  <CandidateCard key={gift.fundingGiftId} candidate={gift} rank={idx + 1} />
                ))}
              </div>
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
      </div>{/* /스크롤 영역 */}

      {/* 하단 고정 CTA */}
      <div className="pointer-events-none fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-gradient-to-b from-white/0 to-white/80 px-[18px] pb-[34px] pt-10">
        {group.status === 'SELECTING' && (
          isHost ? (
            <div className="pointer-events-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/group/${id}/candidates`)}
                className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-[#797378] bg-white text-b2-sb text-black"
              >
                선물 확정하기
              </button>
              <button
                type="button"
                onClick={() => navigate(`/group/${id}/edit`)}
                className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-[#1E1D1E] text-b2-sb text-white"
              >
                수정하기
              </button>
            </div>
          ) : isAdmin ? (
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
        {isSettling && (
          isHost ? (
            <div className="pointer-events-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => {/* TODO: 금액 모으기 마감 API 연결 */}}
                className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-gray-500 bg-white text-b2-m text-black"
              >
                금액 모으기 마감하기
              </button>
              <button
                type="button"
                onClick={() => navigate(`/group/${id}/edit`)}
                className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-[#1E1D1E] text-b2-m text-white"
              >
                수정하기
              </button>
            </div>
          ) : (
            <Button
              className="pointer-events-auto"
              onClick={() => navigate(settleRoute)}
            >
              정산하기
            </Button>
          )
        )}
      </div>
      {toastOpen && (
        <div className="fixed bottom-[98px] left-1/2 z-40 w-full max-w-[402px] -translate-x-1/2 px-[18px]">
          <div className="flex h-11 items-center gap-[10px] rounded-lg bg-[rgba(255,227,237,0.9)] px-[18px]">
            <div className="flex size-[25px] shrink-0 items-center justify-center rounded-full bg-pink-500">
              <CheckIcon className="size-[15px] text-white" />
            </div>
            <p className="text-caption1-m text-black">초대장 링크가 복사되었습니다.</p>
          </div>
        </div>
      )}
    </div>
  )
}
