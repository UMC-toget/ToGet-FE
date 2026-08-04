import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Header from '../../components/common/Header'
import TextField from '../../components/common/TextField'
import Button from '../../components/common/Button'
import Toast from '../../components/common/Toast'
import { getProduct, createProduct, updateProduct } from '../../api/products'
import { uploadImage } from '../../utils/uploadImage'
import { useRequireAdmin } from '../../hooks/useRequireAdmin'

const PRODUCT_IMAGE_PREFIX = 'products'

interface ProductFormState {
  name: string
  price: string
  description: string
  purchaseUrl: string
  category: string
  brand: string
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  price: '',
  description: '',
  purchaseUrl: '',
  category: '',
  brand: '',
}

/** [관리자 전용] 상품 등록/수정 폼. :productId 유무로 등록/수정 모드를 구분합니다. */
export default function AdminProductFormPage() {
  useRequireAdmin()
  const { productId } = useParams<{ productId: string }>()
  const isEditMode = productId !== undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: existingProduct } = useQuery({
    queryKey: ['adminProduct', productId],
    queryFn: () => getProduct(Number(productId)),
    enabled: isEditMode,
  })

  useEffect(() => {
    if (!existingProduct) return
    setForm({
      name: existingProduct.name,
      price: String(existingProduct.price),
      description: existingProduct.description ?? '',
      purchaseUrl: existingProduct.purchaseUrl,
      category: existingProduct.category ?? '',
      brand: existingProduct.brand ?? '',
    })
    setImagePreviewUrl(existingProduct.imageUrl ?? null)
  }, [existingProduct])

  const handleImageSelect = (file: File) => {
    setImageFile(file)
    setImagePreviewUrl(URL.createObjectURL(file))
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const imageUrl = imageFile
        ? await uploadImage(PRODUCT_IMAGE_PREFIX, imageFile)
        : (existingProduct?.imageUrl ?? undefined)
      const payload = {
        name: form.name,
        price: Number(form.price),
        description: form.description || undefined,
        imageUrl,
        purchaseUrl: form.purchaseUrl,
        category: form.category || undefined,
        brand: form.brand || undefined,
      }
      if (isEditMode) {
        return updateProduct(Number(productId), payload)
      }
      return createProduct(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      navigate(-1)
    },
    onError: () => {
      setErrorMessage(
        isEditMode ? '상품 수정에 실패했어요. 다시 시도해 주세요.' : '상품 등록에 실패했어요. 다시 시도해 주세요.',
      )
    },
  })

  const isFormValid = form.name.trim().length > 0 && Number(form.price) > 0 && form.purchaseUrl.trim().length > 0

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-12">
      <Header title={isEditMode ? '상품 수정' : '상품 등록'} />

      <div className="flex flex-col gap-5 px-[18px] py-6">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex size-24 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-background"
          >
            {imagePreviewUrl ? (
              <img src={imagePreviewUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-caption1-r text-gray-500">사진 추가</span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageSelect(file)
            }}
          />
        </div>

        <TextField
          label="상품명"
          value={form.name}
          maxLength={100}
          placeholder="상품명을 입력해 주세요"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <TextField
          label="가격"
          value={form.price ? Number(form.price).toLocaleString() : ''}
          inputMode="numeric"
          placeholder="가격을 입력해 주세요"
          suffix="원"
          onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^0-9]/g, '') })}
        />

        <TextField
          label="구매 링크"
          value={form.purchaseUrl}
          placeholder="https://..."
          onChange={(e) => setForm({ ...form, purchaseUrl: e.target.value })}
        />

        <TextField
          label="브랜드"
          value={form.brand}
          maxLength={50}
          placeholder="브랜드를 입력해 주세요 (선택)"
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
        />

        <TextField
          label="카테고리"
          value={form.category}
          maxLength={50}
          placeholder="카테고리를 입력해 주세요 (선택)"
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <div className="flex w-full flex-col gap-2">
          <label className="text-b1-m text-black">상품 설명</label>
          <textarea
            value={form.description}
            placeholder="상품 설명을 입력해 주세요 (선택)"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full resize-none rounded-lg border border-transparent bg-background px-4 py-3 text-b1-m text-black outline-none placeholder:text-gray-400 focus-within:border-gray-700"
          />
        </div>

        <Button
          disabled={!isFormValid || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {isEditMode ? '수정하기' : '등록하기'}
        </Button>
      </div>

      <Toast open={errorMessage !== null} message={errorMessage ?? ''} standalone />
    </div>
  )
}
