import { useState, useCallback } from 'react'
import type { WishType } from '../../../store/wishStore'

export interface InitialWishFormData {
  name?: string
  price?: number
  purchaseUrl?: string
  image?: string
  wishType?: WishType
}

export function useWishForm(initialData?: InitialWishFormData) {
  const [wishType, setWishType] = useState<WishType>(initialData?.wishType ?? 'receive')
  const [name, setName] = useState(initialData?.name ?? '')
  const [price, setPrice] = useState(initialData?.price !== undefined ? String(initialData.price) : '')
  const [purchaseUrl, setPurchaseUrl] = useState(initialData?.purchaseUrl ?? '')
  const [image, setImage] = useState<string | null>(initialData?.image ?? null)

  const [selectSheetOpen, setSelectSheetOpen] = useState(false)

  const hasChanges =
    wishType !== (initialData?.wishType ?? 'receive') ||
    name !== (initialData?.name ?? '') ||
    price !== (initialData?.price !== undefined ? String(initialData.price) : '') ||
    purchaseUrl !== (initialData?.purchaseUrl ?? '') ||
    image !== (initialData?.image ?? null)

  // 백엔드가 purchaseUrl을 필수(minLength 1)로 요구해 name/price와 함께 필수 검증합니다
  const isValidInput =
    name.trim().length > 0 && price.trim().length > 0 && purchaseUrl.trim().length > 0
  const isFormValid = initialData ? isValidInput && hasChanges : isValidInput

  // PhotoActionSheet가 자체 크롭(1:1)까지 끝낸 File을 넘겨주므로 바로 미리보기로 반영합니다.
  const handleFileSelect = useCallback((file: File) => {
    setImage((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }, [])

  return {
    wishType,
    setWishType,
    name,
    setName,
    price,
    setPrice,
    purchaseUrl,
    setPurchaseUrl,
    image,
    setImage,
    selectSheetOpen,
    setSelectSheetOpen,
    isFormValid,
    handleFileSelect,
  }
}
