import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import { getGiftCandidateDetail, toggleGiftVote } from '../../api/groupFundings'
import type { GiftCandidateDetail } from '../../api/groupFundings'
import { MOCK_CANDIDATE_DETAIL } from './groupMock'

/** H 섹션: 선물 후보 상세 — 피그마 "공동관리자 ver : 후보선택" */
export default function CandidateDetailPage() {
  const { id, candidateId } = useParams()

  const [candidate, setCandidate] = useState<GiftCandidateDetail | null>(null)
  const [isVoted, setIsVoted] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [loading, setLoading] = useState(true)
  const [commentOpen, setCommentOpen] = useState(false)
  const commentInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id || !candidateId) return
    getGiftCandidateDetail(id, candidateId)
      .then(data => {
        setCandidate(data)
        setIsVoted(data.isVotedByMe)
      })
      .catch(() => {
        if (import.meta.env.DEV) {
          setCandidate(MOCK_CANDIDATE_DETAIL)
          setIsVoted(MOCK_CANDIDATE_DETAIL.isVotedByMe)
        }
      })
      .finally(() => setLoading(false))
  }, [id, candidateId])

  useEffect(() => {
    if (commentOpen) commentInputRef.current?.focus()
  }, [commentOpen])

  const vote = async () => {
    if (!candidate || toggling) return
    setToggling(true)
    const wasVoted = isVoted
    setIsVoted(!wasVoted)
    setCandidate(prev => prev && { ...prev, voteCount: prev.voteCount + (wasVoted ? -1 : 1) })
    try {
      await toggleGiftVote(id!, candidate.fundingGiftId)
    } catch (e) {
      console.error('투표 실패', e)
      if (!import.meta.env.DEV) {
        setIsVoted(wasVoted)
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
        <div className="flex flex-col gap-[6px]">
          <h2 className="text-h3-sb text-black">{candidate.giftName}</h2>
          <p className="text-caption1-r text-pink-500">{candidate.voteCount}명 투표</p>
          <div className="flex items-center justify-between">
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
            onClick={() => setCommentOpen(true)}
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
                <div className="flex flex-col gap-[2px]">
                  <span className="text-caption1-r text-gray-600">{comment.authorName}</span>
                  <p className="text-b2-r text-gray-800">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 고정: 댓글 입력창 or 투표 버튼 */}
      {commentOpen ? (
        <div className="fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 border-t border-background bg-white px-[14px] pb-[23px] pt-3">
          <div className="flex items-center gap-2">
            <div className="size-12 shrink-0 rounded-full bg-gray-300" />
            <input
              ref={commentInputRef}
              className="h-10 flex-1 rounded-full border border-[#D5D2D5] bg-white px-[14px] text-b2-r text-black outline-none placeholder:text-gray-400"
              placeholder="의견을 작성해주세요."
            />
          </div>
        </div>
      ) : (
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
      )}
    </div>
  )
}
