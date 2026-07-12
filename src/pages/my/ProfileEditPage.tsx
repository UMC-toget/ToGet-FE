import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import TextField from '../../components/common/TextField'
import Button from '../../components/common/Button'
import MenuRow from '../../components/common/MenuRow'
import BottomNav from '../../components/common/BottomNav'
import ConfirmModal from '../../components/common/ConfirmModal'
import ProfileAvatar from '../signup/ProfileAvatar'
import { useAuth } from '../../hooks/useAuth'
import { MOCK_USER } from './mockUser'

const NICKNAME_MAX_LENGTH = 6

/** 내 정보 페이지: 닉네임/프로필 사진 변경, 로그아웃/계정 삭제 */
export default function ProfileEditPage() {
  const [name, setName] = useState(MOCK_USER.name)
  const [nickname, setNickname] = useState('')
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleSave = () => {
    // TODO: 회원 정보 수정 API 연동
    setName(nickname)
    setNickname('')
  }

  const handleLogout = () => {
    // TODO: 로그아웃 API 연동
    logout()
    navigate('/my', { state: { toast: '로그아웃이 완료 되었습니다' } })
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-32">
      <Header title="내 정보" />

      <div className="mt-6 flex flex-col items-center gap-2">
        <ProfileAvatar />
        <p className="text-h3-sb text-black">{name}</p>
      </div>

      <div className="mt-6 flex flex-col gap-5 px-[18px]">
        <TextField
          label="닉네임 변경"
          value={nickname}
          maxLength={NICKNAME_MAX_LENGTH}
          placeholder="닉네임을 입력해주세요"
          onChange={(e) => setNickname(e.target.value)}
        />
        <Button disabled={nickname.length === 0} onClick={handleSave}>
          저장
        </Button>
      </div>

      <div className="mt-7 h-3 w-full shrink-0 bg-background" />

      <div className="mt-7 flex flex-col gap-3 px-[18px]">
        <MenuRow label="로그아웃" chevron={false} onClick={() => setLogoutModalOpen(true)} />
        {/* TODO: 계정 삭제 플로우 구현 */}
        <MenuRow label="계정 삭제" chevron={false} />
      </div>

      <ConfirmModal
        open={logoutModalOpen}
        title="로그아웃 하시겠습니까?"
        description="언제든 다시 로그인 할 수 있어요"
        confirmText="로그아웃"
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />

      <BottomNav active="my" />
    </div>
  )
}
