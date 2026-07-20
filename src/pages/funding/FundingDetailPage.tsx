import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { FundingMessage } from '../../types/funding'
import { formatDateKorean } from '../../utils/formatDate'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import { useMockFunding } from './useMockFunding'
import { getMessageDisplayName } from './messageUtils'
import ProgressCard from './ProgressCard'
import MessageSection from './MessageSection'
import LetterModal from './LetterModal'

/** 기념일까지 남은 날을 D-7 / D-day / D+3 형식으로 변환. 날짜가 유효하지 않으면 빈 문자열 */
function getDdayLabel(dateString: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateString)
  target.setHours(0, 0, 0, 0)
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (Number.isNaN(diff)) return ''
  if (diff === 0) return 'D-day'
  return diff > 0 ? `D-${diff}` : `D+${-diff}`
}

/**
 * E02) 내 선물 참여: 선물 페이지 (/funding/:id)
 * E01 초대장에서 '축하하러 가기'로 진입하는 펀딩 상세.
 * D04 공개 범위 토글 5개에 따라 조건부 렌더링됨 (ProgressCard/MessageSection 참조).
 */
export default function FundingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [openedMessage, setOpenedMessage] = useState<FundingMessage | null>(null)
  const funding = useMockFunding()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-[140px]">
      <Header title={`${funding.hostName}님의 선물 페이지`} />

      {funding.isOwner && (
        <div className="mx-[18px] mt-3 flex gap-1 rounded-lg bg-gray-100 p-1">
          <button type="button" className="flex-1 rounded-[4px] bg-white py-2 text-b2-m text-black">
            내 선물 페이지
          </button>
          {/* TODO: 참여자 목록 화면 디자인 확정 후 연결 */}
          <button type="button" className="flex-1 rounded-[4px] py-2 text-b2-m text-gray-600">
            참여자 목록
          </button>
        </div>
      )}

      {/* D 섹션 템플릿 이미지로 교체 예정인 placeholder라 색상 토큰 대신 임시 색 사용 */}
      <section className={`relative flex h-[190px] w-full items-center justify-center bg-gradient-to-t from-[#984463]/50 to-[#666666]/20 ${funding.isOwner ? 'mt-3' : ''}`}>
        <p className="text-caption1-r text-[#888888]">대표 이미지 삽입 영역</p>
        <div className="absolute inset-x-[18px] top-6 flex items-start justify-between">
          <span className="rounded-full border border-gray-300 bg-white px-4 py-2 text-b2-m leading-normal text-gray-700">
            {funding.category}
          </span>
          <span className="rounded-full border border-gray-300 bg-white px-4 py-2 text-b2-m leading-normal text-gray-700">
            {getDdayLabel(funding.anniversaryDate)}
          </span>
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-8 px-[18px]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-h3-sb leading-normal text-black">{funding.title}</h1>
            <div className="flex items-center gap-2">
              <div className="size-5 rounded-full bg-background-2" />
              <p className="text-b2-r leading-normal text-gray-600">
                {funding.hostFullName}·{formatDateKorean(new Date(funding.anniversaryDate))}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex min-h-[168px] items-center justify-center rounded-xl border border-gray-200 bg-background-2 px-3.5 py-3">
              <p className="whitespace-pre-line text-center text-b2-m leading-normal text-gray-800">
                {funding.greeting}
              </p>
            </div>
            <ProgressCard funding={funding} />
          </div>
        </div>

        <MessageSection funding={funding} onOpenMessage={setOpenedMessage} />
      </div>

      <div className="pointer-events-none fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-gradient-to-b from-white/0 to-white/80 px-[18px] pb-[34px] pt-10">
        {funding.isOwner ? (
          <div className="pointer-events-auto flex gap-3">
            {/* TODO: 펀딩 마감 처리 정책(BE)·수정 흐름(D 섹션) 확정 후 연결 */}
            {/* 14px SemiBold는 @theme에 대응 토큰이 없어 일반 유틸 사용 (B2_SB 토큰 추가는 디자이너 확인 필요) */}
            <button
              type="button"
              className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-gray-600 bg-white text-sm font-semibold text-black"
            >
              펀딩 마감하기
            </button>
            <Button className="flex-1">수정하기</Button>
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

      {/* content가 null이면(BE 계약 불일치 방어) 빈 편지 대신 모달을 열지 않음 */}
      <LetterModal
        open={openedMessage?.content != null}
        hostName={funding.hostName}
        content={openedMessage?.content ?? ''}
        senderLabel={openedMessage ? getMessageDisplayName(openedMessage, funding) : null}
        onClose={() => setOpenedMessage(null)}
      />
    </div>
  )
}
