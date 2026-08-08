import { useNavigate } from 'react-router-dom'
import { useWishForm } from './hooks/useWishForm'
import { WishForm } from './components/WishForm'
import { setPendingToast } from './hooks/useWishToast'
import { createWishlistItem } from '../../api/wishlists'
import { uploadImage } from '../../utils/uploadImage'

const WISH_IMAGE_PREFIX = 'wishlists'

/** 위시 등록하기 페이지 (피그마 기준 frame 1716:106685) */
export default function WishCreatePage() {
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
  } = useWishForm()

  const handleSubmit = async () => {
    if (!isFormValid) return
    const numericPrice = Number(price.replace(/\D/g, ''))
    try {
      const imageUrl = imageFile ? await uploadImage(WISH_IMAGE_PREFIX, imageFile) : image || undefined
      const created = await createWishlistItem({
        name,
        price: numericPrice,
        purchaseUrl,
        imageUrl,
        type: wishType === 'receive' ? 'RECEIVE' : 'GIVE',
      })
      setPendingToast('1개의 선물이 등록 되었습니다', {
        type: 'create',
        wishlistItemId: created.wishlistItemId,
      })
      navigate('/wish')
    } catch (err) {
      console.error('위시 아이템 생성 실패:', err)
    }
  }

  return (
    <WishForm
      title="위시 등록하기"
      submitText="등록 완료"
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
