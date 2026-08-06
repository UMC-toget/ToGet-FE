import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FundingListPage from './FundingListPage'
import TogetherGiftListCard from './TogetherGiftListCard'
import Toast from '../../components/common/Toast'
import type { MyFunding } from '../../api/users'

const TOAST_DURATION_MS = 2500

/** 마이페이지 '함께 선물 페이지' 목록 (이슈 #317, fundingType=TOGETHER_GIFT) */
export default function TogetherGiftListPage() {
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleShareInvite = async (funding: MyFunding) => {
    const inviteUrl = `${window.location.origin}/group/${funding.fundingId}`
    try {
      if (navigator.share) {
        await navigator.share({ title: funding.title, url: inviteUrl })
        return
      }
      await navigator.clipboard.writeText(inviteUrl)
      setToastMessage('초대장 링크가 복사되었어요')
      setTimeout(() => setToastMessage(null), TOAST_DURATION_MS)
    } catch {
      // 사용자가 공유 시트를 취소한 경우 등 - 조용히 무시
    }
  }

  return (
    <>
      <FundingListPage
        title="함께 선물 페이지"
        fundingType="TOGETHER_GIFT"
        renderCard={(funding) => (
          <TogetherGiftListCard
            funding={funding}
            onOpen={() => navigate(`/group/${funding.fundingId}`)}
            onShareInvite={() => handleShareInvite(funding)}
          />
        )}
      />
      <Toast open={toastMessage !== null} message={toastMessage ?? ''} standalone />
    </>
  )
}
