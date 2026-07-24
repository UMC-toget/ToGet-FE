import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { FundingMessage } from '../../types/funding'
import { formatDateKorean, getDdayLabel } from '../../utils/formatDate'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'
import Toast from '../../components/common/Toast'
import { useMockFunding } from './useMockFunding'
import { getMessageDisplayName } from './messageUtils'
import { useFundingCreateStore } from '../../store/fundingCreateStore'
import { buildFundingFromStore, getThumbnailSrc } from './buildFundingFromStore'
import { getMockEditData } from './editFundingMock'
import ProgressCard from './ProgressCard'
import MessageSection from './MessageSection'
import LetterModal from './LetterModal'
import ParticipantList from './ParticipantList'

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
  const funding = useMockFunding()
  const store = useFundingCreateStore()
  const { editFundingId, title: storeTitle, commitAsFunding, loadForEdit, revertToOriginal } = store

  // 개설자 뷰인데 이 fundingId가 아직 스토어에 반영돼 있지 않다면:
  // - 이번 세션에 만들기 플로우로 실제 입력한 내용이 있으면(title 존재) 그 값을 그대로 원본으로 확정하고
  // - 아무것도 입력한 적이 없으면(콜드 진입) 데모용 기본값으로 채워 넣습니다.
  useEffect(() => {
    if (!funding.isOwner || !id) return
    if (editFundingId === id) return
    if (storeTitle.trim()) {
      commitAsFunding(id)
    } else {
      loadForEdit(id, getMockEditData())
    }
  }, [funding.isOwner, id, editFundingId, storeTitle, commitAsFunding, loadForEdit])

  const displayFunding = funding.isOwner ? buildFundingFromStore(store, funding) : funding
  const thumbnailSrc = funding.isOwner ? getThumbnailSrc(store.thumbnailImage) : null

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

  const handleEndFunding = () => {
    // TODO: 펀딩 마감 처리 정책(BE) 확정 후 실제 종료 API 연결
    setShowEndConfirm(false)
  }

  const showBottomBar = !funding.isOwner || activeTab === 'mine'
  const showParticipants = funding.isOwner && activeTab === 'participants'

  return (
    <div className={`mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white ${showBottomBar ? 'pb-[140px]' : 'pb-6'}`}>
      <Header title={`${displayFunding.hostName}님의 선물 페이지`} />

      {funding.isOwner && (
        <div className="mx-[18px] mt-3 flex gap-1 rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('mine')}
            className={`flex-1 rounded-[4px] py-2 text-b2-m transition-colors ${activeTab === 'mine' ? 'bg-white text-black' : 'text-gray-600'}`}
          >
            내 선물 페이지
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('participants')}
            className={`flex-1 rounded-[4px] py-2 text-b2-m transition-colors ${activeTab === 'participants' ? 'bg-white text-black' : 'text-gray-600'}`}
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
          <section className={`relative flex h-[190px] w-full items-center justify-center overflow-hidden bg-gradient-to-t from-[#984463]/50 to-[#666666]/20 ${funding.isOwner ? 'mt-3' : ''}`}>
            {thumbnailSrc ? (
              <img src={thumbnailSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <p className="text-caption1-r text-[#888888]">대표 이미지 삽입 영역</p>
            )}
            <div className="absolute inset-x-[18px] top-6 flex items-start justify-between">
              <span className="rounded-full border border-gray-300 bg-white px-4 py-2 text-b2-m leading-normal text-gray-700">
                {displayFunding.category}
              </span>
              <span className="rounded-full border border-gray-300 bg-white px-4 py-2 text-b2-m leading-normal text-gray-700">
                {getDdayLabel(displayFunding.anniversaryDate)}
              </span>
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

            <MessageSection funding={displayFunding} onOpenMessage={setOpenedMessage} />
          </div>
        </>
      )}

      {showBottomBar && (
        <div className="pointer-events-none fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-gradient-to-b from-white/0 to-white/80 px-[18px] pb-[34px] pt-10">
          {funding.isOwner ? (
            <div className="pointer-events-auto flex gap-3">
              {/* 14px SemiBold는 @theme에 대응 토큰이 없어 일반 유틸 사용 (B2_SB 토큰 추가는 디자이너 확인 필요) */}
              <button
                type="button"
                onClick={() => setShowEndConfirm(true)}
                className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-gray-600 bg-white text-sm font-semibold text-black"
              >
                페이지 종료하기
              </button>
              <Button className="flex-1" onClick={() => navigate(`/funding/${id}/edit`)}>
                수정하기
              </Button>
            </div>
          ) : (
            // TODO: E03(#28) 머지 전까지는 /funding/:id/participate 라우트가 없어 빈 화면으로 이동함
            <Button
              className="pointer-events-auto"
              onClick={() => navigate(`/funding/${id}/participate`)}
            >
              마음 전하기
            </Button>
          )}
        </div>
      )}

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
