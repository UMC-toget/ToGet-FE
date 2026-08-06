import { useState } from 'react'
import type { ReactNode } from 'react'
import Header from '../../components/common/Header'
import BottomSheet from '../../components/common/BottomSheet'
import FundingListTabs from './FundingListTabs'
import CaretDownIcon from '../../components/icons/CaretDownIcon'
import CircleCheckIcon from '../../components/icons/CircleCheckIcon'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useMyFundingsList } from './useMyFundingsList'
import type { MyFunding, FundingType } from '../../api/users'

type TabKey = 'all' | 'active' | 'ended'
type SortOrder = 'endDateAsc' | 'endDateDesc'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행중' },
  { key: 'ended', label: '종료' },
]

const EMPTY_LABELS: Record<TabKey, string> = {
  all: '만든 페이지가 없어요',
  active: '진행중인 페이지가 없어요',
  ended: '종료된 페이지가 없어요',
}

const COUNT_LABELS: Record<TabKey, string> = {
  all: '만든 페이지',
  active: '진행 중인 페이지',
  ended: '종료된 페이지',
}

const SORT_OPTIONS: { key: SortOrder; label: string }[] = [
  { key: 'endDateAsc', label: '종료일 빠른순' },
  { key: 'endDateDesc', label: '종료일 늦은순' },
]

interface FundingListPageProps {
  /** 헤더 타이틀 (예: '내 선물 페이지') */
  title: string
  fundingType: FundingType
  renderCard: (funding: MyFunding) => ReactNode
}

/**
 * 마이페이지 '내 선물 페이지'/'함께 선물 페이지' 공통 목록 레이아웃 (이슈 #317).
 * 조회·탭(전체/진행중/종료)·정렬(종료일 빠른순/늦은순)만 제공하며 편집/삭제는 없음.
 * 목록 API에 상태 필터·정렬 파라미터가 없어 전체를 받아 클라이언트에서 처리합니다.
 */
export default function FundingListPage({ title, fundingType, renderCard }: FundingListPageProps) {
  useRequireAuth()
  const { fundings, isLoading } = useMyFundingsList(fundingType)
  const [tab, setTab] = useState<TabKey>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('endDateDesc')
  const [sortSheetOpen, setSortSheetOpen] = useState(false)

  const filtered = fundings.filter((funding) => {
    if (tab === 'all') return true
    const isEnded = funding.status === 'ENDED'
    return tab === 'ended' ? isEnded : !isEnded
  })

  const sorted = [...filtered].sort((a, b) => {
    const diff = new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    return sortOrder === 'endDateAsc' ? diff : -diff
  })

  const sortLabel = SORT_OPTIONS.find((opt) => opt.key === sortOrder)?.label ?? ''

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title={title} />

      <FundingListTabs
        tabs={TABS.map((t) => ({
          label: t.label,
          active: tab === t.key,
          onClick: () => setTab(t.key),
        }))}
      />

      <div className="flex flex-1 flex-col gap-4 bg-background px-[18px] pb-8 pt-3">
        <div className="flex items-center justify-between">
          <p className="text-caption1-r text-gray-500">
            {COUNT_LABELS[tab]} {sorted.length}개
          </p>
          <button
            type="button"
            onClick={() => setSortSheetOpen(true)}
            className="flex items-center gap-0.5 text-caption1-m text-gray-500"
          >
            {sortLabel}
            <CaretDownIcon className="size-4" />
          </button>
        </div>

        {isLoading ? (
          <p className="py-16 text-center text-caption1-r text-gray-400">불러오는 중...</p>
        ) : sorted.length === 0 ? (
          <p className="py-16 text-center text-caption1-r text-gray-400">{EMPTY_LABELS[tab]}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {sorted.map((funding) => (
              <div key={funding.fundingId}>{renderCard(funding)}</div>
            ))}
          </div>
        )}
      </div>

      <BottomSheet open={sortSheetOpen} onClose={() => setSortSheetOpen(false)}>
        <p className="mb-2 w-full text-h3-sb text-black">정렬</p>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => {
              setSortOrder(opt.key)
              setSortSheetOpen(false)
            }}
            className={`flex w-full items-center justify-between px-2 py-3 text-b1-m ${
              sortOrder === opt.key ? 'text-black' : 'text-gray-400'
            }`}
          >
            {opt.label}
            {sortOrder === opt.key && <CircleCheckIcon className="size-6" />}
          </button>
        ))}
      </BottomSheet>
    </div>
  )
}
