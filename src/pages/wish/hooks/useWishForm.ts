import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { WishType } from '../../../store/wishStore'

export interface InitialWishFormData {
  name?: string
  price?: number
  purchaseUrl?: string
  image?: string
  wishType?: WishType
}

export function useWishForm(initialData?: InitialWishFormData) {
  const navigate = useNavigate()
  const location = useLocation()

  const locationState = location.state as { croppedImage?: string; savedFormState?: any } | null
  const savedFormState = locationState?.savedFormState

  const initialWishType = savedFormState?.wishType ?? initialData?.wishType ?? 'receive'
  const initialName = savedFormState?.name ?? initialData?.name ?? ''
  const initialPrice = savedFormState?.price ?? (initialData?.price !== undefined ? String(initialData.price) : '')
  const initialPurchaseUrl = savedFormState?.purchaseUrl ?? initialData?.purchaseUrl ?? ''
  const initialImage = locationState?.croppedImage ?? savedFormState?.image ?? initialData?.image ?? null

  const [wishType, setWishType] = useState<WishType>(initialWishType)
  const [name, setName] = useState(initialName)
  const [price, setPrice] = useState(initialPrice)
  const [purchaseUrl, setPurchaseUrl] = useState(initialPurchaseUrl)
  const [image, setImage] = useState<string | null>(initialImage)

  const [selectSheetOpen, setSelectSheetOpen] = useState(false)

  // Sync if croppedImage arrives in location.state
  useEffect(() => {
    if (locationState?.croppedImage) {
      setImage(locationState.croppedImage)
    }
  }, [locationState?.croppedImage])

  const hasChanges =
    wishType !== (initialData?.wishType ?? 'receive') ||
    name !== (initialData?.name ?? '') ||
    price !== (initialData?.price !== undefined ? String(initialData.price) : '') ||
    purchaseUrl !== (initialData?.purchaseUrl ?? '') ||
    image !== (initialData?.image ?? null)

  const isFormValid = initialData
    ? name.trim().length > 0 && price.trim().length > 0 && hasChanges
    : name.trim().length > 0 && price.trim().length > 0

  const handleGoToCropPage = useCallback(
    (src: string) => {
      navigate('/wish/crop', {
        state: {
          imageSrc: src,
          returnPath: location.pathname,
          savedFormState: { wishType, name, price, purchaseUrl, image },
        },
      })
    },
    [navigate, location.pathname, wishType, name, price, purchaseUrl, image],
  )

  const handleFileSelect = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleGoToCropPage(reader.result)
        }
      }
      reader.readAsDataURL(file)
    },
    [handleGoToCropPage],
  )

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
