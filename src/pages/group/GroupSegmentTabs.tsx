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
    <div className="mx-[18px] mb-3 mt-6 flex shrink-0 items-center gap-1 rounded-lg bg-gray-100 p-[5px]">
      {tabs.map(tab => (
        <button
          key={tab.label}
          type="button"
          onClick={tab.onClick}
          className={`flex flex-1 items-center justify-center rounded-[4px] px-[10px] py-2.5 text-b2-m ${
            tab.active ? 'bg-white text-black' : 'text-[#797378]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
