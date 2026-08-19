import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import StickyBottomBar from '../../components/common/StickyBottomBar'
import Toast from '../../components/common/Toast'
import DefaultAvatar from '../../components/common/DefaultAvatar'
import RoleRibbon from './RoleRibbon'
import togetherFundingFallback from '../../assets/together-funding-empty.svg'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import LinkIcon from '../../components/icons/LinkIcon'
import CandidateCard from './CandidateCard'
import GroupSegmentTabs from './GroupSegmentTabs'
import { STATUS_LABELS, ROLE_LABELS } from './groupConstants'
import { getTogetherGiftDashboard, updateGroupFundingStatus, leaveGroupFunding } from '../../api/groupFundings'
import type { TogetherGiftDashboard, GroupFundingStatus, FundingMemberRole, MemberSummary } from '../../api/groupFundings'
import { getContributions } from '../../api/contributions'
import type { ContributionItem } from '../../api/contributions'
import { MOCK_DASHBOARD, MOCK_CONTRIBUTIONS } from './groupMock'
import EnvelopeButton from '../funding/EnvelopeButton'
import LetterModal from '../funding/LetterModal'
import DeliveryShareSheet from './DeliveryShareSheet'
import { hasSelfSettled } from './settlementFlag'
import { useAuth } from '../../hooks/useAuth'
import { useMyProfile } from '../../hooks/useMyProfile'
import EmojiPopup from '../../components/common/EmojiPopup'
import { formatDateDots, getDdayLabel } from '../../utils/formatDate'
import { copyToClipboard } from '../../utils/clipboard'
import { setReturnUrl } from '../../utils/returnUrl'
import { trackEvent } from '../../lib/analytics'

// 접근: 전체 (비로그인 조회 OK, 투표·편지 등 액션은 로그인 필요) | H01 함께 선물 메인 — 역할(CREATOR·ADMIN·PARTICIPANT)·상태(SELECTING→ENDED)별 분기
export default function GroupPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { data: profile } = useMyProfile()

  // ── DEV 전용 UI 미리보기 오버라이드 ──────────────────────────
  // /group/1?role=CREATOR|ADMIN|PARTICIPANT&status=SELECTING|SETTLING|PURCHASING|DELIVERING|ENDED
  // 구 별칭(HOST/CO_HOST/COHOST/MEMBER)도 허용. API/토큰 없이 mock으로 역할×상태 조합을 바로 확인 (프로덕션 빌드엔 영향 없음)
  const [searchParams] = useSearchParams()
  const ROLE_ALIAS: Record<string, FundingMemberRole> = {
    HOST: 'CREATOR', CO_HOST: 'ADMIN', COHOST: 'ADMIN', MEMBER: 'PARTICIPANT',
    CREATOR: 'CREATOR', ADMIN: 'ADMIN', PARTICIPANT: 'PARTICIPANT',
  }
  const rawRole = import.meta.env.DEV ? searchParams.get('role') : null
  const devRole: FundingMemberRole | null = rawRole ? (ROLE_ALIAS[rawRole.toUpperCase()] ?? null) : null
  const devStatus = import.meta.env.DEV ? (searchParams.get('status') as GroupFundingStatus | null) : null
  const devPreview = devRole !== null || devStatus !== null

  const [group, setGroup] = useState<TogetherGiftDashboard | null>(null)
  const [contributions, setContributions] = useState<ContributionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [toastOpen, setToastOpen] = useState(false)
  const [giftListOpen, setGiftListOpen] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState<ContributionItem | null>(null)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [shareSheetOpen, setShareSheetOpen] = useState(false)
  // 정산 완료 여부(로컬 플래그) — SettlePage에서 돌아오며 재마운트될 때 다시 읽힌다
  const [hostSettled] = useState(() => hasSelfSettled(id))

  useEffect(() => {
    if (!id) return
    // DEV 미리보기: API 기다리지 않고 mock 즉시 세팅 (status만 쿼리로 덮어씀)
    // 쿼리(status/role)로 상태를 바꿔가며 확인하는 개발 전용 경로라 effect에서 바로 세팅한다.
    if (devPreview) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGroup({ ...MOCK_DASHBOARD, status: devStatus ?? MOCK_DASHBOARD.status })
      setContributions(MOCK_CONTRIBUTIONS)
      setLoading(false)
      return
    }
    Promise.allSettled([
      getTogetherGiftDashboard(id),
      getContributions(id),
    ]).then(([dashboardRes, contribsRes]) => {
      if (dashboardRes.status === 'fulfilled') {
        setGroup(dashboardRes.value)
      } else {
        console.error('함께 선물 대시보드 조회 실패:', dashboardRes.reason)
      }
      if (contribsRes.status === 'fulfilled') {
        setContributions(contribsRes.value.contributions.filter(c => !!c.content))
      } else {
        console.error('함께 선물 메시지 조회 실패:', contribsRes.reason)
      }
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [id, devPreview, devStatus])

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
        <Header title="함께 선물 페이지" onBack={() => navigate('/home', { replace: true })} />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-b2-r text-gray-400">불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
        <Header title="함께 선물 페이지" onBack={() => navigate('/home', { replace: true })} />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-b2-r text-gray-400">펀딩 정보를 불러올 수 없어요</p>
        </div>
      </div>
    )
  }

  const visibleMembers = group.members.slice(0, 3)
  const extraCount = Math.max(0, group.members.length - visibleMembers.length)
  const getMemberProfileImageUrl = (member: MemberSummary) => {
    const isMe = Boolean(profile) && (
      String(member.userId) === String(profile?.userId) ||
      member.name === profile?.nickname ||
      member.name === profile?.name
    )
    return isMe ? (profile?.profileImageUrl ?? member.profileImageUrl) : member.profileImageUrl
  }

  const dDayLabel = getDdayLabel(group.anniversaryDate)

  // 내 역할 = BE가 대시보드 응답의 myRole로 직접 판별해 내려줌. 비로그인/미참여(null)면 최소 권한 PARTICIPANT로 취급
  const myRole: FundingMemberRole = devRole ?? group.myRole ?? 'PARTICIPANT'
  const isHost = myRole === 'CREATOR'
  // 미리보기 땐 역할별 CTA를 봐야 하므로 로그인된 것으로 취급 (게스트 뷰 회피)
  const effectiveLoggedIn = devPreview ? true : isLoggedIn
  const isSettlingOrLater = group.status === 'SETTLING' || group.status === 'PURCHASING' || group.status === 'DELIVERING' || group.status === 'ENDED'
  const settleRoute = isHost ? `/group/${id}/settle/host` : `/group/${id}/settle`

  // 상태별 칩 문구: SELECTING=선물 고르는 중 / SETTLING=금액 모으는 중 / PURCHASING=선물 구매 중 / DELIVERING=선물 전달 중 / ENDED=선물 전달 완료
  const statusChipClass = (() => {
    if (group.status === 'PURCHASING' || group.status === 'DELIVERING') return 'bg-[#FFE3ED] border-[#FE71A5] text-[#FE71A5]'
    if (group.status === 'ENDED') return 'bg-[#FE71A5] border-[#FE71A5] text-white'
    return 'bg-white border-gray-300 text-[#5B565A]'
  })()

  const handleStatusTransition = async (nextStatus: GroupFundingStatus) => {
    if (!id || !group) return
    if (import.meta.env.DEV) {
      setGroup(prev => prev ? { ...prev, status: nextStatus } : prev)
      return
    }
    try {
      await updateGroupFundingStatus(id, nextStatus)
      setGroup(prev => prev ? { ...prev, status: nextStatus } : prev)
    } catch (e) {
      console.error(e)
    }
  }

  const copyInviteLink = async () => {
    await copyToClipboard(window.location.href)
    trackEvent('invitation_share', { method: 'copy', funding_type: 'together' })
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2000)
  }

  const handleLeave = async () => {
    setLeaveOpen(false)
    if (!id) return
    if (!import.meta.env.DEV) {
      try {
        await leaveGroupFunding(id)
      } catch (e) {
        console.error(e)
      }
    }
    navigate('/home')
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="함께 선물 페이지" onBack={() => navigate('/home', { replace: true })} />

      {/* 세그먼트 탭: 개설자(CREATOR)일 때만 노출. 공동관리자·참여자에겐 탭 없음 */}
      {isHost && (
        <GroupSegmentTabs
          tabs={[
            { label: '함께 선물 페이지', active: true },
            {
              label: group.status === 'SELECTING' ? '참여자 관리' : '정산 내역',
              active: false,
              onClick: () => navigate(group.status === 'SELECTING' ? `/group/${id}/participants/manage` : settleRoute),
            },
          ]}
        />
      )}

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto pb-[140px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* 대표 이미지 + 상태 칩 */}
        <div className="relative h-[190px] bg-background">
          {group.thumbnailImageUrl ? (
            <img src={group.thumbnailImageUrl} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <img src={togetherFundingFallback} alt="" className="absolute inset-0 size-full object-cover" />
          )}
          <div className="absolute inset-x-[18px] top-[18px] flex items-center justify-between">
            <span className={`rounded-full border px-4 py-2 text-b2-m ${statusChipClass}`}>
              {STATUS_LABELS[group.status] ?? group.status}
            </span>
            <span className="rounded-full border border-[#C1BCC0] bg-white px-4 py-2 text-b2-m text-[#5B565A]">
              {dDayLabel}
            </span>
          </div>
        </div>

      {/* 본문 */}
      <div className="flex flex-col gap-8 px-[18px] pt-[35px]">
        {/* 타이틀 + 기본 정보 */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              {group.fundingTitle && (
                <h2 className="text-h3-sb text-[#000]">{group.fundingTitle}</h2>
              )}
              {/* 함께선물 나가기: 선물 고르는 중 상태의 로그인한 비개설자(공동관리자·참여자)만. 비로그인은 아직 미참여라 미노출 */}
              {group.status === 'SELECTING' && !isHost && effectiveLoggedIn && (
                <button
                  type="button"
                  onClick={() => setLeaveOpen(true)}
                  className="shrink-0 rounded-full bg-[#1E1D1E] px-3 py-[7px] text-caption2-m text-white"
                >
                  함께선물 나가기
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
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
            {isSettlingOrLater && group.collectedAmount !== null && group.targetAmount !== null && (
              <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-3">
                <div className="flex flex-col gap-4">
                  <p className="text-b2-m leading-normal text-black">모인 금액</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-[3px]">
                        <span className="text-b2-m leading-normal text-black">{group.collectedAmount.toLocaleString()}원</span>
                        <span className="text-caption1-r leading-normal text-gray-700">/ {group.targetAmount.toLocaleString()}원</span>
                      </p>
                      <span className="text-b2-m leading-normal text-black">
                        {Math.round((group.collectedAmount / group.targetAmount) * 100)}%
                      </span>
                    </div>
                    <div className="h-[5px] w-full rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-pink-400"
                        style={{ width: `${Math.min(100, Math.round((group.collectedAmount / group.targetAmount) * 100))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-caption2-r leading-normal text-gray-700">
                        {group.members.length}명 참여{group.status === 'SETTLING' ? ' 중' : ''}
                      </span>
                      <span className="text-caption2-r leading-normal text-gray-700">마감 {formatDateDots(new Date(group.anniversaryDate))}</span>
                    </div>
                  </div>
                </div>
                {group.status === 'ENDED' ? (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setGiftListOpen(o => !o)}
                      className="flex w-full items-center justify-between"
                    >
                      <span className="text-b2-m text-gray-700">{group.recipientName}님에게 보낸 선물</span>
                      <ChevronRightIcon className={`size-4 text-gray-500 transition-transform ${giftListOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {giftListOpen && (group.confirmedGifts ?? []).length > 0 && (
                      <ul className="mt-3 flex flex-col gap-2">
                        {(group.confirmedGifts ?? []).map((gift, index) => (
                          <li
                            key={gift.fundingGiftId}
                            className={index > 0 ? 'border-t border-gray-100 pt-2' : ''}
                          >
                            <div className="flex items-start justify-between gap-5">
                              {gift.giftImageUrl ? (
                                <img src={gift.giftImageUrl} alt="" className="size-[60px] shrink-0 rounded-[4px] object-cover" />
                              ) : (
                                <div className="size-[60px] shrink-0 rounded-[4px] bg-background-2" />
                              )}
                              <div className="flex flex-1 flex-col gap-2">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-caption1-m leading-normal text-black">{gift.giftName}</p>
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/group/${id}/purchase-upload`)}
                                    className="flex h-[25px] shrink-0 items-center rounded-[4px] bg-background px-2.5 text-caption2-m text-black"
                                  >
                                    구매내역 업로드
                                  </button>
                                </div>
                                <p className="text-caption1-r leading-normal text-gray-600">{gift.giftPrice.toLocaleString()}원</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setGiftListOpen(o => !o)}
                      className="flex w-full items-center justify-between"
                    >
                      <span className="text-b2-m text-gray-700">
                        {group.recipientName}님에게 보낼 선물
                      </span>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M19 8L12 15L5 8" stroke="#5B565A" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {giftListOpen && (group.confirmedGifts ?? []).length > 0 && (
                      <ul className="mt-3 flex flex-col">
                        {(group.confirmedGifts ?? []).map((gift, index) => (
                          <li
                            key={gift.fundingGiftId}
                            className={`flex items-center gap-5 py-2 ${index > 0 ? 'border-t border-gray-100' : 'pt-0'}`}
                          >
                            {gift.giftImageUrl ? (
                              <img src={gift.giftImageUrl} alt="" className="size-[60px] shrink-0 rounded-[4px] object-cover" />
                            ) : (
                              <div className="size-[60px] shrink-0 rounded-[4px] bg-gray-100" />
                            )}
                            <div className="flex flex-1 items-center justify-between gap-2">
                              <div className="flex flex-col gap-2">
                                <p className="text-caption1-m leading-normal text-black">{gift.giftName}</p>
                                <p className="text-caption1-r leading-normal text-gray-600">{gift.giftPrice.toLocaleString()}원</p>
                              </div>
                              {gift.purchaseUrl ? (
                                <a
                                  href={gift.purchaseUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex h-[25px] shrink-0 items-center rounded-[4px] bg-background px-2.5 text-caption2-m text-black"
                                >
                                  구매링크
                                </a>
                              ) : (
                                <span className="flex h-[25px] shrink-0 items-center rounded-[4px] bg-background px-2.5 text-caption2-m text-gray-400">
                                  구매링크
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
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
                      onClick={() => navigate(`/group/${id}/participants`)}
                      className="flex items-center whitespace-nowrap"
                    >
                      <span className="text-caption2-r text-[#797378]">+{extraCount}명</span>
                      <ChevronRightIcon className="size-6 text-[#797378]" />
                    </button>
                  )}
                </div>

                {/* 초대장 공유 — 전달 완료(ENDED)면 더 이상 참여 모집이 없으므로 숨김 */}
                {group.status !== 'ENDED' && (
                  <button
                    type="button"
                    onClick={copyInviteLink}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 py-2"
                  >
                    <LinkIcon className="size-5 text-black" />
                    <span className="text-caption1-m text-black">초대장 공유</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 선물 후보 섹션 (SELECTING 단계에서만 표시). 후보가 없어도 헤더·더보기는 노출해 등록 진입점을 남긴다 */}
        {group.status === 'SELECTING' && (
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
              <p className="text-caption1-r mt-1.5 text-[#797378]">더보기를 통해 더 많은 선물 후보를 둘러보고 투표하세요</p>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-b1-m text-[#000]">실시간 득표수가 높은 선물후보</p>
              {group.topGifts && group.topGifts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {group.topGifts.map((gift, idx) => (
                    <CandidateCard key={gift.fundingGiftId} candidate={gift} rank={idx + 1} />
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-b2-r text-gray-400">아직 등록된 선물 후보가 없어요</p>
              )}
            </div>
          </div>
        )}

        {/* 축하 메세지 섹션 — 함께 선물 홈에선 전달 완료(ENDED) 상태에서만 노출.
            메세지가 0개여도 헤더·더보기는 유지(더보기 → 빈 전체보기), 봉투만 데이터 없으면 안 나옴 */}
        {group.status === 'ENDED' && (
          <div className="flex flex-col gap-[9px]">
            <div className="flex flex-col gap-[9px]">
              <div className="flex items-center justify-between">
                <span className="text-h3-sb text-black">축하 메세지</span>
                <button
                  type="button"
                  onClick={() => navigate(`/group/${id}/messages`)}
                  className="text-b1-m text-gray-600"
                >
                  더보기
                </button>
              </div>
              <p className="text-caption1-r text-gray-600">봉투를 탭하면 메세지를 확인할 수 있어요</p>
            </div>
            <div className="-mx-[18px] flex gap-[14px] overflow-x-auto px-[18px] pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {contributions.slice(0, 5).map(c => (
                <EnvelopeButton
                  key={c.contributionId}
                  label={c.isAnonymous ? '익명' : (c.senderName ?? '참여자')}
                  canOpen={!!c.content}
                  onOpen={() => setSelectedLetter(c)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      </div>{/* /스크롤 영역 */}

      {/* 하단 고정 CTA */}
      <StickyBottomBar>
        {!effectiveLoggedIn ? (
          // 비로그인 참여자: H는 조회만 비로그인 OK. 전달 완료(ENDED)면 참여가 끝났으니 소식 보기(로그인 불필요),
          // 그 외엔 참여하려면 로그인 → 로그인 후 이 펀딩으로 복귀
          group.status === 'ENDED' ? (
            <Button
              className="pointer-events-auto !bg-[#1E1D1E]"
              onClick={() => navigate(`/gift/review/${id}/${id}?type=news`)}
            >
              전달 완료 소식보기
            </Button>
          ) : (
            <Button
              className="pointer-events-auto"
              onClick={() => {
                setReturnUrl(`/group/${id}`)
                navigate('/login')
              }}
            >
              함께 선물 참여하기
            </Button>
          )
        ) : (
          <>
        {/* 선물 고르는 중 */}
        {group.status === 'SELECTING' && (
          isHost ? (
            <div className="pointer-events-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/group/${id}/confirm${devPreview ? '?preview' : ''}`)}
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
          ) : (
            // 공동관리자·참여자 공통: 후보 등록은 후보 목록 페이지 배너에서 진행
            <Button
              className="pointer-events-auto"
              onClick={() => navigate(`/group/${id}/candidates`)}
            >
              선물 후보 투표하기
            </Button>
          )
        )}

        {/* 금액 모으는 중 */}
        {group.status === 'SETTLING' && (
          isHost ? (
            <div className="pointer-events-auto flex items-center gap-3">
              {/* 개설자도 참여자처럼 정산(/settle)을 먼저 거치고, 정산 완료 후에만 금액 모으기 마감 가능 */}
              <button
                type="button"
                onClick={() =>
                  hostSettled
                    ? handleStatusTransition('PURCHASING')
                    : navigate(`/group/${id}/settle`)
                }
                className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-gray-500 bg-white text-b2-m text-black"
              >
                {hostSettled ? '금액 모으기 마감하기' : '정산하기'}
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
            <Button className="pointer-events-auto" onClick={() => navigate(settleRoute)}>
              정산하기
            </Button>
          )
        )}

        {/* 선물 구매 중 */}
        {group.status === 'PURCHASING' && (
          isHost ? (
            <div className="pointer-events-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleStatusTransition('DELIVERING')}
                className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-gray-500 bg-white text-b2-m text-black"
              >
                선물 구매 완료하기
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
            // 구매 중엔 참여자·공동관리자 정산이 이미 끝난 단계라 하단 CTA 없음
            null
          )
        )}

        {/* 선물 전달 중 */}
        {group.status === 'DELIVERING' && (
          isHost ? (
            <div className="pointer-events-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleStatusTransition('ENDED')}
                className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-gray-500 bg-white text-b2-m text-black"
              >
                선물 전달 완료하기
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
            // 전달 중엔 참여자·공동관리자 정산이 이미 끝난 단계라 하단 CTA 없음
            null
          )
        )}

        {/* 선물 전달 완료 */}
        {group.status === 'ENDED' && (
          isHost ? (
            <Button
              className="pointer-events-auto !bg-[#1E1D1E]"
              onClick={() => setShareSheetOpen(true)}
            >
              전달 완료 소식 남기기
            </Button>
          ) : (
            // 공동관리자·참여자: 개설자가 남긴 전달 완료 소식(news) 보기
            // 라우트 /gift/review/:id/:fundingId? — 실제 조회는 fundingId로 하므로 함께 전달 (:id는 mock fallback용)
            // TOGETHER_GIFT 전용 소식이라 조회 타입도 news로 지정 (기본값은 MY_GIFT의 review)
            <Button
              className="pointer-events-auto !bg-[#1E1D1E]"
              onClick={() => navigate(`/gift/review/${id}/${id}?type=news`)}
            >
              전달 완료 소식보기
            </Button>
          )
        )}
          </>
        )}
      </StickyBottomBar>
      <Toast open={toastOpen} message="초대장 링크가 복사되었습니다." bottomClass="bottom-[102px]" />
      <LetterModal
        open={selectedLetter !== null}
        hostName={`${group.recipientName}님`}
        content={selectedLetter?.content ?? ''}
        senderLabel={selectedLetter?.isAnonymous ? '익명' : (selectedLetter?.senderName ?? null)}
        onClose={() => setSelectedLetter(null)}
      />
      {/* 함께선물 나가기 확인 — 피그마대로 나가기(좌·회색)/계속하기(우·검정), 배경 탭은 닫힘(안전) */}
      <EmojiPopup
        open={leaveOpen}
        title="함께 선물 페이지를 나가시겠습니까?"
        titleClassName="whitespace-nowrap text-h3-sb"
        description={'지금 나가시면 투표한 내역이 사라지며\n참여자에서 제외돼요.'}
        buttons={[
          { label: '취소하기', onClick: () => setLeaveOpen(false), variant: 'secondary' },
          { label: '나가기', onClick: handleLeave, variant: 'primary' },
        ]}
        onDimClick={() => setLeaveOpen(false)}
      />
      {/* 전달 완료 소식/마음 공유 진입 바텀시트 (개설자 ENDED) */}
      <DeliveryShareSheet open={shareSheetOpen} onClose={() => setShareSheetOpen(false)} />
    </div>
  )
}
