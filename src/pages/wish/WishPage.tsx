import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchIcon from '../../components/icons/SearchIcon'
import CaretDownIcon from '../../components/icons/CaretDownIcon'
import BottomNav from '../../components/common/BottomNav'
import Toast from '../../components/common/Toast'
import EmojiPopup from '../../components/common/EmojiPopup'
import WishProductCard from './WishProductCard'
import WishSortSheet from './WishSortSheet'
import GiftCreateSheet from '../gift-create/GiftCreateSheet'
import { useWishedProducts } from './hooks/useWishedProducts'
import type { SortOrder } from './hooks/useWishedProducts'
import { useWishSelection } from './hooks/useWishSelection'
import { useWishToast } from './hooks/useWishToast'
import { deleteWishlistItem } from '../../api/wishlists'
import type { WishType } from '../../store/wishStore'

const TABS: { id: WishType | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'receive', label: '받고 싶은' },
  { id: 'give', label: '주고 싶은' },
]

/** 위시 메인 페이지 (피그마 기준 frame 1716:102005 / 1716:103694 / 1716:107011) */
export default function WishPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<WishType | 'all'>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest')
  const [sortSheetOpen, setSortSheetOpen] = useState(false)
  const [giftCreateSheetOpen, setGiftCreateSheetOpen] = useState(false)

  // Custom Hooks
  const { wishedProducts, refetch } = useWishedProducts(tab, sortOrder)
  const {
    isEditMode,
    selectedIds,
    giftSelectedIds,
    toggleSelect,
    toggleGiftSelect,
    handleToggleEditMode,
    clearSelection,
  } = useWishSelection()
  const { toastMessage, toastActionLabel, showToast, handleUndo } = useWishToast()

  // Delete Confirmation Modal state (EmojiPopup)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const handleRequestSingleDelete = useCallback((id: number) => {
    setPendingDeleteId(id)
    setDeleteConfirmOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (pendingDeleteId !== null) {
      try {
        await deleteWishlistItem(pendingDeleteId)
        refetch()
        showToast('1개의 선물을 삭제 했습니다')
      } catch (err) {
        console.error('위시 삭제 실패:', err)
      } finally {
        setPendingDeleteId(null)
        setDeleteConfirmOpen(false)
      }
    }
  }, [pendingDeleteId, refetch, showToast])

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return
    const count = selectedIds.length
    try {
      await Promise.all(selectedIds.map((id) => deleteWishlistItem(id)))
      refetch()
      clearSelection()
      handleToggleEditMode()
      showToast(`${count}개의 선물을 삭제 했습니다`)
    } catch (err) {
      console.error('위시 일괄 삭제 실패:', err)
    }
  }, [selectedIds, refetch, clearSelection, handleToggleEditMode, showToast])

  const isGiftMakingActive = giftSelectedIds.length > 0

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-36">
      {/* Header */}
      <header className="flex h-[50px] shrink-0 items-center justify-between px-[18px]">
        <h1 className="text-h1-sb text-black">위시</h1>
        <button
          type="button"
          aria-label="검색"
          onClick={() => navigate('/wish/search')}
          className="flex size-9 items-center justify-center text-gray-900"
        >
          <SearchIcon className="size-6" />
        </button>
      </header>

      <div className="mt-6 flex flex-col gap-6 px-[18px]">
        {/* Category section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-h3-sb text-black">선물</h2>

          <div className="flex items-center gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-full px-4 py-2 text-b2-m transition-colors ${
                  t.id === tab
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-300 bg-white text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subheader info line */}
        <div className="flex items-center justify-between">
          <p className="text-caption1-r text-gray-500">선물 {wishedProducts.length}개</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSortSheetOpen(true)}
              className="flex items-center gap-1"
            >
              <span className="text-caption1-m text-black">
                {sortOrder === 'latest' ? '최신순' : '오래된순'}
              </span>
              <CaretDownIcon className="size-6 text-black" />
            </button>
            <button
              type="button"
              onClick={handleToggleEditMode}
              className="text-caption1-m text-black"
            >
              {isEditMode ? '완료' : '편집'}
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        {wishedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {wishedProducts.map((product) => (
              <WishProductCard
                key={product.id}
                product={product}
                isEditMode={isEditMode}
                isSelected={selectedIds.includes(product.id)}
                onToggleSelect={() => toggleSelect(product.id)}
                isGiftSelected={giftSelectedIds.includes(product.id)}
                onToggleGiftSelect={() => toggleGiftSelect(product.id)}
                onRemoveWish={() => handleRequestSingleDelete(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
            <p className="text-b2-r leading-normal text-gray-500">아직 등록한 위시가 없어요</p>
            <p className="text-b2-r leading-normal text-gray-500">
              기억해 두고 싶은 선물을 위시에 담아보세요.
            </p>
          </div>
        )}
      </div>

      {/* Edit Mode Sticky Delete Bar */}
      {isEditMode && (
        <div className="fixed bottom-[64px] left-1/2 z-30 flex w-full max-w-[402px] -translate-x-1/2 items-center justify-between bg-white px-[18px] py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <span className="text-b2-m text-gray-700">
            {selectedIds.length}개 선택됨
          </span>
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={handleBulkDelete}
            className="rounded-xl bg-pink-500 px-5 py-2 text-b2-m font-semibold text-white disabled:bg-gray-300"
          >
            선택 삭제
          </button>
        </div>
      )}

      {/* Gift Creation Floating Button (Hides BottomNav when active) */}
      {!isEditMode && isGiftMakingActive && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-30 w-full max-w-[402px] -translate-x-1/2 px-[18px]">
          <button
            type="button"
            onClick={() => setGiftCreateSheetOpen(true)}
            className="pointer-events-auto flex h-[52px] w-full items-center justify-center rounded-xl bg-gray-900 text-b1-m font-semibold text-white shadow-lg transition-transform active:scale-[0.99]"
          >
            {giftSelectedIds.length}개 상품으로 선물 페이지 만들기
          </button>
        </div>
      )}

      {/* BottomNav is shown ONLY when gift creation bar is NOT active */}
      {!isGiftMakingActive && <BottomNav active="gift" />}

      {/* Gift Creation Bottom Sheet */}
      <GiftCreateSheet
        open={giftCreateSheetOpen}
        onClose={() => setGiftCreateSheetOpen(false)}
      />

      {/* Wish Sort Bottom Sheet */}
      <WishSortSheet
        open={sortSheetOpen}
        selected={sortOrder}
        onClose={() => setSortSheetOpen(false)}
        onSelect={(newOrder) => setSortOrder(newOrder)}
      />

      {/* Delete Confirmation Modal (EmojiPopup - Figma 1716:103694) */}
      <EmojiPopup
        open={deleteConfirmOpen}
        icon="alert"
        title="선물을 삭제하시겠습니까?"
        description="삭제한 선물은 다시 복구할 수 없어요."
        buttons={[
          {
            label: '취소',
            onClick: () => setDeleteConfirmOpen(false),
            variant: 'secondary',
          },
          {
            label: '삭제',
            onClick: handleConfirmDelete,
            variant: 'primary',
          },
        ]}
        onDimClick={() => setDeleteConfirmOpen(false)}
      />

      {/* Toast Snackbar (Figma 1716:107011) */}
      <Toast
        open={toastMessage !== null}
        message={toastMessage ?? ''}
        actionLabel={toastActionLabel}
        onAction={handleUndo}
      />
    </div>
  )
}
