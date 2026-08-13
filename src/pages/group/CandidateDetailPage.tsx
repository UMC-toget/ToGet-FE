import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Toast from '../../components/common/Toast'
import { getGiftCandidateDetail, getGiftCandidates, toggleGiftVote } from '../../api/groupFundings'
import type { GiftCandidateDetail } from '../../api/groupFundings'
import { MOCK_CANDIDATE_DETAIL, MOCK_CANDIDATES } from './groupMock'

// 접근: 전체 (비로그인 조회 OK, 투표는 로그인 필요) | 선물 후보 상세 페이지
const MAX_VOTES = 3
export default function CandidateDetailPage() {
  const { id, candidateId } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()

  const [candidate, setCandidate] = useState<GiftCandidateDetail | null>(null)
  const [isVoted, setIsVoted] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [loading, setLoading] = useState(true)
  // 내가 이 펀딩에서 투표한 총 개수 (3개 초과 방지용). 이 후보 포함
  const [votedCount, setVotedCount] = useState(0)
  const [limitToastOpen, setLimitToastOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    getGiftCandidates(id)
      .then(res => setVotedCount(res.votedGiftIds.length))
      .catch(() => { if (import.meta.env.DEV) setVotedCount(MOCK_CANDIDATES.votedGiftIds.length) })
  }, [id])

  useEffect(() => {
    if (!id || !candidateId) return
    getGiftCandidateDetail(id, candidateId)
      .then(data => {
        setCandidate(data)
        setIsVoted(data.isVotedByMe)
      })
      .catch(() => {
        if (import.meta.env.DEV) {
          const fromList = state?.candidate
          setCandidate(fromList
            ? { ...MOCK_CANDIDATE_DETAIL, ...fromList }
            : MOCK_CANDIDATE_DETAIL,
          )
          setIsVoted(MOCK_CANDIDATE_DETAIL.isVotedByMe)
        }
      })
      .finally(() => setLoading(false))
  }, [id, candidateId, state?.candidate])

  const vote = async () => {
    if (!candidate || toggling) return
    const wasVoted = isVoted
    // 이미 3개 투표한 상태에서 새 후보 선택 시도 → 선택 막고 안내 토스트
    if (!wasVoted && votedCount >= MAX_VOTES) {
      setLimitToastOpen(true)
      setTimeout(() => setLimitToastOpen(false), 2000)
      return
    }
    setToggling(true)
    setIsVoted(!wasVoted)
    setVotedCount(c => c + (wasVoted ? -1 : 1))
    setCandidate(prev => prev && { ...prev, voteCount: prev.voteCount + (wasVoted ? -1 : 1) })
    try {
      await toggleGiftVote(id!, candidate.fundingGiftId)
    } catch (e) {
      console.error('투표 실패', e)
      if (!import.meta.env.DEV) {
        setIsVoted(wasVoted)
        setVotedCount(c => c + (wasVoted ? 1 : -1))
        setCandidate(prev => prev && { ...prev, voteCount: prev.voteCount + (wasVoted ? 1 : -1) })
      }
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
        <Header title="후보 선택" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-b2-r text-gray-400">불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
        <Header title="후보 선택" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-b2-r text-gray-400">후보 정보를 불러올 수 없어요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-[120px]">
      <Header title="후보 선택" />

      {/* 상품 이미지 */}
      <div className="h-[260px] w-full bg-background">
        {candidate.giftImageUrl ? (
          <img src={candidate.giftImageUrl} alt={candidate.giftName} className="size-full object-cover" />
        ) : (
          <div className="size-full" />
        )}
      </div>

      {/* 상품 정보 */}
      <div className="flex flex-col gap-4 px-[18px] py-5">
        {/* 이름 + 투표수 + 가격/구매링크 */}
        <div className="flex flex-col">
          <h2 className="text-h3-sb text-black">{candidate.giftName}</h2>
          <p className="mt-4 text-caption1-r text-pink-500">{candidate.voteCount}명 투표</p>
          <div className="mt-[6px] flex items-center justify-between">
            <span className="text-[18px] font-medium leading-[22px] text-black">
              {candidate.giftPrice.toLocaleString()}원
            </span>
            {candidate.giftPurchaseUrl && (
              <a
                href={candidate.giftPurchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[4px] bg-background px-[10px] py-2 text-caption2-m text-black"
              >
                구매링크
              </a>
            )}
          </div>
        </div>

        {/* 등록자 + 추천 이유 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {candidate.registrantProfileImageUrl ? (
              <img
                src={candidate.registrantProfileImageUrl}
                alt={candidate.registrantName}
                className="size-5 rounded-full object-cover"
              />
            ) : (
              <div className="size-5 shrink-0 rounded-full bg-[#F7F5F8]" />
            )}
            <span className="text-b2-r text-gray-600">{candidate.registrantName} 등록</span>
          </div>
          {candidate.note && (
            <div className="rounded-lg bg-background px-[14px] py-3">
              <p className="text-b2-r text-gray-800">{candidate.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* 구분선 */}
      <div className="h-3 bg-background" />

      {/* 의견 섹션 */}
      <div className="flex flex-col gap-5 px-[18px] py-5">
        <div className="flex items-center justify-between">
          <span className="text-h3-sb text-black">의견</span>
          <button
            type="button"
            onClick={() => navigate(`/group/${id}/candidates/${candidateId}/comments`, { state: { candidate } })}
            className="rounded-[4px] bg-gray-900 px-[10px] py-2 text-caption2-m text-white"
          >
            댓글달기
          </button>
        </div>

        {candidate.comments.length === 0 ? (
          <p className="text-b2-r text-gray-400">아직 의견이 없어요</p>
        ) : (
          <div className="flex flex-col gap-5">
            {candidate.comments.map(comment => (
              <div key={comment.commentId} className="flex gap-3">
                {comment.authorProfileImageUrl ? (
                  <img
                    src={comment.authorProfileImageUrl}
                    alt={comment.authorName}
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-10 shrink-0 rounded-full bg-[#F7F5F8]" />
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-caption1-r text-gray-600">{comment.authorName}</span>
                  <p className="text-b2-r text-gray-800">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toast open={limitToastOpen} message="선물은 최대 3개까지 투표 가능합니다." bottomClass="bottom-[110px]" />

      {/* 하단 고정: 투표 버튼 */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-white px-[18px] pb-[34px] pt-4">
        <button
          type="button"
          onClick={vote}
          disabled={toggling}
          className={`h-[52px] w-full rounded-xl text-b1-m text-white transition-colors ${
            isVoted ? 'bg-gray-900' : 'bg-[#C1BCC0]'
          }`}
        >
          투표하기
        </button>
      </div>
    </div>
  )
}
