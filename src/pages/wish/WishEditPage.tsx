import { useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWishForm } from './hooks/useWishForm'
import { WishForm } from './components/WishForm'
import { useWishedProducts } from './hooks/useWishedProducts'
import { updateWishlistItem } from '../../api/wishlists'
import type { WishType } from '../../store/wishStore'

interface WishEditFormProps {
  wishlistItemId: number
  initialData?: {
    name: string
    price: number
    purchaseUrl?: string
    image?: string
    wishType: WishType
  }
}

/** 위시 수정 폼 (피그마 기준 frame 1716:106795 / 1716:106899) */
function WishEditForm({ wishlistItemId, initialData }: WishEditFormProps) {
  const navigate = useNavigate()

  const {
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
  } = useWishForm(initialData)

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return
    const numericPrice = Number(price.replace(/\D/g, ''))
    try {
      await updateWishlistItem(wishlistItemId, {
        name,
        price: numericPrice,
        purchaseUrl,
        imageUrl: image || undefined,
        type: wishType === 'receive' ? 'RECEIVE' : 'GIVE',
      })
      navigate('/wish')
    } catch (err) {
      console.error('위시 수정 실패:', err)
    }
  }, [isFormValid, price, wishlistItemId, wishType, name, purchaseUrl, image, navigate])

  return (
    <WishForm
      title="위시 수정하기"
      submitText="수정 완료"
      wishType={wishType}
      onWishTypeChange={setWishType}
      name={name}
      onNameChange={setName}
      price={price}
      onPriceChange={setPrice}
      purchaseUrl={purchaseUrl}
      onPurchaseUrlChange={setPurchaseUrl}
      image={image}
      onImageRemove={() => setImage(null)}
      onImageClick={() => setSelectSheetOpen(true)}
      selectSheetOpen={selectSheetOpen}
      onSelectSheetClose={() => setSelectSheetOpen(false)}
      onFileSelect={handleFileSelect}
      isValid={isFormValid}
      onSubmit={handleSubmit}
    />
  )
}

/** 위시 수정하기 (피그마 기준) */
export default function WishEditPage() {
  const { id } = useParams()
  const wishlistItemId = Number(id)
  const { rawItems } = useWishedProducts('all')

  const currentItem = useMemo(() => {
    return rawItems.find((item) => item.wishlistItemId === wishlistItemId)
  }, [rawItems, wishlistItemId])

  const initialData = useMemo(() => {
    if (!currentItem) return undefined
    return {
      name: currentItem.name,
      price: currentItem.price,
      purchaseUrl: currentItem.purchaseUrl,
      image: currentItem.imageUrl,
      wishType: (currentItem.type === 'RECEIVE' ? 'receive' : 'give') as WishType,
    }
  }, [currentItem])

  return <WishEditForm wishlistItemId={wishlistItemId} initialData={initialData} />
}
