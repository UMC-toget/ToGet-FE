import { useNavigate } from 'react-router-dom'
import { useWishForm } from './hooks/useWishForm'
import { WishForm } from './components/WishForm'
import { useWishStore } from '../../store/wishStore'

/** 위시 등록하기 페이지 (피그마 기준 frame 1716:106685) */
export default function WishCreatePage() {
  const navigate = useNavigate()
  const addWish = useWishStore((state) => state.addWish)

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

  const handleSubmit = () => {
    if (!isFormValid) return
    const numericPrice = Number(price.replace(/\D/g, ''))
    const newId = Date.now()
    addWish(newId, wishType, {
      name,
      price: numericPrice,
      purchaseUrl,
      image: image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60',
    })
    navigate('/wish')
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
