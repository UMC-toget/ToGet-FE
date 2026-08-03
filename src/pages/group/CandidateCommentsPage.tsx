import { useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import { getGiftCandidateDetail } from '../../api/groupFundings'
import type { GiftCandidateComment, GiftCandidateDetail } from '../../api/groupFundings'
import { MOCK_CANDIDATE_DETAIL } from './groupMock'

// 접근: 전체 (비로그인 조회 OK, 의견 작성은 로그인 필요) | 선물 후보 의견 목록
export default function CandidateCommentsPage() {
  const { id, candidateId } = useParams()
  const { state } = useLocation()

  const [candidate, setCandidate] = useState<GiftCandidateDetail | null>(null)
  const [comments, setComments] = useState<GiftCandidateComment[]>([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id || !candidateId) return
    getGiftCandidateDetail(id, candidateId)
      .then(data => {
        setCandidate(data)
        setComments(data.comments)
      })
      .catch(() => {
        if (import.meta.env.DEV) {
          const fromList = state?.candidate
          const mock = fromList
            ? { ...MOCK_CANDIDATE_DETAIL, ...fromList }
            : MOCK_CANDIDATE_DETAIL
          setCandidate(mock)
          setComments(mock.comments)
        }
      })
      .finally(() => setLoading(false))
  }, [id, candidateId])

  const submitComment = () => {
    const text = commentText.trim()
    if (!text) return
    setComments(prev => [
      ...prev,
      { commentId: Date.now(), authorName: '나', authorProfileImageUrl: null, content: text },
    ])
    setCommentText('')
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
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-[94px]">
      <Header title="후보 선택" />

      {/* 미니 후보 카드 */}
      <div className="py-4">
        <div className="mx-auto w-[193px] overflow-hidden rounded-xl border border-gray-300">
          {/* 이미지 */}
          <div className="h-[116px] w-full bg-background">
            {candidate.giftImageUrl ? (
              <img src={candidate.giftImageUrl} alt={candidate.giftName} className="size-full object-contain" />
            ) : (
              <div className="size-full" />
            )}
          </div>
          {/* 텍스트 */}
          <div className="flex flex-col gap-[5px] bg-white px-[9px] pb-3 pt-2">
            <p className="line-clamp-2 text-[9px] font-semibold text-black">{candidate.giftName}</p>
            <p className="text-[8px] text-pink-400">{candidate.voteCount}명 투표</p>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-medium text-black">{candidate.giftPrice.toLocaleString()}원</span>
              {candidate.giftPurchaseUrl && (
                <a
                  href={candidate.giftPurchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[3px] border border-gray-100 bg-background px-1.5 py-0.5 text-[7px] text-black"
                >
                  구매링크
                </a>
              )}
            </div>
            <div className="flex items-center gap-1">
              <div className="size-[9px] shrink-0 rounded-full bg-[#F7F5F8]" />
              <span className="text-[7px] text-gray-500">{candidate.registrantName} 등록</span>
            </div>
            {candidate.note && (
              <div className="rounded bg-background px-1.5 py-1">
                <p className="text-[7px] leading-relaxed text-gray-700">{candidate.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="mt-4 h-3 bg-background" />

      {/* 의견 목록 */}
      <div className="flex flex-col gap-5 px-[18px] py-5">
        <span className="text-h3-sb text-black">의견</span>

        {comments.length === 0 ? (
          <p className="text-b2-r text-gray-400">아직 의견이 없어요</p>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map(comment => (
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

      {/* 하단 고정 입력창 */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 border-t border-background bg-white px-[14px] pb-[23px] pt-3">
        <div className="flex items-center gap-2">
          <div className="size-12 shrink-0 rounded-full bg-gray-300" />
          <input
            ref={inputRef}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitComment() }}
            className="h-10 flex-1 rounded-full border border-[#D5D2D5] bg-white px-[14px] text-b2-r text-black outline-none placeholder:text-gray-400"
            placeholder="의견을 작성해주세요."
          />
        </div>
      </div>
    </div>
  )
}
