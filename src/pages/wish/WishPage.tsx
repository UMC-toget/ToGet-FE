import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchIcon from '../../components/icons/SearchIcon'
import CaretDownIcon from '../../components/icons/CaretDownIcon'
import TrashIcon from '../../components/icons/TrashIcon'
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
import { createWishlistItem, deleteWishlistItem } from '../../api/wishlists'
import type { WishlistItemResponse } from '../../api/wishlists'
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
  const { wishedProducts, rawItems, refetch } = useWishedProducts(tab, sortOrder)
  const {
    isEditMode,
    selectedIds,
    giftSelectedIds,
    toggleSelect,
    toggleGiftSelect,
    handleToggleEditMode,
    clearSelection,
  } = useWishSelection()
  const { toastMessage, toastActionLabel, showToast, handleToastAction } = useWishToast(refetch)

  // Delete Confirmation Modal state (EmojiPopup)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  const handleRequestSingleDelete = useCallback((id: number) => {
    setPendingDeleteId(id)
    setDeleteConfirmOpen(true)
  }, [])

  const recreateDeletedItems = useCallback(
    async (items: WishlistItemResponse[]) => {
      try {
        await Promise.all(
          items.map((item) =>
            createWishlistItem({
              productId: item.productId,
              name: item.name,
              price: item.price,
              purchaseUrl: item.purchaseUrl,
              imageUrl: item.imageUrl,
              type: item.type,
            }),
          ),
        )
        refetch()
      } catch (err) {
        console.error('위시 삭제 취소 실패:', err)
      }
    },
    [refetch],
  )

  const handleConfirmDelete = useCallback(async () => {
    if (pendingDeleteId !== null) {
      const deletedItem = rawItems.find((item) => item.wishlistItemId === pendingDeleteId)
      try {
        await deleteWishlistItem(pendingDeleteId)
        refetch()
        showToast(
          '1개의 선물을 삭제했습니다.',
          deletedItem ? '실행취소' : undefined,
          deletedItem ? () => recreateDeletedItems([deletedItem]) : undefined,
        )
      } catch (err) {
        console.error('위시 삭제 실패:', err)
      } finally {
        setPendingDeleteId(null)
        setDeleteConfirmOpen(false)
      }
    }
  }, [pendingDeleteId, rawItems, refetch, showToast, recreateDeletedItems])

  const handleConfirmBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return
    const count = selectedIds.length
    const deletedItems = rawItems.filter((item) => selectedIds.includes(item.wishlistItemId))
    try {
      await Promise.all(selectedIds.map((id) => deleteWishlistItem(id)))
      refetch()
      clearSelection()
      handleToggleEditMode()
      showToast(
        `${count}개의 선물을 삭제했습니다.`,
        deletedItems.length > 0 ? '실행취소' : undefined,
        deletedItems.length > 0 ? () => recreateDeletedItems(deletedItems) : undefined,
      )
    } catch (err) {
      console.error('위시 일괄 삭제 실패:', err)
    } finally {
      setBulkDeleteConfirmOpen(false)
    }
  }, [selectedIds, rawItems, refetch, clearSelection, handleToggleEditMode, showToast, recreateDeletedItems])

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
                className={`rounded-full px-4 py-3 text-b2-m transition-colors ${
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
            {/* 편집 모드에서는 정렬 버튼을 숨기되(피그마 기준 opacity-0), 레이아웃이 흔들리지 않도록 자리는 유지합니다 */}
            <button
              type="button"
              onClick={() => setSortSheetOpen(true)}
              disabled={isEditMode}
              className={`flex items-center gap-1 ${isEditMode ? 'invisible' : ''}`}
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
              {isEditMode ? '취소' : '편집'}
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        {wishedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
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

      {/* Edit Mode Sticky Selection Bar (피그마 1746:51300 기준: 대칭용 빈 자리-왼쪽 / 텍스트-중앙 / 삭제 버튼-오른쪽) */}
      {isEditMode && (
        <div className="fixed bottom-0 left-1/2 z-30 flex h-14 w-full max-w-[402px] -translate-x-1/2 items-center justify-between border-t border-gray-200 bg-gray-100/80 px-[18px] backdrop-blur-[30px]">
          {/* 중앙 텍스트를 대칭으로 맞추기 위한 빈 자리 (우측 삭제 버튼과 동일 크기) */}
          <span className="size-6" aria-hidden />
          <p className="text-b1-m text-black -translate-y-1">{selectedIds.length}개의 선물이 선택됨</p>
          <button
            type="button"
            aria-label="선택한 선물 삭제"
            disabled={selectedIds.length === 0}
            onClick={() => setBulkDeleteConfirmOpen(true)}
            className="text-black disabled:text-gray-300"
          >
            <TrashIcon className="size-7" />
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

      {/* BottomNav is shown ONLY when gift creation bar/편집 모드 선택바가 활성화되어 있지 않을 때 */}
      {!isGiftMakingActive && !isEditMode && <BottomNav active="gift" />}

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
        title="1개의 선물을 삭제할까요?"
        description="삭제하면 해당 선물이 위시에서 사라져요"
        buttons={[
          {
            label: '취소하기',
            onClick: () => setDeleteConfirmOpen(false),
            variant: 'secondary',
          },
          {
            label: '삭제하기',
            onClick: handleConfirmDelete,
            variant: 'primary',
          },
        ]}
        onDimClick={() => setDeleteConfirmOpen(false)}
      />

      {/* Bulk Delete Confirmation Modal (EmojiPopup - Figma 1716:105465) */}
      <EmojiPopup
        open={bulkDeleteConfirmOpen}
        icon="alert"
        title={`${selectedIds.length}개의 선물을 삭제할까요?`}
        description="삭제하면 해당 선물이 위시에서 사라져요"
        buttons={[
          {
            label: '취소하기',
            onClick: () => setBulkDeleteConfirmOpen(false),
            variant: 'secondary',
          },
          {
            label: '삭제하기',
            onClick: handleConfirmBulkDelete,
            variant: 'primary',
          },
        ]}
        onDimClick={() => setBulkDeleteConfirmOpen(false)}
      />

      {/* Toast Snackbar (Figma 1716:107011). 네비바 뒤 그라디언트 그림자(1746:51319, h-125px)가
          끝나는 지점부터 보이도록 bottom을 그 높이에 맞춥니다. */}
      <Toast
        open={toastMessage !== null}
        message={toastMessage ?? ''}
        actionLabel={toastActionLabel}
        onAction={handleToastAction}
        bottomClass="bottom-[110px]"
      />
    </div>
  )
}
