import { useEffect, useState } from 'react'
import { ChevronDown, ChevronLeft, Search, Pencil, Check } from 'lucide-react'
import Toast from '../../components/common/Toast'
import DefaultAvatar from '../../components/common/DefaultAvatar'
import { getMockParticipants } from './participantMock'
import type { Participant } from './participantMock'

const TOAST_DURATION_MS = 2500

type SortOrder = 'latest' | 'oldest'
type View = 'list' | 'search'

function ParticipantCard({ participant, onEdit }: { participant: Participant; onEdit: (p: Participant) => void }) {
  return (
    <div className="rounded-xl border border-gray-100 p-3">
      <div className="flex items-center gap-3">
        <DefaultAvatar className="size-9 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-b2-m leading-normal text-black">{participant.name}</p>
          <p className="text-caption2-r leading-normal text-gray-500">{participant.dateLabel}</p>
        </div>
        <p className="text-b2-m leading-normal text-black">{participant.amount.toLocaleString()}원</p>
      </div>
      <button
        type="button"
        onClick={() => onEdit(participant)}
        className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-background-2 py-2 text-caption1-m text-gray-600 transition-colors hover:bg-gray-100"
      >
        <Pencil size={12} /> 금액 수정
      </button>
    </div>
  )
}

/**
 * D 섹션: 참여자 목록 탭 (개설자 전용)
 * 참여 인원/참여 금액 요약, 정렬(최신순/오래된순), 이름 검색, 참여 금액 수정(+실행취소 토스트)을 제공합니다.
 */
export default function ParticipantList() {
  const [participants, setParticipants] = useState<Participant[]>(() => getMockParticipants())
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest')
  const [showSortSheet, setShowSortSheet] = useState(false)
  const [view, setView] = useState<View>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [editing, setEditing] = useState<Participant | null>(null)
  const [editValue, setEditValue] = useState('')
  const [toast, setToast] = useState<{ id: string; previousAmount: number } | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast])

  const totalAmount = participants.reduce((sum, p) => sum + p.amount, 0)

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

  const confirmEdit = () => {
    if (!editing || !isEditValid) return
    const previousAmount = editing.amount
    const nextAmount = Number(editValue)
    setParticipants((prev) => prev.map((p) => (p.id === editing.id ? { ...p, amount: nextAmount } : p)))
    setToast({ id: editing.id, previousAmount })
    closeEdit()
  }

  const handleUndo = () => {
    if (!toast) return
    setParticipants((prev) => prev.map((p) => (p.id === toast.id ? { ...p, amount: toast.previousAmount } : p)))
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
      <div className="flex flex-col gap-2 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-b2-m leading-normal text-gray-700">참여 인원</span>
          <span className="rounded bg-pink-100 px-2 py-0.5 text-b2-m leading-normal text-pink-500">
            {participants.length}명
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-b2-m leading-normal text-gray-700">참여 금액</span>
          <span className="rounded bg-pink-100 px-2 py-0.5 text-b2-m leading-normal text-pink-500">
            {totalAmount.toLocaleString()}원
          </span>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowSortSheet(true)}
          className="flex items-center gap-1 text-caption1-m text-gray-500"
        >
          {sortLabel} <ChevronDown size={12} />
        </button>
        <button type="button" onClick={() => setView('search')} aria-label="검색" className="p-1 text-gray-400">
          <Search size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pb-2">
        {sortedParticipants.map((p) => (
          <ParticipantCard key={p.id} participant={p} onEdit={openEdit} />
        ))}
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
              className="flex w-full items-center justify-between px-2 py-3 text-b2-m text-gray-700"
            >
              {opt === 'latest' ? '최신 순' : '오래된 순'}
              {sortOrder === opt && <Check size={16} className="text-black" />}
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
      <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={closeEdit}>
        <div className="mx-auto w-full max-w-sm rounded-t-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />
          <p className="mb-3 text-b2-m text-gray-700">금액 수정</p>
          <div className="relative mb-4">
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              value={editValue ? Number(editValue).toLocaleString() : ''}
              onChange={(e) => setEditValue(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-b2-m outline-none transition-colors focus:border-gray-800"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-caption1-r text-gray-400">(원)</span>
          </div>
          <button
            type="button"
            onClick={confirmEdit}
            disabled={!isEditValid}
            className="w-full rounded-xl bg-gray-900 py-3 text-b2-m font-medium text-white transition-colors disabled:bg-gray-200 disabled:text-gray-400"
          >
            수정 완료
          </button>
        </div>
      </div>
    )
  }
}
