import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import Header from '../../components/common/Header'
import TextField from '../../components/common/TextField'
import Button from '../../components/common/Button'
import ProfileAvatar from './ProfileAvatar'
import TermsBottomSheet from './TermsBottomSheet'
import { useAuth } from '../../hooks/useAuth'
import { replayShake } from '../../utils/shake'
import { updateMyProfile } from '../../api/users'
import { ApiError } from '../../lib/apiClient'

const NICKNAME_MAX_LENGTH = 6
// 화면 전체 흔들림은 입력창 자체보다 훨씬 은은하게 느껴지도록 진폭을 크게 줄입니다.
const PAGE_SHAKE_AMPLITUDE = '0.4px'

/** 회원가입 마지막 단계: 프로필(닉네임/사진) 설정 페이지 */
export default function ProfileSetupPage() {
  const [nickname, setNickname] = useState('')
  const [termsOpen, setTermsOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login } = useAuth()
  const pageRef = useRef<HTMLDivElement>(null)

  // TODO: ProfileAvatar의 onSelect로 받은 프로필 사진 File 업로드 연동 (백엔드 업로드 API 없음)
  const updateProfileMutation = useMutation({
    mutationFn: () => updateMyProfile({ nickname }),
    onSuccess: () => {
      login()
      setTermsOpen(false)
      navigate('/home')
    },
    onError: (error) => {
      setTermsOpen(false)
      setErrorMessage(error instanceof ApiError ? error.message : '닉네임 저장에 실패했어요. 다시 시도해 주세요.')
      replayShake(pageRef.current)
    },
  })

  const handleConfirm = () => {
    setErrorMessage(null)
    updateProfileMutation.mutate()
  }

  return (
    <div
      ref={pageRef}
      className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white"
      style={{ '--shake-amp': PAGE_SHAKE_AMPLITUDE } as React.CSSProperties}
    >
      <Header title="프로필" />

      <div className="flex flex-col gap-1 px-[18px] pt-6">
        <h1 className="text-h3-sb text-black">마지막 단계예요, 프로필을 완성해 볼까요?</h1>
        <p className="text-caption1-r leading-normal text-gray-600">마이페이지에서 프로필을 수정할 수 있어요</p>
      </div>

      <div className="mt-[69px] flex flex-col items-center gap-2">
        {/* TODO: onSelect로 크롭된 프로필 사진 File을 받아 가입 요청에 포함해야 함 */}
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
          onOverflow={() => replayShake(pageRef.current)}
        />
        {errorMessage && <p className="text-caption1-r text-pink-500">{errorMessage}</p>}
        <Button
          disabled={nickname.length === 0 || updateProfileMutation.isPending}
          onClick={() => setTermsOpen(true)}
        >
          가입
        </Button>
      </div>

      <TermsBottomSheet open={termsOpen} onClose={() => setTermsOpen(false)} onConfirm={handleConfirm} />
    </div>
  )
}
