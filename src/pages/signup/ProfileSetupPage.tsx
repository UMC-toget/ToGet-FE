import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import TextField from '../../components/common/TextField'
import Button from '../../components/common/Button'
import ProfileAvatar from './ProfileAvatar'
import TermsBottomSheet from './TermsBottomSheet'
import { useAuth } from '../../hooks/useAuth'

const NICKNAME_MAX_LENGTH = 6

/** 회원가입 마지막 단계: 프로필(닉네임/사진) 설정 페이지 */
export default function ProfileSetupPage() {
  const [nickname, setNickname] = useState('')
  const [termsOpen, setTermsOpen] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleConfirm = () => {
    // TODO: 가입 API 연동
    login()
    setTermsOpen(false)
    navigate('/home')
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="프로필" />

      <div className="flex flex-col gap-1 px-[18px] pt-6">
        <h1 className="text-h3-sb text-black">마지막 단계예요, 프로필을 완성해 볼까요?</h1>
        <p className="text-caption1-r leading-normal text-gray-600">마이페이지에서 프로필을 수정할 수 있어요</p>
      </div>

      <div className="mt-[69px] flex flex-col items-center gap-2">
        <ProfileAvatar />
        <p className="text-h3-sb text-black">{nickname || '닉네임'}</p>
      </div>

      <div className="mt-6 flex flex-col gap-5 px-[18px]">
        <TextField
          label="닉네임"
          value={nickname}
          maxLength={NICKNAME_MAX_LENGTH}
          placeholder="닉네임을 입력해 주세요"
          onChange={(e) => setNickname(e.target.value)}
        />
        <Button disabled={nickname.length === 0} onClick={() => setTermsOpen(true)}>
          가입
        </Button>
      </div>

      <TermsBottomSheet open={termsOpen} onClose={() => setTermsOpen(false)} onConfirm={handleConfirm} />
    </div>
  )
}
