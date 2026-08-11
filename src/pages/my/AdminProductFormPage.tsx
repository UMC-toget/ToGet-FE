import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Header from '../../components/common/Header'
import TextField from '../../components/common/TextField'
import Button from '../../components/common/Button'
import Toast from '../../components/common/Toast'
import PlusIcon from '../../components/icons/PlusIcon'
import { getProduct, createProduct, updateProduct } from '../../api/products'
import { GIFT_CATEGORIES } from '../home/products'
import { uploadImage } from '../../utils/uploadImage'
import { useRequireAdmin } from '../../hooks/useRequireAdmin'

const PRODUCT_IMAGE_PREFIX = 'products'
const NAME_MAX_LENGTH = 20
const BRAND_MAX_LENGTH = 20

interface ProductFormState {
  category: (typeof GIFT_CATEGORIES)[number] | ''
  name: string
  price: string
  purchaseUrl: string
  brand: string
}

const EMPTY_FORM: ProductFormState = {
  category: '',
  name: '',
  price: '',
  purchaseUrl: '',
  brand: '',
}

/** [관리자 전용] 선물 등록/수정 폼. :productId 유무로 등록/수정 모드를 구분합니다 (피그마 4668:71375 기준) */
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
    const category = GIFT_CATEGORIES.find((c) => c === existingProduct.category) ?? ''
    setForm({
      category,
      name: existingProduct.name,
      price: String(existingProduct.price),
      purchaseUrl: existingProduct.purchaseUrl,
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
        imageUrl,
        purchaseUrl: form.purchaseUrl,
        category: form.category || undefined,
        brand: form.brand,
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
        isEditMode ? '선물 수정에 실패했어요. 다시 시도해 주세요.' : '선물 등록에 실패했어요. 다시 시도해 주세요.',
      )
    },
  })

  const isFormValid =
    form.category !== '' &&
    form.brand.trim().length > 0 &&
    form.name.trim().length > 0 &&
    Number(form.price) > 0 &&
    form.purchaseUrl.trim().length > 0 &&
    (imagePreviewUrl !== null || imageFile !== null)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-12">
      <Header title={isEditMode ? '선물 수정' : '선물 등록'} />

      <div className="flex flex-col gap-4 px-[18px] py-6">
        <div className="flex flex-col gap-2">
          <label className="text-b1-m text-black">
            선물 유형 <span className="text-pink-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {GIFT_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, category: c })}
                className={`rounded-full px-4 py-2 text-b2-m ${
                  form.category === c ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <TextField
          label={
            <>
              브랜드 이름 <span className="text-pink-500">*</span>
            </>
          }
          value={form.brand}
          maxLength={BRAND_MAX_LENGTH}
          placeholder="등록할 브랜드 이름을 입력해주세요"
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
        />

        <TextField
          label={
            <>
              선물 이름 <span className="text-pink-500">*</span>
            </>
          }
          value={form.name}
          maxLength={NAME_MAX_LENGTH}
          placeholder="등록할 선물 이름을 입력해주세요"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <TextField
          label={
            <>
              선물 가격 <span className="text-pink-500">*</span>
            </>
          }
          value={form.price ? Number(form.price).toLocaleString() : ''}
          inputMode="numeric"
          placeholder="선물 가격을 입력해 주세요"
          suffix="원"
          onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^0-9]/g, '') })}
        />

        <TextField
          label={
            <>
              선물 구매처 링크 <span className="text-pink-500">*</span>
            </>
          }
          value={form.purchaseUrl}
          placeholder="구매 가능한 링크를 입력해 주세요"
          onChange={(e) => setForm({ ...form, purchaseUrl: e.target.value.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, '') })}
        />

        <div className="flex flex-col gap-2">
          <label className="text-b1-m text-black">
            선물 이미지 <span className="text-pink-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative flex size-[123px] items-center justify-center overflow-hidden rounded-2xl bg-background"
          >
            {imagePreviewUrl && (
              <img src={imagePreviewUrl} alt="" className="size-full object-cover" />
            )}
            <span className="absolute flex size-8 items-center justify-center rounded-2xl bg-gray-100 text-gray-700 shadow-sm">
              <PlusIcon className="size-5" />
            </span>
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

        <Button
          disabled={!isFormValid || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {isEditMode ? '수정 완료' : '추가 완료'}
        </Button>
      </div>

      <Toast open={errorMessage !== null} message={errorMessage ?? ''} standalone />
    </div>
  )
}
