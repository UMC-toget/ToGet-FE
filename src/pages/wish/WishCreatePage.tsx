import { useNavigate } from 'react-router-dom'
import { useWishForm } from './hooks/useWishForm'
import { WishForm } from './components/WishForm'
import { createWishlistItem } from '../../api/wishlists'

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
    setImage,
    selectSheetOpen,
    setSelectSheetOpen,
    isFormValid,
    handleFileSelect,
  } = useWishForm()

  const handleSubmit = async () => {
    if (!isFormValid) return
    const numericPrice = Number(price.replace(/\D/g, ''))
    try {
      await createWishlistItem({
        name,
        price: numericPrice,
        purchaseUrl,
        imageUrl: image || undefined,
        type: wishType === 'receive' ? 'RECEIVE' : 'GIVE',
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
