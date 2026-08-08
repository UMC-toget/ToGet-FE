import { useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWishForm } from './hooks/useWishForm'
import { WishForm } from './components/WishForm'
import { useWishedProducts } from './hooks/useWishedProducts'
import { setPendingToast } from './hooks/useWishToast'
import { updateWishlistItem } from '../../api/wishlists'
import { uploadImage } from '../../utils/uploadImage'
import type { WishType } from '../../store/wishStore'

const WISH_IMAGE_PREFIX = 'wishlists'

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
    imageFile,
    selectSheetOpen,
    setSelectSheetOpen,
    isFormValid,
    handleFileSelect,
    handleImageRemove,
  } = useWishForm(initialData)

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return
    const numericPrice = Number(price.replace(/\D/g, ''))
    try {
      const imageUrl = imageFile ? await uploadImage(WISH_IMAGE_PREFIX, imageFile) : image || undefined
      await updateWishlistItem(wishlistItemId, {
        name,
        price: numericPrice,
        purchaseUrl,
        imageUrl,
        type: wishType === 'receive' ? 'RECEIVE' : 'GIVE',
      })
      setPendingToast(
        '1개의 선물을 수정 완료 했습니다',
        initialData && {
          type: 'edit',
          wishlistItemId,
          previousData: {
            name: initialData.name,
            price: initialData.price,
            purchaseUrl: initialData.purchaseUrl ?? '',
            imageUrl: initialData.image,
            type: initialData.wishType === 'receive' ? 'RECEIVE' : 'GIVE',
          },
        },
      )
      navigate('/wish')
    } catch (err) {
      console.error('위시 수정 실패:', err)
    }
  }, [isFormValid, price, wishlistItemId, wishType, name, purchaseUrl, image, imageFile, initialData, navigate])

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
      onImageRemove={handleImageRemove}
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

  // 조회가 비동기라 initialData가 나중에 채워지는데, useWishForm의 useState 초기값은
  // 마운트 시점 값만 캡처합니다. key로 데이터 도착 시 폼을 새로 마운트시켜 다시 채웁니다.
  return (
    <WishEditForm
      key={currentItem ? 'loaded' : 'loading'}
      wishlistItemId={wishlistItemId}
      initialData={initialData}
    />
  )
}
