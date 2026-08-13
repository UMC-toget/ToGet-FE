interface Tab {
  label: string
  onClick?: () => void
  active: boolean
}

interface GroupSegmentTabsProps {
  tabs: Tab[]
}

export default function GroupSegmentTabs({ tabs }: GroupSegmentTabsProps) {
  return (
    <div className="shrink-0 bg-white px-[18px] py-6">
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map(tab => (
          <button
            key={tab.label}
            type="button"
            onClick={tab.onClick}
            className={`flex h-[33px] min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-[4px] px-[10px] text-b2-m ${
              tab.active ? 'bg-white text-black' : 'text-[#797378]'
            }`}
          >
            <span className="translate-y-[1px]">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
