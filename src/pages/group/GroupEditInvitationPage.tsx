import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import TogetherStep3Invite from '../../components/create/TogetherStep3Invite'

// 접근: 개설자 전용 | 선물 페이지 수정 3단계 — 초대장 (G섹션 스텝 재사용, 진행바 없음)
export default function GroupEditInvitationPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header
        title="3단계 : 초대장"
        right={
          <button type="button" onClick={() => navigate(-1)} className="text-b2-m text-black">
            나가기
          </button>
        }
      />
      <div className="flex flex-1 flex-col overflow-hidden px-[18px] pb-6 pt-5">
        <TogetherStep3Invite onNext={() => navigate(-1)} />
      </div>
    </div>
  )
}
