import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import Header from '../../components/common/Header'
import TextField from '../../components/common/TextField'
import Button from '../../components/common/Button'
import ProfileAvatar from './ProfileAvatar'
import TermsBottomSheet from './TermsBottomSheet'
import { useAuth } from '../../hooks/useAuth'
import { replayShake } from '../../utils/shake'
import { consumeReturnUrl } from '../../utils/returnUrl'
import { completeSignup } from '../../api/auth'
import { uploadImage } from '../../utils/uploadImage'
import { ApiError } from '../../lib/apiClient'
import { setTokens } from '../../lib/tokenStorage'

const NICKNAME_MAX_LENGTH = 6
const PROFILE_IMAGE_PREFIX = 'profiles'
// 화면 전체 흔들림은 입력창 자체보다 훨씬 은은하게 느껴지도록 진폭을 크게 줄입니다.
const PAGE_SHAKE_AMPLITUDE = '0.4px'

/** uploadImage() 실패를 completeSignup() 실패와 구분해 정확한 에러 메시지를 보여주기 위한 태그용 에러 */
class ProfileImageUploadError extends Error {}

/** 회원가입 마지막 단계: 프로필(닉네임/사진) 설정 페이지 */
export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const pageRef = useRef<HTMLDivElement>(null)
  // 로그인 화면에서 소셜 로그인 응답으로 받은, 회원가입 완료용 임시 토큰 (만료 10분)
  const signupToken = (location.state as { signupToken?: string } | null)?.signupToken
  // 약관 상세 페이지를 보러 나갔다 돌아오면 이 페이지가 재마운트되어 로컬 state가 초기화되므로,
  // 닉네임 입력값과 약관 바텀시트가 열려 있었는지를 signupToken 단위로 세션에 잠시 보관합니다.
  const nicknameStorageKey = signupToken ? `signup:nickname:${signupToken}` : null
  const termsOpenStorageKey = signupToken ? `signup:termsOpen:${signupToken}` : null
  const photoStorageKey = signupToken ? `signup:photo:${signupToken}` : null

  const [nickname, setNickname] = useState(() => (nicknameStorageKey && sessionStorage.getItem(nicknameStorageKey)) || '')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  // 사진은 크롭된 이미지를 data URL로 세션에 저장해 두고, 미리보기(ProfileAvatar imageUrl)와
  // completeSignup 업로드용 File 객체 복원(아래 useEffect) 둘 다에 사용합니다.
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(
    () => (photoStorageKey && sessionStorage.getItem(photoStorageKey)) || null,
  )
  const [termsOpen, setTermsOpen] = useState(
    () => !!termsOpenStorageKey && sessionStorage.getItem(termsOpenStorageKey) === 'true',
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 약관 상세 페이지에서 돌아와 재마운트된 경우, 세션에 저장해둔 미리보기로부터 업로드용 File을 복원합니다.
  useEffect(() => {
    if (!photoPreviewUrl) return
    let cancelled = false
    fetch(photoPreviewUrl)
      .then((res) => res.blob())
      .then((blob) => {
        if (!cancelled) setPhotoFile(new File([blob], 'profile.jpg', { type: blob.type || 'image/jpeg' }))
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNicknameChange = (value: string) => {
    setNickname(value)
    if (nicknameStorageKey) sessionStorage.setItem(nicknameStorageKey, value)
  }

  const handlePhotoSelect = (file: File) => {
    setPhotoFile(file)
    if (!photoStorageKey) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setPhotoPreviewUrl(dataUrl)
      try {
        sessionStorage.setItem(photoStorageKey, dataUrl)
      } catch {
        // 세션 저장 용량 초과 시 미리보기 유지 목적만 포기 — 업로드에는 영향 없음
      }
    }
    reader.readAsDataURL(file)
  }

  const openTerms = () => {
    setTermsOpen(true)
    if (termsOpenStorageKey) sessionStorage.setItem(termsOpenStorageKey, 'true')
  }

  const closeTerms = () => {
    setTermsOpen(false)
    if (termsOpenStorageKey) sessionStorage.removeItem(termsOpenStorageKey)
  }

  const completeSignupMutation = useMutation({
    mutationFn: async () => {
      if (!signupToken) throw new Error('signupToken 없음')
      let profileImageUrl: string | undefined
      if (photoFile) {
        try {
          profileImageUrl = await uploadImage(PROFILE_IMAGE_PREFIX, photoFile)
        } catch {
          throw new ProfileImageUploadError()
        }
      }
      return completeSignup({ signupToken, nickname, profileImageUrl })
    },
    onSuccess: (result) => {
      setTokens(result.accessToken, result.refreshToken)
      login()
      closeTerms()
      if (nicknameStorageKey) sessionStorage.removeItem(nicknameStorageKey)
      if (photoStorageKey) sessionStorage.removeItem(photoStorageKey)
      if (signupToken) sessionStorage.removeItem(`signup:agreedTerms:${signupToken}`)
      // 회원가입까지 마친 신규 유저도 H 참여 등 복귀 경로가 있으면 그리로
      navigate(consumeReturnUrl() ?? '/home')
    },
    onError: (error) => {
      closeTerms()
      if (error instanceof ProfileImageUploadError) {
        setErrorMessage('프로필 사진 업로드에 실패했어요. 다시 시도해 주세요.')
      } else {
        setErrorMessage(error instanceof ApiError ? error.message : '닉네임 저장에 실패했어요. 다시 시도해 주세요.')
      }
      replayShake(pageRef.current)
    },
  })

  const handleConfirm = () => {
    setErrorMessage(null)
    completeSignupMutation.mutate()
  }

  return (
    <div
      ref={pageRef}
      className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white"
      style={{ '--shake-amp': PAGE_SHAKE_AMPLITUDE } as React.CSSProperties}
    >
      <Header title="프로필" />

      <div className="flex flex-col gap-2 px-[18px] pt-6">
        <h1 className="text-h3-sb text-black">마지막 단계예요, 프로필을 완성해 볼까요?</h1>
        <p className="text-caption1-r leading-normal text-gray-600">마이페이지에서 프로필을 수정할 수 있어요</p>
      </div>

      <div className="mt-[69px] flex flex-col items-center gap-3">
        <ProfileAvatar imageUrl={photoPreviewUrl} onSelect={handlePhotoSelect} />
        <p className="text-h3-sb text-black">{nickname || '닉네임'}</p>
      </div>

      <div className="mt-10 flex flex-col gap-5 px-[18px]">
        <TextField
          label="닉네임"
          value={nickname}
          maxLength={NICKNAME_MAX_LENGTH}
          placeholder="닉네임을 입력해 주세요"
          onChange={(e) => handleNicknameChange(e.target.value)}
          onOverflow={() => replayShake(pageRef.current)}
        />
        {errorMessage && <p className="text-caption1-r text-pink-500">{errorMessage}</p>}
        <Button disabled={nickname.length === 0 || completeSignupMutation.isPending} onClick={openTerms}>
          가입
        </Button>
      </div>

      <TermsBottomSheet open={termsOpen} onClose={closeTerms} onConfirm={handleConfirm} persistKey={signupToken} />
    </div>
  )
}
