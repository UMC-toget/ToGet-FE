import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { FundingDetail, FundingMessage } from '../../types/funding'
import { formatDateKorean, getDdayLabel } from '../../utils/formatDate'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'
import Toast from '../../components/common/Toast'
import { useMockFunding } from './useMockFunding'
import { getMessageDisplayName } from './messageUtils'
import { useFundingCreateStore } from '../../store/fundingCreateStore'
import { buildFundingFromStore, getThumbnailSrc } from './buildFundingFromStore'
import ProgressCard from './ProgressCard'
import MessageSection from './MessageSection'
import LetterModal from './LetterModal'
import ParticipantList from './ParticipantList'
import { getMyGiftDashboard, dashboardToFundingDetail, updateFundingStatus, getSharedFunding, sharedFundingToFundingDetail } from '../../api/fundings'
import { getContributions, getContribution } from '../../api/contributions'

type OwnerTab = 'mine' | 'participants'

const TOAST_DURATION_MS = 2500

/**
 * E02) 내 선물 참여: 선물 페이지 (/funding/:id)
 * E01 초대장에서 '축하하러 가기'로 진입하는 펀딩 상세.
 * D04 공개 범위 토글 5개에 따라 조건부 렌더링됨 (ProgressCard/MessageSection 참조).
 */
export default function FundingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [openedMessage, setOpenedMessage] = useState<FundingMessage | null>(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<OwnerTab>('mine')
  const mockFunding = useMockFunding()
  const [realFunding, setRealFunding] = useState<FundingDetail | null>(null)
  const [thumbnailApiUrl, setThumbnailApiUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const store = useFundingCreateStore()

  // 개설자: my-gift 대시보드, 비개설자: shared-fundings + 메세지는 공통으로 contributions 사용
  useEffect(() => {
    if (!id) return
    Promise.all([
      getMyGiftDashboard(id).catch(() => null),
      getContributions(id).catch(() => null),
    ]).then(async ([dashboard, contribs]) => {
      const messages: FundingMessage[] = (contribs?.contributions ?? []).map((c) => ({
        id: String(c.contributionId),
        senderName: c.isAnonymous ? null : c.senderName,
        content: c.content,
        isPrivate: c.isPrivate,
        isAnonymous: c.isAnonymous,
      }))

      if (dashboard) {
        setRealFunding(dashboardToFundingDetail(dashboard, messages))
        setThumbnailApiUrl(dashboard.thumbnailImageUrl ?? null)
        return
      }

      // 비개설자(또는 비로그인): shared-fundings 조회
      try {
        const shared = await getSharedFunding(id)
        setRealFunding(sharedFundingToFundingDetail(shared, messages))
        setThumbnailApiUrl(shared.thumbnailImageUrl ?? null)
      } catch {
        // shared-fundings도 실패하면 mock 유지
      }
    }).finally(() => setIsLoading(false))
  }, [id])

  // 실제 API 데이터 우선, 없으면 mock (비개설자 또는 API 실패 시)
  const funding = realFunding ?? mockFunding
  const { revertToOriginal } = store

  // 실제 API 데이터가 있으면 그대로 사용 (API = source of truth)
  // mock 모드면 스토어 오버레이 유지 (편집 데모 플로우용)
  const displayFunding = realFunding ?? (mockFunding.isOwner ? buildFundingFromStore(store, mockFunding) : mockFunding)
  const thumbnailSrc = realFunding
    ? thumbnailApiUrl
    : mockFunding.isOwner ? getThumbnailSrc(store.thumbnailImage) : null

  // 수정 화면(FundingEditSelectPage)에서 navigate state로 전달한 토스트를 일정 시간 표시
  const [toastState, setToastState] = useState<{ message: string; undo?: boolean } | null>(
    () => (location.state as { toast?: string; undo?: boolean } | null)?.toast
      ? { message: (location.state as { toast: string; undo?: boolean }).toast, undo: (location.state as { toast: string; undo?: boolean }).undo }
      : null,
  )

  useEffect(() => {
    if (toastState === null) return
    navigate(location.pathname, { replace: true, state: null })
    const timer = setTimeout(() => setToastState(null), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastState])

  const handleUndo = () => {
    revertToOriginal()
    setToastState(null)
  }

  const handleEndFunding = async () => {
    if (!id) return
    try {
      await updateFundingStatus(id, 'ENDED')
      setRealFunding(prev => prev ? { ...prev, status: 'ENDED' } : null)
    } catch (e) {
      console.error('마감 처리 실패', e)
    }
    setShowEndConfirm(false)
  }

  const handleOpenMessage = async (message: FundingMessage) => {
    if (message.content !== null) {
      setOpenedMessage(message)
      return
    }
    if (!id) return
    try {
      const detail = await getContribution(id, message.id)
      setOpenedMessage({ ...message, content: detail.content })
    } catch {
      setOpenedMessage(message)
    }
  }

  const isEnded = displayFunding.status === 'ENDED'
  const showBottomBar = !funding.isOwner || activeTab === 'mine'
  const showParticipants = funding.isOwner && activeTab === 'participants'

  return (
    <div className={`mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white ${showBottomBar ? 'pb-[140px]' : 'pb-6'}`}>
      <Header
        title={isLoading ? '' : `${displayFunding.hostName}님의 선물 페이지`}
        onBack={() => navigate('/home')}
      />

      <div className={`flex flex-1 flex-col ${isLoading ? 'invisible' : ''}`}>
      {funding.isOwner && (
        <div className="mx-[18px] mt-6 flex gap-1 rounded-lg bg-gray-100 p-[5px] text-center text-gray-600">
          <button
            type="button"
            onClick={() => setActiveTab('mine')}
            className={`flex-1 rounded-[4px] py-2.5 text-b2-m transition-colors ${activeTab === 'mine' ? 'bg-white text-black' : 'text-gray-600'}`}
          >
            내 선물 페이지
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('participants')}
            className={`flex-1 rounded-[4px] py-2.5 text-b2-m transition-colors ${activeTab === 'participants' ? 'bg-white text-black' : 'text-gray-600'}`}
          >
            참여자 목록
          </button>
        </div>
      )}

      {showParticipants ? (
        <div className="flex min-h-0 flex-1 flex-col px-[18px] pt-4">
          <ParticipantList />
        </div>
      ) : (
        <>
          {/* D 섹션: 대표 이미지가 있으면 실제 이미지, 없으면 placeholder */}
          <section className={`relative flex h-[190px] w-full items-center justify-center overflow-hidden bg-black/40 ${funding.isOwner ? 'mt-3' : ''}`}>
            {thumbnailSrc ? (
              <img src={thumbnailSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <p className="text-caption1-r text-[#888888]">대표 이미지 삽입 영역</p>
            )}
            <div className="absolute inset-x-[18px] top-6 flex items-start justify-between">
              <span className="rounded-full border border-gray-300 bg-white px-4 py-2 text-b2-m leading-normal text-gray-700">
                {displayFunding.category}
              </span>
              {isEnded ? (
                <span className="rounded-full bg-gray-900 px-4 py-2 text-b2-m leading-normal text-white">
                  마감된 페이지
                </span>
              ) : (
                <span className="rounded-full border border-gray-300 bg-white px-4 py-2 text-b2-m leading-normal text-gray-700">
                  {getDdayLabel(displayFunding.anniversaryDate)}
                </span>
              )}
            </div>
          </section>

          <div className="mt-8 flex flex-col gap-8 px-[18px]">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-h3-sb leading-normal text-black">{displayFunding.title}</h1>
                <div className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-background-2" />
                  <p className="text-b2-r leading-normal text-gray-600">
                    {displayFunding.hostFullName}·{formatDateKorean(new Date(displayFunding.anniversaryDate))}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex min-h-[168px] items-center justify-center rounded-xl border border-gray-200 bg-background-2 px-3.5 py-3">
                  <p className="whitespace-pre-line text-center text-b2-m leading-normal text-gray-800">
                    {displayFunding.greeting}
                  </p>
                </div>
                <ProgressCard funding={displayFunding} />
              </div>
            </div>

            <MessageSection funding={displayFunding} onOpenMessage={handleOpenMessage} />
          </div>
        </>
      )}

      {showBottomBar && (
        <div className="pointer-events-none fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-gradient-to-b from-white/0 to-white/80 px-[18px] pb-[34px] pt-10">
          {funding.isOwner ? (
            <div className="pointer-events-auto flex gap-3">
              {isEnded ? (
                <button
                  type="button"
                  onClick={() => navigate(`/gift/review/write/gift/${id}`)}
                  className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-gray-600 bg-white text-sm font-semibold text-black"
                >
                  선물 후기 남기기
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowEndConfirm(true)}
                  className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-gray-600 bg-white text-sm font-semibold text-black"
                >
                  페이지 종료하기
                </button>
              )}
              <Button className="flex-1" onClick={() => navigate(`/funding/${id}/edit`)}>
                수정하기
              </Button>
            </div>
          ) : (
            <Button
              className="pointer-events-auto"
              onClick={() => navigate(`/funding/${id}/participate`, { state: { hostName: displayFunding.hostName, anniversaryDate: displayFunding.anniversaryDate } })}
            >
              마음 전하기
            </Button>
          )}
        </div>
      )}
      </div>

      {/* content가 null이면(BE 계약 불일치 방어) 빈 편지 대신 모달을 열지 않음 */}
      <LetterModal
        open={openedMessage?.content != null}
        hostName={displayFunding.hostName}
        content={openedMessage?.content ?? ''}
        senderLabel={openedMessage ? getMessageDisplayName(openedMessage, displayFunding) : null}
        onClose={() => setOpenedMessage(null)}
      />

      <ConfirmModal
        open={showEndConfirm}
        title="아직 종료일이 남아있어요"
        description={'지금 종료하면 현재 금액으로 확정되고,\n친구들은 더 이상 참여할 수 없어요.'}
        cancelText="취소하기"
        confirmText="종료하기"
        onCancel={() => setShowEndConfirm(false)}
        onConfirm={handleEndFunding}
      />

      <Toast
        open={toastState !== null}
        message={toastState?.message ?? ''}
        actionLabel={toastState?.undo ? '실행취소' : undefined}
        onAction={handleUndo}
      />
    </div>
  )
}
