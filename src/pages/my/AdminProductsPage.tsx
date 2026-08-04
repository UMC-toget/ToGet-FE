import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Header from '../../components/common/Header'
import ConfirmModal from '../../components/common/ConfirmModal'
import Toast from '../../components/common/Toast'
import { getProducts, deleteProduct } from '../../api/products'
import type { ApiProduct } from '../../api/products'
import { useRequireAdmin } from '../../hooks/useRequireAdmin'

const PRODUCT_LIST_SIZE = 100

/** [관리자 전용] 상품 관리: 목록 조회 + 등록/수정/삭제 진입점 */
export default function AdminProductsPage() {
  useRequireAdmin()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: () => getProducts({ size: PRODUCT_LIST_SIZE, sort: 'LATEST' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (productId: number) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setDeleteTarget(null)
    },
    onError: () => {
      setErrorMessage('상품 삭제에 실패했어요. 다시 시도해 주세요.')
      setDeleteTarget(null)
    },
  })

  const products = data?.products ?? []

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-12">
      <Header
        title="선물 관리"
        right={
          <button
            type="button"
            onClick={() => navigate('/admin/products/new')}
            className="text-b2-m font-semibold text-pink-500"
          >
            등록
          </button>
        }
      />

      <div className="flex flex-col gap-3 px-[18px] py-5">
        {isLoading && <p className="py-16 text-center text-b2-r text-gray-500">불러오는 중...</p>}

        {!isLoading && products.length === 0 && (
          <p className="py-16 text-center text-b2-r text-gray-500">등록된 상품이 없어요</p>
        )}

        {products.map((product) => (
          <div
            key={product.productId}
            className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
          >
            <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-background">
              {product.imageUrl && (
                <img src={product.imageUrl} alt="" className="size-full object-cover" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-b2-m text-black">{product.name}</p>
              <p className="text-caption1-r text-gray-600">{product.price.toLocaleString()}원</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/admin/products/${product.productId}/edit`)}
                className="text-caption1-m text-gray-700"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(product)}
                className="text-caption1-m text-pink-500"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="상품을 삭제할까요?"
        description={deleteTarget?.name}
        confirmText="삭제하기"
        cancelText="취소"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.productId)}
      />

      <Toast open={errorMessage !== null} message={errorMessage ?? ''} standalone />
    </div>
  )
}
