import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import { MOCK_GROUP } from './groupMock'
import type { GroupCandidate } from '../../types/group'

const MAX_VOTES = 3

const RANK_BADGE: Record<number, string> = {
  1: 'bg-pink-500 text-white',
  2: 'bg-gray-900 text-white',
  3: 'bg-gray-900 text-white',
}

export default function CandidatesPage() {
  useParams()

  const [votedIds, setVotedIds] = useState<Set<string>>(
    () => new Set(MOCK_GROUP.candidates.filter(c => c.isVotedByMe).map(c => c.id)),
  )

  const voteCount = votedIds.size
  const atMax = voteCount >= MAX_VOTES

  const sorted = [...MOCK_GROUP.candidates].sort((a, b) => b.voteCount - a.voteCount)

  const toggleVote = (candidateId: string) => {
    setVotedIds(prev => {
      const next = new Set(prev)
      if (next.has(candidateId)) {
        next.delete(candidateId)
      } else if (!atMax) {
        next.add(candidateId)
      }
      return next
    })
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-8">
      <Header title="후보 선택" />

      {/* 투표 현황 */}
      <div className="flex items-center justify-between border-b border-gray-100 px-[18px] py-3">
        <span className="text-b2-r text-gray-600">마음에 드는 후보에 투표해요</span>
        <span className="text-b2-m">
          <span className={atMax ? 'text-pink-500' : 'text-black'}>{voteCount}</span>
          <span className="text-gray-400"> / {MAX_VOTES}표</span>
        </span>
      </div>

      {/* 후보 목록 */}
      <div className="flex flex-col gap-5 px-[18px] py-5">
        {sorted.map((candidate, idx) => (
          <CandidateListCard
            key={candidate.id}
            candidate={candidate}
            rank={idx + 1}
            isVoted={votedIds.has(candidate.id)}
            disabled={atMax && !votedIds.has(candidate.id)}
            onVote={() => toggleVote(candidate.id)}
          />
        ))}
      </div>
    </div>
  )
}

interface CandidateListCardProps {
  candidate: GroupCandidate
  rank: number
  isVoted: boolean
  disabled: boolean
  onVote: () => void
}

function CandidateListCard({ candidate, rank, isVoted, disabled, onVote }: CandidateListCardProps) {
  const rankBadge = RANK_BADGE[rank]

  return (
    <div className="overflow-hidden rounded-[18px] border border-gray-100">
      {/* 이미지 + 정보 오버레이 */}
      <div className="relative h-[190px] w-full bg-background">
        {candidate.giftImageUrl && (
          <img
            src={candidate.giftImageUrl}
            alt={candidate.giftName}
            className="size-full object-cover"
          />
        )}

        {/* 후보 정보 카드 (피그마 #2859:91337, bg-background, rounded-20px) */}
        <div className="absolute inset-x-[10px] top-[11px] rounded-[20px] border border-gray-100 bg-background px-4 py-3">
          <div className="flex flex-col gap-[5px]">
            <p className="text-h3-sb text-black line-clamp-1">{candidate.giftName}</p>
            <p className="text-caption1-r text-pink-400">{candidate.voteCount}명 투표</p>
            <div className="flex items-center justify-between">
              <span className="text-h3-m text-black">{candidate.giftPrice.toLocaleString()}원</span>
              <button
                type="button"
                className="rounded px-[10px] py-[5px] text-caption2-m text-black"
                style={{ background: '#F5F4F5' }}
              >
                구매링크
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 순위 + 투표 버튼 */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {rankBadge && (
            <span className={`rounded-full px-2 py-0.5 text-caption2-m ${rankBadge}`}>
              {rank}위
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onVote}
          disabled={disabled}
          className={`rounded-lg px-5 py-2 text-b2-m transition-colors ${
            isVoted
              ? 'bg-pink-500 text-white'
              : disabled
                ? 'border border-gray-200 text-gray-400'
                : 'border border-gray-300 text-black'
          }`}
        >
          {isVoted ? '선택함' : '선택하기'}
        </button>
      </div>
    </div>
  )
}
