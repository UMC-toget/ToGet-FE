import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import ChevronLeftIcon from '../icons/ChevronLeftIcon'

interface HeaderProps {
  /** 중앙에 표시되는 타이틀 */
  title: string
  /** 뒤로가기 동작 커스텀. 기본값은 브라우저 히스토리 뒤로가기 */
  onBack?: () => void
  /** 뒤로가기 버튼 숨김 여부 */
  hideBack?: boolean
  /** 우측 영역 (예: 텍스트 버튼) */
  right?: ReactNode
}

/**
 * 상단 네비게이션 바 (피그마 상단제목 컴포넌트 기준)
 *
 * @example
 * <Header title="프로필" />
 * <Header title="내 선물 페이지 만들기" right={<button>나가기</button>} />
 */
export default function Header({ title, onBack, hideBack = false, right }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="relative flex h-[50px] w-full items-center justify-center border-b border-gray-100 bg-white px-[18px]">
      {!hideBack && (
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={onBack ?? (() => navigate(-1))}
          className="absolute left-[18px] text-black"
        >
          <ChevronLeftIcon />
        </button>
      )}
      <h1 className="text-h3-sb text-black">{title}</h1>
      {right && <div className="absolute right-[18px]">{right}</div>}
    </header>
  )
}
