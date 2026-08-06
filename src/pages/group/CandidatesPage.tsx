import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import { getGiftCandidates, getTogetherGiftDashboard, toggleGiftVote } from '../../api/groupFundings'
import type { GiftCandidateItem, MemberSummary } from '../../api/groupFundings'
import { useMyProfile } from '../../hooks/useMyProfile'
import { MOCK_CANDIDATES, MOCK_DASHBOARD } from './groupMock'
import PlusIcon from '../../components/icons/PlusIcon'

// 접근: 전체 (비로그인 조회 OK, 투표는 로그인 필요, 후보 등록 버튼은 공동관리자 이상) | H02 선물 후보 목록
const MAX_VOTES = 3
const TOP_COUNT = 2

export default function CandidatesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: profile } = useMyProfile()

  const [candidates, setCandidates] = useState<GiftCandidateItem[]>([])
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set())
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<MemberSummary[]>([])

  useEffect(() => {
    if (!id) return
    Promise.allSettled([
      getGiftCandidates(id),
      getTogetherGiftDashboard(id),
    ]).then(([candidatesRes, dashboardRes]) => {
      if (import.meta.env.DEV) {
        setCandidates(MOCK_CANDIDATES.candidates)
        setVotedIds(new Set(MOCK_CANDIDATES.votedGiftIds))
      } else if (candidatesRes.status === 'fulfilled') {
        setCandidates(candidatesRes.value.candidates)
        setVotedIds(new Set(candidatesRes.value.votedGiftIds))
      }
      if (import.meta.env.DEV) {
        setMembers(MOCK_DASHBOARD.members)
      } else if (dashboardRes.status === 'fulfilled') {
        setMembers(dashboardRes.value.members)
      }
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  // 후보 등록 권한 = 내 역할이 HOST/CO_HOST. members[]에서 내 userId 매칭 (비로그인/미참여면 false)
  const myRole = members.find(m => m.userId === profile?.userId)?.role
  const isAdmin = myRole === 'HOST' || myRole === 'CO_HOST'

  const voteCount = votedIds.size
  const atMax = voteCount >= MAX_VOTES
  const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount)
  const topCandidates = sorted.slice(0, TOP_COUNT)

  const toggleVote = async (fundingGiftId: number) => {
    if (togglingId !== null) return
    if (atMax && !votedIds.has(fundingGiftId)) return

    setTogglingId(fundingGiftId)
    const wasVoted = votedIds.has(fundingGiftId)

    setVotedIds(prev => {
      const next = new Set(prev)
      if (wasVoted) next.delete(fundingGiftId)
      else next.add(fundingGiftId)
      return next
    })
    setCandidates(prev =>
      prev.map(c =>
        c.fundingGiftId === fundingGiftId
          ? { ...c, voteCount: c.voteCount + (wasVoted ? -1 : 1) }
          : c,
      ),
    )

    try {
      await toggleGiftVote(id!, fundingGiftId)
    } catch (e) {
      console.error('투표 실패', e)
      if (!import.meta.env.DEV) {
        setVotedIds(prev => {
          const next = new Set(prev)
          if (wasVoted) next.add(fundingGiftId)
          else next.delete(fundingGiftId)
          return next
        })
        setCandidates(prev =>
          prev.map(c =>
            c.fundingGiftId === fundingGiftId
              ? { ...c, voteCount: c.voteCount + (wasVoted ? 1 : -1) }
              : c,
          ),
        )
      }
    } finally {
      setTogglingId(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
        <Header title="선물 후보 더보기" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-b2-r text-gray-400">불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-8">
      <Header title="선물 후보 더보기" />

      {/* 후보 등록 배너 (관리자만) */}
      {isAdmin && (
        <button
          type="button"
          onClick={() => navigate(`/group/${id}/candidates/new`)}
          className="mx-[18px] mt-5 flex items-center gap-[10px] rounded-xl border border-gray-100 px-[14px] py-3"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-[6px] bg-background">
            <PlusIcon className="size-5 text-gray-600" />
          </div>
          <span className="text-b2-m text-black">새로운 선물 후보 등록하기</span>
        </button>
      )}

      {/* 섹션 1: 실시간 상위 후보 */}
      <section className="flex flex-col gap-5 px-[18px] pb-5 pt-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-h3-sb text-black">실시간 득표수가 높은 선물후보</h2>
          <p className="text-caption1-r text-gray-600">
            최대 3개까지 투표가 가능해요 ({voteCount}/{MAX_VOTES})
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {topCandidates.map((candidate, idx) => (
            <VoteCard
              key={candidate.fundingGiftId}
              candidate={candidate}
              fundingId={id!}
              rank={idx + 1}
              isVoted={votedIds.has(candidate.fundingGiftId)}
              disabled={atMax && !votedIds.has(candidate.fundingGiftId)}
              toggling={togglingId === candidate.fundingGiftId}
              onVote={() => toggleVote(candidate.fundingGiftId)}
            />
          ))}
        </div>
      </section>

      {/* 구분선 */}
      <div className="h-3 bg-background" />

      {/* 섹션 2: 전체 후보 */}
      <section className="flex flex-col gap-5 px-[18px] pb-5 pt-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-h3-sb text-black">선물 후보</h2>
          <p className="text-caption1-r text-[#888888]">한 명당 최대 3개까지 투표할 수 있어요</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {sorted.map((candidate, idx) => (
            <VoteCard
              key={candidate.fundingGiftId}
              candidate={candidate}
              fundingId={id!}
              rank={idx + 1}
              isVoted={votedIds.has(candidate.fundingGiftId)}
              disabled={atMax && !votedIds.has(candidate.fundingGiftId)}
              toggling={togglingId === candidate.fundingGiftId}
              onVote={() => toggleVote(candidate.fundingGiftId)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

interface VoteCardProps {
  candidate: GiftCandidateItem
  fundingId: string
  rank: number
  isVoted: boolean
  disabled: boolean
  toggling: boolean
  onVote: () => void
}

const RANK_COLORS: Record<number, string> = {
  1: 'bg-pink-500 text-white',
  2: 'bg-gray-900 text-white',
  3: 'bg-gray-900 text-white',
}

function VoteCard({ candidate, fundingId, rank, isVoted, disabled, toggling, onVote }: VoteCardProps) {
  const navigate = useNavigate()
  const rankBadge = RANK_COLORS[rank]

  return (
    <div className="flex w-full flex-col items-center rounded-[18px] border border-gray-100 p-[10px]">
      {/* 이미지: 탭하면 상세 이동 */}
      <button
        type="button"
        onClick={() => navigate(`/group/${fundingId}/candidates/${candidate.fundingGiftId}`, { state: { candidate } })}
        className="w-full"
      >
        <div className="relative flex size-[154px] shrink-0 items-center justify-center rounded-xl bg-background">
          {candidate.giftImageUrl ? (
            <img
              src={candidate.giftImageUrl}
              alt={candidate.giftName}
              className="size-full rounded-xl object-cover"
            />
          ) : (
            <div className="size-full rounded-xl bg-background" />
          )}
        </div>
      </button>

      {/* 상품 정보 */}
      <div className="mt-2 flex w-full flex-col gap-[3.5px]">
        <div className="flex items-center gap-2">
          {rankBadge && (
            <span className={`rounded-full px-[8px] py-[2px] text-caption2-m ${rankBadge}`}>
              {rank}위
            </span>
          )}
          <span className="text-caption2-m text-gray-600">{candidate.voteCount}명 투표</span>
        </div>
        <p className="line-clamp-2 text-caption1-m leading-snug text-black">{candidate.giftName}</p>
        <p className="text-caption1-m text-black">{candidate.giftPrice.toLocaleString()}원</p>
      </div>

      {/* 투표 버튼 */}
      <button
        type="button"
        onClick={onVote}
        disabled={disabled || toggling}
        className={`mt-2 h-[26px] w-full rounded-lg text-caption2-m transition-colors ${
          isVoted
            ? 'bg-gray-900 text-white'
            : disabled
              ? 'bg-gray-100 text-gray-400'
              : 'bg-gray-100 text-black'
        }`}
      >
        투표하기
      </button>
    </div>
  )
}
