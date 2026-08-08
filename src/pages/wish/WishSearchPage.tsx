import { useState, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ChevronLeftIcon from '../../components/icons/ChevronLeftIcon'
import SearchIcon from '../../components/icons/SearchIcon'
import CloseIcon from '../../components/icons/CloseIcon'
import WishProductCard from './WishProductCard'
import { useWishedProducts } from './hooks/useWishedProducts'
import { deleteWishlistItem } from '../../api/wishlists'

const RECENT_SEARCH_KEY = 'toget:wishSearchRecent'
const RECENT_SEARCH_MAX = 10

function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCH_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function saveRecentSearches(list: string[]) {
  try {
    localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(list))
  } catch {
    // 저장 공간 초과 등은 무시 — 최근 검색어는 부가 기능이라 실패해도 검색 자체엔 영향 없음
  }
}

/** 위시 검색 페이지 (피그마 기준 frame 1716:105603) */
export default function WishSearchPage() {
  const navigate = useNavigate()
  const { searchWishedProducts, refetch } = useWishedProducts()
  const [keyword, setKeyword] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadRecentSearches())

  // 검색 키워드 필터링
  const searchResults = useMemo(() => {
    return searchWishedProducts(keyword)
  }, [searchWishedProducts, keyword])

  const commitRecentSearch = useCallback((value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((k) => k !== trimmed)].slice(0, RECENT_SEARCH_MAX)
      saveRecentSearches(next)
      return next
    })
  }, [])

  const handleRemoveRecent = useCallback((value: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((k) => k !== value)
      saveRecentSearches(next)
      return next
    })
  }, [])

  const handleClearRecent = useCallback(() => {
    setRecentSearches([])
    saveRecentSearches([])
  }, [])

  const handleSelectRecent = useCallback(
    (value: string) => {
      setKeyword(value)
      commitRecentSearch(value)
    },
    [commitRecentSearch],
  )

  // 최근 검색어 한 줄 스크롤: 모바일은 네이티브 스와이프로 이미 되고, 데스크톱은 마우스
  // 드래그로도 스크롤할 수 있게 보조합니다. 드래그 중이었다면 클릭(검색어 선택)은 무시합니다.
  const recentDragStart = useRef<{ x: number; scrollLeft: number } | null>(null)
  const recentDragMoved = useRef(false)

  const handleRecentPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    recentDragStart.current = { x: e.clientX, scrollLeft: e.currentTarget.scrollLeft }
    recentDragMoved.current = false
  }

  const handleRecentPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = recentDragStart.current
    if (!start) return
    const dx = e.clientX - start.x
    if (Math.abs(dx) > 4) recentDragMoved.current = true
    if (recentDragMoved.current) e.currentTarget.scrollLeft = start.scrollLeft - dx
  }

  const handleRecentPointerUp = () => {
    recentDragStart.current = null
  }

  const handleRecentClickCapture = (e: React.MouseEvent) => {
    if (recentDragMoved.current) {
      e.preventDefault()
      e.stopPropagation()
      recentDragMoved.current = false
    }
  }

  const handleRemoveWish = useCallback(
    async (wishlistItemId: number) => {
      try {
        await deleteWishlistItem(wishlistItemId)
        refetch()
      } catch (err) {
        console.error('위시 아이템 삭제 실패:', err)
      }
    },
    [refetch],
  )

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      {/* Header with Search input */}
      <header className="flex h-[56px] items-center gap-2 px-[18px]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-9 items-center justify-center text-black"
        >
          <ChevronLeftIcon className="size-6 text-black" />
        </button>

        <div className="flex h-[42px] flex-1 items-center gap-2 rounded-lg bg-background px-4 py-3">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commitRecentSearch(keyword)}
            placeholder="상품 이름을 검색해보세요"
            className="w-full bg-transparent text-b1-m text-black placeholder:text-gray-400 focus:outline-none"
            autoFocus
          />
          {keyword ? (
            <button type="button" aria-label="지우기" onClick={() => setKeyword('')}>
              <CloseIcon className="size-5 shrink-0 text-black" />
            </button>
          ) : (
            <SearchIcon className="size-6 shrink-0 text-black" />
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col px-[18px] pt-4">
        {keyword.trim() ? (
          searchResults.length > 0 ? (
            <div className="flex flex-col gap-3">
              <p className="text-caption1-r text-gray-500">선물 {searchResults.length}개</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                {searchResults.map((product) => (
                  <WishProductCard
                    key={product.id}
                    product={product}
                    onRemoveWish={() => handleRemoveWish(product.id)}
                    highlightKeyword={keyword}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 pb-20">
              <SearchIcon className="size-12 text-gray-300" />
              <p className="text-b1-m text-gray-600">일치하는 검색 결과가 없어요</p>
            </div>
          )
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between">
              <p className="text-b1-m font-semibold text-black">최근 검색어</p>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearRecent}
                  className="text-caption1-m text-gray-600"
                >
                  전체 삭제
                </button>
              )}
            </div>
            {recentSearches.length > 0 ? (
              <div
                className="no-scrollbar mt-4 flex gap-2 overflow-x-auto"
                onPointerDown={handleRecentPointerDown}
                onPointerMove={handleRecentPointerMove}
                onPointerUp={handleRecentPointerUp}
                onPointerLeave={handleRecentPointerUp}
                onClickCapture={handleRecentClickCapture}
              >
                {recentSearches.map((value) => (
                  <div
                    key={value}
                    className="flex shrink-0 items-center gap-0.5 rounded-full border border-gray-300 py-2 pl-4 pr-2.5"
                  >
                    <button type="button" onClick={() => handleSelectRecent(value)} className="text-b2-m text-black">
                      {value}
                    </button>
                    <button
                      type="button"
                      aria-label={`${value} 삭제`}
                      onClick={() => handleRemoveRecent(value)}
                      className="flex size-5 items-center justify-center text-gray-500"
                    >
                      <CloseIcon className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 pb-20">
                <SearchIcon className="size-12 text-gray-300" />
                <p className="text-b1-m text-gray-600">최근 검색어가 없어요</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
