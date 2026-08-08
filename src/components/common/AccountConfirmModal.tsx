import ConfirmModal from './ConfirmModal'

interface AccountConfirmModalProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

/**
 * 계좌 등록/수정 제출 전 마지막 확인 팝업 (돈이 오가는 단계라 한 번 더 확인시킴).
 * 마이(I), 내 선물 페이지 만들기(D), 함께 선물 페이지 만들기(G)에서 문구가 동일해 공통으로 뺐습니다.
 */
export default function AccountConfirmModal({ open, onCancel, onConfirm }: AccountConfirmModalProps) {
  return (
    <ConfirmModal
      open={open}
      title="계좌 정보를 확인해 주세요"
      description={'입력한 계좌로 선물 금액이 전달돼요.\n계좌 정보가 맞는지 다시 확인해 주세요.'}
      cancelText="다시 확인할게요"
      confirmText="네, 확인했어요"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
