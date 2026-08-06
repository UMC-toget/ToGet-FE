import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronDown, ChevronLeft, Search } from 'lucide-react'
import Toast from '../../components/common/Toast'
import DefaultAvatar from '../../components/common/DefaultAvatar'
import type { Participant } from './participantMock'
import { getFundingContributionList, updateContributionAmount } from '../../api/fundings'

const TOAST_DURATION_MS = 2500

type SortOrder = 'latest' | 'oldest'
type View = 'list' | 'search'

function EditPencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.99967 6.66807L3.33301 13.3347V16.6681L6.66634 16.668L13.333 10.0014M9.99967 6.66807L12.3902 4.27752L12.3916 4.2761C12.7207 3.94703 12.8855 3.78221 13.0755 3.72047C13.2429 3.66609 13.4232 3.66609 13.5906 3.72047C13.7804 3.78216 13.9451 3.9468 14.2737 4.27541L15.7235 5.72524C16.0535 6.05525 16.2186 6.22033 16.2804 6.41061C16.3348 6.57798 16.3348 6.75826 16.2804 6.92563C16.2186 7.11577 16.0538 7.2806 15.7243 7.61015L15.7235 7.61085L13.333 10.0014M9.99967 6.66807L13.333 10.0014"
        stroke="#1E1D1E"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#1E1D1E" />
      <path d="M7.11816 11.9974L10.4515 15.3307L17.1182 8.66406" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

function SearchBlackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.6162 4.20703C14.1322 4.20703 16.9834 7.05798 16.9834 10.5752C16.9834 14.0924 14.1322 16.9434 10.6162 16.9434C7.10039 16.9432 4.25 14.0923 4.25 10.5752C4.25003 7.05809 7.1004 4.20721 10.6162 4.20703Z"
        stroke="#1E1D1E"
        strokeWidth="1.5"
      />
      <path d="M15.1299 15.2266L20.5002 20.5388" stroke="#1E1D1E" strokeWidth="1.5" />
    </svg>
  )
}

function ParticipantCard({ participant, onEdit }: { participant: Participant; onEdit: (p: Participant) => void }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-[14px] py-3">
      <div className="flex items-center gap-3">
        <DefaultAvatar className="size-[52px] shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-b1-m leading-normal text-black">{participant.name}</p>
            <p className="shrink-0 text-b1-m font-semibold leading-normal text-black">{participant.amount.toLocaleString()}원</p>
          </div>
          <p className="text-caption1-r leading-normal text-gray-500">{participant.dateLabel}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onEdit(participant)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-2.5 py-2 text-caption1-m text-black transition-colors hover:bg-gray-200"
      >
        <EditPencilIcon /> 금액 수정
      </button>
    </div>
  )
}

/**
 * D 섹션: 참여자 목록 탭 (개설자 전용)
 * 참여 인원/참여 금액 요약, 정렬(최신순/오래된순), 이름 검색, 참여 금액 수정(+실행취소 토스트)을 제공합니다.
 */
export default function ParticipantList() {
  const { id } = useParams()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [participantCount, setParticipantCount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(Boolean(id))
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest')
  const [showSortSheet, setShowSortSheet] = useState(false)
  const [view, setView] = useState<View>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [editing, setEditing] = useState<Participant | null>(null)
  const [editValue, setEditValue] = useState('')
  const [toast, setToast] = useState<{ id: string; contributionId: number; previousAmount: number } | null>(null)

  useEffect(() => {
    if (!id) return

    let isActive = true

    getFundingContributionList(id).then((res) => {
      if (!isActive) return
      setParticipantCount(res.participantCount)
      setTotalAmount(res.totalAmount)
      setParticipants(res.contributions.map((c) => {
        const date = new Date(c.createdAt)
        const dateLabel = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
        return {
          id: String(c.contributionId),
          name: c.senderName ?? '익명',
          timestamp: date.getTime(),
          dateLabel,
          amount: c.amount,
        }
      }))
    }).catch((error) => {
      if (!isActive) return
      console.error(error)
      setParticipantCount(0)
      setTotalAmount(0)
      setParticipants([])
    }).finally(() => {
      if (isActive) setIsLoading(false)
    })

    return () => {
      isActive = false
    }
  }, [id])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast])

  const sortParticipants = (list: Participant[]) =>
    [...list].sort((a, b) => (sortOrder === 'latest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp))

  const sortedParticipants = sortParticipants(participants)
  const searchResults = sortParticipants(participants.filter((p) => p.name.includes(searchQuery.trim())))

  const openEdit = (p: Participant) => {
    setEditing(p)
    setEditValue(String(p.amount))
  }

  const closeEdit = () => {
    setEditing(null)
    setEditValue('')
  }

  const isEditValid = editing !== null && editValue !== '' && Number(editValue) !== editing.amount

  const confirmEdit = async () => {
    if (!editing || !isEditValid || !id) return
    const previousAmount = editing.amount
    const nextAmount = Number(editValue)
    const contributionId = Number(editing.id)
    setParticipants((prev) => prev.map((p) => (p.id === editing.id ? { ...p, amount: nextAmount } : p)))
    setTotalAmount((prev) => prev - previousAmount + nextAmount)
    setToast({ id: editing.id, contributionId, previousAmount })
    closeEdit()
    updateContributionAmount(id, contributionId, nextAmount).catch(() => {
      // API 실패 시 로컬 롤백
      setParticipants((prev) => prev.map((p) => (p.id === editing.id ? { ...p, amount: previousAmount } : p)))
      setTotalAmount((prev) => prev + previousAmount - nextAmount)
      setToast(null)
    })
  }

  const handleUndo = () => {
    if (!toast || !id) return
    const { id: pid, contributionId, previousAmount } = toast
    setParticipants((prev) => prev.map((p) => (p.id === pid ? { ...p, amount: previousAmount } : p)))
    setTotalAmount((prev) => {
      const current = participants.find((p) => p.id === pid)?.amount ?? previousAmount
      return prev - current + previousAmount
    })
    updateContributionAmount(id, contributionId, previousAmount).catch(console.error)
    setToast(null)
  }

  const sortLabel = sortOrder === 'latest' ? '최신 순' : '오래된 순'

  // ── 검색 화면 ──────────────────────────────────────────────
  if (view === 'search') {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setView('list')
              setSearchQuery('')
            }}
            aria-label="뒤로가기"
            className="p-1 text-gray-600 transition-colors hover:text-gray-900"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="relative flex-1">
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름을 검색해보세요"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-9 text-b2-m outline-none transition-colors focus:border-gray-800"
            />
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSortSheet(true)}
          className="mb-2 flex w-fit items-center gap-1 text-caption1-m text-gray-500"
        >
          {sortLabel} <ChevronDown size={12} />
        </button>

        <div className="flex-1 space-y-3 overflow-y-auto pb-2">
          {searchResults.length === 0 ? (
            <p className="py-8 text-center text-caption1-r text-gray-400">검색 결과가 없어요</p>
          ) : (
            searchResults.map((p) => <ParticipantCard key={p.id} participant={p} onEdit={openEdit} />)
          )}
        </div>

        {sortSheet()}
        {editSheet()}
        <Toast
          open={toast !== null}
          message="금액 수정이 완료 되었습니다"
          actionLabel="실행취소"
          onAction={handleUndo}
        />
      </div>
    )
  }

  // ── 목록 화면 ──────────────────────────────────────────────
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-3 pb-4">
        <div className="flex items-center justify-between opacity-80">
          <span className="text-h3-sb text-black">참여 인원</span>
          <span className="rounded bg-[#FFF1F6] px-2.5 pt-1 pb-1.5 text-h3-sb text-pink-500">
            {participantCount}명
          </span>
        </div>
        <div className="flex items-center justify-between opacity-80">
          <span className="text-h3-sb text-black">참여 금액</span>
          <span className="rounded bg-[#FFF1F6] px-2.5 pt-2 pb-1.5 text-h3-sb text-pink-500">
            {totalAmount.toLocaleString()}원
          </span>
        </div>
      </div>

      <div className="-mx-[18px] flex min-h-0 flex-1 flex-col bg-background px-[18px] pt-5">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowSortSheet(true)}
            className="flex items-center gap-1 text-caption1-m text-gray-500"
          >
            {sortLabel} <ChevronDown size={12} />
          </button>
          <button type="button" onClick={() => setView('search')} aria-label="검색" className="p-1">
            <SearchBlackIcon />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pb-2">
          {isLoading ? (
            <p className="py-8 text-center text-caption1-r text-gray-400">불러오는 중...</p>
          ) : sortedParticipants.length === 0 ? (
            <p className="py-8 text-center text-caption1-r text-gray-400">아직 참여한 친구가 없어요</p>
          ) : (
            sortedParticipants.map((p) => <ParticipantCard key={p.id} participant={p} onEdit={openEdit} />)
          )}
        </div>
      </div>

      {sortSheet()}
      {editSheet()}
      <Toast open={toast !== null} message="금액 수정이 완료 되었습니다" actionLabel="실행취소" onAction={handleUndo} />
    </div>
  )

  // ── 정렬 바텀시트 ──────────────────────────────────────────
  function sortSheet() {
    if (!showSortSheet) return null
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setShowSortSheet(false)}>
        <div
          className="mx-auto w-full max-w-sm rounded-t-2xl bg-white p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />
          {(['latest', 'oldest'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                setSortOrder(opt)
                setShowSortSheet(false)
              }}
              className={`flex w-full items-center justify-between px-2 py-3 text-b1-m ${sortOrder === opt ? 'text-black' : 'text-gray-400'}`}
            >
              {opt === 'latest' ? '최신 순' : '오래된 순'}
              {sortOrder === opt && <CheckCircleIcon />}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── 금액 수정 바텀시트 ─────────────────────────────────────
  function editSheet() {
    if (!editing) return null
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-[2px]" onClick={closeEdit}>
        <div className="mx-auto w-full max-w-[402px] rounded-t-[25px] bg-white px-[18px] pt-[14px] pb-8" onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto mb-6 h-[3px] w-9 rounded-full bg-[rgba(60,60,67,0.3)]" />
          <p className="mb-5 text-h3-sb text-black">금액 수정</p>
          <div className="mb-6 flex h-12 items-center justify-between rounded-lg bg-background px-4">
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              value={editValue ? Number(editValue).toLocaleString() : ''}
              onChange={(e) => setEditValue(e.target.value.replace(/[^0-9]/g, ''))}
              className="min-w-0 flex-1 bg-transparent text-b1-m text-black outline-none"
            />
            <span className="ml-2 shrink-0 text-b2-r text-gray-400">(원)</span>
          </div>
          <button
            type="button"
            onClick={confirmEdit}
            disabled={!isEditValid}
            className="h-[52px] w-full rounded-xl bg-gray-900 text-b2-m font-semibold text-white transition-colors disabled:bg-gray-300"
          >
            수정 완료
          </button>
        </div>
      </div>
    )
  }
}
