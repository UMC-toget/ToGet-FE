import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ChevronLeftIcon from '../../components/icons/ChevronLeftIcon'
import SearchIcon from '../../components/icons/SearchIcon'
import CloseIcon from '../../components/icons/CloseIcon'
import WishProductCard from './WishProductCard'
import { useWishedProducts } from './hooks/useWishedProducts'
import { deleteWishlistItem } from '../../api/wishlists'

/** 위시 검색 페이지 (피그마 기준 frame 1716:105603) */
export default function WishSearchPage() {
  const navigate = useNavigate()
  const { searchWishedProducts, refetch } = useWishedProducts()
  const [keyword, setKeyword] = useState('')

  // 검색 키워드 필터링
  const searchResults = useMemo(() => {
    return searchWishedProducts(keyword)
  }, [searchWishedProducts, keyword])

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

        <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-background px-3">
          <SearchIcon className="size-5 text-gray-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="선물 이름을 검색해 보세요"
            className="w-full bg-transparent text-b2-r text-black placeholder:text-gray-400 focus:outline-none"
            autoFocus
          />
          {keyword && (
            <button
              type="button"
              aria-label="지우기"
              onClick={() => setKeyword('')}
              className="flex size-5 items-center justify-center rounded-full bg-gray-300 text-white"
            >
              <CloseIcon className="size-3 text-white" />
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col px-[18px] pt-4">
        {keyword.trim() ? (
          searchResults.length > 0 ? (
            <div className="flex flex-col gap-3">
              <p className="text-caption1-r text-gray-500">검색 결과 {searchResults.length}개</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                {searchResults.map((product) => (
                  <WishProductCard
                    key={product.id}
                    product={product}
                    onRemoveWish={() => handleRemoveWish(product.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="py-20 text-center text-b2-r text-gray-500">
              검색 조건에 맞는 위시 선물이 없습니다
            </p>
          )
        ) : (
          <div className="py-20 text-center text-b2-r text-gray-400">
            검색할 선물 이름을 입력해 주세요
          </div>
        )}
      </div>
    </div>
  )
}
