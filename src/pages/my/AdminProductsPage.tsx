import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Header from '../../components/common/Header'
import Toast from '../../components/common/Toast'
import SelectModeBar from '../../components/common/SelectModeBar'
import SelectCheckBadge from '../../components/common/SelectCheckBadge'
import CategoryChips from '../../components/common/CategoryChips'
import GiftIcon from '../../components/icons/GiftIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import { getProducts, deleteProduct } from '../../api/products'
import { GIFT_CATEGORIES } from '../home/products'
import { useRequireAdmin } from '../../hooks/useRequireAdmin'

const PRODUCT_LIST_SIZE = 100
const POPULAR_CATEGORY = GIFT_CATEGORIES[0]

/** [관리자 전용] 선물 관리: 카테고리별 상품 목록 조회 + 등록/수정/삭제 (피그마 4668:70754 기준) */
export default function AdminProductsPage() {
  useRequireAdmin()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [category, setCategory] = useState<(typeof GIFT_CATEGORIES)[number]>(POPULAR_CATEGORY)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isPopular = category === POPULAR_CATEGORY
  const { data, isLoading } = useQuery({
    queryKey: ['adminProducts', category],
    queryFn: () =>
      getProducts({
        category: isPopular ? undefined : category,
        size: PRODUCT_LIST_SIZE,
        sort: isPopular ? 'WISHLIST_DESC' : 'LATEST',
      }),
  })
  const products = data?.products ?? []

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  const changeCategory = (next: (typeof GIFT_CATEGORIES)[number]) => {
    setCategory(next)
    exitSelectMode()
  }

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => Promise.all(ids.map((id) => deleteProduct(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      exitSelectMode()
    },
    onError: () => setErrorMessage('선물 삭제에 실패했어요. 다시 시도해 주세요.'),
  })

  const handleDeleteClick = () => {
    if (selectMode) {
      const ids = Array.from(selectedIds)
      if (ids.length === 0) return
      deleteMutation.mutate(ids)
      return
    }
    setSelectMode(true)
  }

  const handleCardClick = (productId: number) => {
    if (selectMode) {
      toggleSelected(productId)
      return
    }
    navigate(`/admin/products/${productId}/edit`)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-32">
      <Header title="선물 관리" />

      <div className="flex flex-col gap-4 px-[18px] py-5">
        <CategoryChips categories={GIFT_CATEGORIES} selected={category} onSelect={(c) => changeCategory(c as (typeof GIFT_CATEGORIES)[number])} />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-b1-m text-black">선물</h2>
            {selectMode ? (
              <button type="button" onClick={exitSelectMode} className="text-b2-r text-gray-400">
                취소
              </button>
            ) : (
              <span className="text-b2-r text-gray-400">총 {products.length}개</span>
            )}
          </div>

          {isLoading && <p className="py-16 text-center text-b2-r text-gray-500">불러오는 중...</p>}

          {!isLoading && products.length === 0 && (
            <p className="py-16 text-center text-b2-r text-gray-500">등록된 선물이 없어요</p>
          )}

          {!isLoading && products.length > 0 && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              {products.map((product, index) => (
                <button
                  key={product.productId}
                  type="button"
                  onClick={() => handleCardClick(product.productId)}
                  className="flex flex-col gap-2 text-left"
                >
                  <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-background">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <GiftIcon className="size-10 text-gray-300" />
                    )}
                    <span className="absolute left-3 top-3 flex size-6 items-center justify-center rounded-full bg-gray-700 text-caption1-m text-white">
                      <span className="translate-y-[-0.5px]">{index + 1}</span>
                    </span>
                    {selectMode && <SelectCheckBadge selected={selectedIds.has(product.productId)} position="right-3 top-3" />}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-caption1-r text-gray-700">{product.brand}</span>
                      <ChevronRightIcon className="size-5 text-gray-700" />
                    </div>
                    <p className="line-clamp-2 min-h-[42px] leading-normal text-b2-m text-black">{product.name}</p>
                  </div>
                  <p className="text-b2-m text-black">
                    <span className="font-semibold">{product.price.toLocaleString()}</span>원
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectMode ? (
        <SelectModeBar count={selectedIds.size} label="선물" onDelete={handleDeleteClick} />
      ) : (
        <div className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[402px] -translate-x-1/2 gap-3 bg-gradient-to-b from-white/0 to-white/80 px-[18px] pb-[calc(env(safe-area-inset-bottom)+16px)] pt-8">
          <button
            type="button"
            onClick={handleDeleteClick}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-gray-600 bg-white text-sm font-semibold text-black"
          >
            삭제하기
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products/new')}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white"
          >
            추가하기
          </button>
        </div>
      )}

      <Toast open={errorMessage !== null} message={errorMessage ?? ''} standalone />
    </div>
  )
}
