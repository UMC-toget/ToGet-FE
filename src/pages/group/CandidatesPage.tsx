import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import PlusIcon from '../../components/icons/PlusIcon'
import { getGiftCandidates, getTogetherGiftDashboard, toggleGiftVote } from '../../api/groupFundings'
import type { GiftCandidateItem, MemberSummary } from '../../api/groupFundings'
import { useMyProfile } from '../../hooks/useMyProfile'
import { MOCK_CANDIDATES, MOCK_DASHBOARD } from './groupMock'

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
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.allSettled([
      getGiftCandidates(id),
      getTogetherGiftDashboard(id),
    ]).then(([candidatesRes, dashboardRes]) => {
      if (candidatesRes.status === 'fulfilled') {
        setCandidates(candidatesRes.value.candidates)
        setVotedIds(new Set(candidatesRes.value.votedGiftIds))
      } else if (import.meta.env.DEV) {
        setCandidates(MOCK_CANDIDATES.candidates)
        setVotedIds(new Set(MOCK_CANDIDATES.votedGiftIds))
      }
      if (dashboardRes.status === 'fulfilled') {
        setMembers(dashboardRes.value.members)
      } else if (import.meta.env.DEV) {
        setMembers(MOCK_DASHBOARD.members)
      }
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    // TODO: 테스트용 임시 고정 — 확인 후 원래 코드로 교체
    setIsAdmin(true)
    // if (!profile || members.length === 0) return
    // const myRole = members.find(m => m.userId === profile.userId)?.role
    // setIsAdmin(myRole === 'HOST' || myRole === 'CO_HOST')
  }, [profile, members])

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

  const adminRight = isAdmin ? (
    <button
      type="button"
      onClick={() => navigate(`/group/${id}/candidates/new`)}
      className="flex items-center gap-1 text-b2-m text-pink-500"
    >
      <PlusIcon className="size-4" />
      후보 등록
    </button>
  ) : undefined

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
      <Header title="선물 후보 더보기" right={adminRight} />

      {/* 섹션 1: 상위 후보 */}
      <section className="flex flex-col gap-4 px-[18px] py-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-h3-sb text-black">실시간 득표수가 높은 선물후보</h2>
          <p className="text-caption1-r text-gray-500">
            최대 3개까지 투표가 가능해요 ({voteCount}/{MAX_VOTES})
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
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
      <div className="h-2 bg-background" />

      {/* 섹션 2: 전체 후보 */}
      <section className="flex flex-col gap-4 px-[18px] py-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-h3-sb text-black">선물 후보</h2>
          <p className="text-caption1-r text-gray-500">한 명당 최대 3개까지 투표할 수 있어요</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
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

function VoteCard({ candidate, fundingId, rank, isVoted, disabled, toggling, onVote }: VoteCardProps) {
  const navigate = useNavigate()
  const showRank = rank <= 3
  const rankBadgeClass = rank === 1 ? 'bg-pink-500 text-white' : 'bg-gray-900 text-white'

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100">
      {/* 이미지 + 정보: 탭하면 상세 이동 */}
      <button
        type="button"
        onClick={() => navigate(`/group/${fundingId}/candidates/${candidate.fundingGiftId}`)}
        className="flex flex-col text-left"
      >
        <div className="h-[156px] w-full bg-background">
          {candidate.giftImageUrl ? (
            <img
              src={candidate.giftImageUrl}
              alt={candidate.giftName}
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full" />
          )}
        </div>

        <div className="flex flex-col gap-[6px] px-3 pt-3">
          <div className="flex items-center gap-1">
            {showRank && (
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-caption2-m ${rankBadgeClass}`}>
                {rank}위
              </span>
            )}
            <span className="text-caption1-r text-gray-500">{candidate.voteCount}명 투표</span>
          </div>
          <p className="line-clamp-2 break-keep text-b2-m text-black">{candidate.giftName}</p>
          <p className="text-b2-m text-gray-700">{candidate.giftPrice.toLocaleString()}원</p>
        </div>
      </button>

      {/* 투표 버튼: 카드 이동과 별개 */}
      <div className="px-3 pb-3 pt-2">
        <button
          type="button"
          onClick={onVote}
          disabled={disabled || toggling}
          className={`w-full rounded-lg py-2 text-b2-m transition-colors ${
            isVoted
              ? 'bg-gray-900 text-white'
              : disabled
                ? 'bg-gray-100 text-gray-400'
                : 'bg-[#C1BCC0] text-white'
          }`}
        >
          투표하기
        </button>
      </div>
    </div>
  )
}
