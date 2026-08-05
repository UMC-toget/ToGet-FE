import { useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWishForm } from './hooks/useWishForm'
import { WishForm } from './components/WishForm'
import { useWishStore } from '../../store/wishStore'
import { useProducts } from '../home/useProducts'
import type { WishType } from '../../store/wishStore'

interface WishEditFormProps {
  productId: number
  initialData?: {
    name: string
    price: number
    purchaseUrl?: string
    image?: string
    wishType: WishType
  }
}

/** 위시 수정 폼 (피그마 기준 frame 1716:106795 / 1716:106899) */
function WishEditForm({ productId, initialData }: WishEditFormProps) {
  const navigate = useNavigate()
  const updateWish = useWishStore((state) => state.updateWish)

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

  const handleSubmit = useCallback(() => {
    if (!isFormValid) return
    const numericPrice = Number(price.replace(/\D/g, ''))
    updateWish(productId, {
      wishType,
      name,
      price: numericPrice,
      purchaseUrl,
      image: image || '',
    })
    navigate('/wish')
  }, [isFormValid, price, updateWish, productId, wishType, name, purchaseUrl, image, navigate])

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
  const productId = Number(id)
  const wishes = useWishStore((state) => state.wishes)
  const customWishes = useWishStore((state) => state.customWishes)
  const { products } = useProducts()

  const wishesOfId = wishes[productId]
  const wishType: WishType = Array.isArray(wishesOfId)
    ? wishesOfId[0] ?? 'receive'
    : (wishesOfId as WishType) ?? 'receive'

  const customItem = customWishes[productId]
  const baseProduct = useMemo(() => products.find((p) => p.id === productId), [products, productId])

  const initialData = useMemo(() => {
    if (customItem) {
      return {
        name: customItem.name,
        price: customItem.price,
        purchaseUrl: customItem.purchaseUrl,
        image: customItem.image,
        wishType: customItem.wishType,
      }
    }
    if (baseProduct) {
      return {
        name: baseProduct.name,
        price: baseProduct.price,
        purchaseUrl: baseProduct.link,
        image: baseProduct.image,
        wishType,
      }
    }
    return undefined
  }, [customItem, baseProduct, wishType])

  return <WishEditForm productId={productId} initialData={initialData} />
}
