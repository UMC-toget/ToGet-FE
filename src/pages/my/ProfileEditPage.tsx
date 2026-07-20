import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import TextField from '../../components/common/TextField'
import Button from '../../components/common/Button'
import MenuRow from '../../components/common/MenuRow'
import BottomNav from '../../components/common/BottomNav'
import ConfirmModal from '../../components/common/ConfirmModal'
import ProfileAvatar from '../signup/ProfileAvatar'
import { useAuth } from '../../hooks/useAuth'
import { replayShake } from '../../utils/shake'
import { MOCK_USER } from './mockUser'

const NICKNAME_MAX_LENGTH = 6
// 화면 전체 흔들림은 입력창 자체보다 훨씬 은은하게 느껴지도록 진폭을 크게 줄입니다.
const PAGE_SHAKE_AMPLITUDE = '0.4px'

/** 내 정보 페이지: 닉네임/프로필 사진 변경, 로그아웃/계정 삭제 */
export default function ProfileEditPage() {
  const [name, setName] = useState(MOCK_USER.name)
  const [nickname, setNickname] = useState('')
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement>(null)

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

  const handleDeleteAccount = () => {
    // TODO: 계정 삭제 API 연동
    logout()
    navigate('/my', { state: { toast: '계정 삭제가 완료 되었습니다' } })
  }

  return (
    <div
      ref={pageRef}
      className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-32"
      style={{ '--shake-amp': PAGE_SHAKE_AMPLITUDE } as React.CSSProperties}
    >
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
          onOverflow={() => replayShake(pageRef.current)}
        />
        <Button disabled={nickname.length === 0} onClick={handleSave}>
          저장
        </Button>
      </div>

      <div className="mt-7 h-3 w-full shrink-0 bg-background" />

      <div className="mt-7 flex flex-col gap-3 px-[18px]">
        <MenuRow label="로그아웃" chevron={false} onClick={() => setLogoutModalOpen(true)} />
        <MenuRow label="계정 삭제" chevron={false} onClick={() => setDeleteModalOpen(true)} />
      </div>

      <ConfirmModal
        open={logoutModalOpen}
        title="로그아웃 하시겠습니까?"
        description="언제든 다시 로그인 할 수 있어요"
        confirmText="로그아웃"
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
      <ConfirmModal
        open={deleteModalOpen}
        title="계정을 삭제할까요?"
        description={'삭제하면 내 선물 페이지와\n참여 내역을 더 이상 확인할 수 없어요.'}
        agreeText="네, 동의합니다"
        confirmText="삭제하기"
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />

      <BottomNav active="my" />
    </div>
  )
}
