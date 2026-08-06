interface Tab {
  label: string
  active: boolean
  onClick: () => void
}

interface FundingListTabsProps {
  tabs: Tab[]
}

/** 마이페이지 '내 선물 페이지'/'함께 선물 페이지' 목록 전용 pill 탭 (이슈 #317, 피그마 2929:135189). 공용 GroupSegmentTabs와 별개로 좌측 정렬된 pill 스타일만 제공합니다. */
export default function FundingListTabs({ tabs }: FundingListTabsProps) {
  return (
    <div className="mx-[18px] mt-5 mb-3 flex shrink-0 items-center gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          onClick={tab.onClick}
          className={`rounded-full px-4 py-2 text-b2-m ${
            tab.active ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
