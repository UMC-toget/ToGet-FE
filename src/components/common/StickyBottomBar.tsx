import type { ReactNode } from 'react'

interface StickyBottomBarProps {
  children: ReactNode
}

export default function StickyBottomBar({ children }: StickyBottomBarProps) {
  return (
    <div className="pointer-events-none fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-gradient-to-b from-white/0 to-white/80 px-[18px] pb-[34px] pt-10">
      {children}
    </div>
  )
}
