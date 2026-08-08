import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Header from '../../components/common/Header'
import TextField from '../../components/common/TextField'
import Button from '../../components/common/Button'
import MenuRow from '../../components/common/MenuRow'
import BottomNav from '../../components/common/BottomNav'
import ConfirmModal from '../../components/common/ConfirmModal'
import Toast from '../../components/common/Toast'
import ProfileAvatar from '../signup/ProfileAvatar'
import { useAuth } from '../../hooks/useAuth'
import { useMyProfile } from '../../hooks/useMyProfile'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { updateMyProfile, withdrawMe, deleteMyProfileImage } from '../../api/users'
import { uploadImage } from '../../utils/uploadImage'
import { logoutRequest } from '../../api/auth'
import { clearTokens, clearLastLoginProvider } from '../../lib/tokenStorage'
import { replayShake } from '../../utils/shake'

const NICKNAME_MAX_LENGTH = 6
const PROFILE_IMAGE_PREFIX = 'profiles'
// 화면 전체 흔들림은 입력창 자체보다 훨씬 은은하게 느껴지도록 진폭을 크게 줄입니다.
const PAGE_SHAKE_AMPLITUDE = '0.4px'
const PHOTO_TOAST_DURATION_MS = 2000

/** uploadImage() 실패를 updateMyProfile() 실패와 구분해 정확한 에러 메시지를 보여주기 위한 태그용 에러 */
class ProfileImageUploadError extends Error {}

/** 내 정보 페이지: 닉네임/프로필 사진 변경, 로그아웃/계정 삭제 */
export default function ProfileEditPage() {
  const { data: profile } = useMyProfile()
  const [nickname, setNickname] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletePhotoModalOpen, setDeletePhotoModalOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  useRequireAuth()

  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null)
  const [photoToastOpen, setPhotoToastOpen] = useState(false)
  // 사진 저장 직전의 profileImageUrl — "실행취소" 시 되돌릴 대상
  const previousImageUrlRef = useRef<string | null>(null)
  const photoToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showPhotoToast = () => {
    if (photoToastTimerRef.current) clearTimeout(photoToastTimerRef.current)
    setPhotoToastOpen(true)
    photoToastTimerRef.current = setTimeout(() => setPhotoToastOpen(false), PHOTO_TOAST_DURATION_MS)
  }

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const photoChanged = photoFile !== null
      let profileImageUrl: string | undefined
      if (photoFile) {
        try {
          profileImageUrl = await uploadImage(PROFILE_IMAGE_PREFIX, photoFile)
        } catch {
          throw new ProfileImageUploadError()
        }
      }
      await updateMyProfile({
        nickname: nickname.length > 0 ? nickname : undefined,
        profileImageUrl,
      })
      return { photoChanged }
    },
    onSuccess: ({ photoChanged }) => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] })
      setNickname('')
      setPhotoFile(null)
      setSaveErrorMessage(null)
      if (photoChanged) showPhotoToast()
    },
    onError: (error) => {
      setSaveErrorMessage(
        error instanceof ProfileImageUploadError
          ? '프로필 사진 업로드에 실패했어요. 다시 시도해 주세요.'
          : '프로필 저장에 실패했어요. 다시 시도해 주세요.',
      )
      replayShake(pageRef.current)
    },
  })

  const undoPhotoMutation = useMutation({
    mutationFn: async () => {
      const previousImageUrl = previousImageUrlRef.current
      if (previousImageUrl) {
        await updateMyProfile({ profileImageUrl: previousImageUrl })
      } else {
        await deleteMyProfileImage()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] })
      if (photoToastTimerRef.current) clearTimeout(photoToastTimerRef.current)
      setPhotoToastOpen(false)
    },
  })

  const deletePhotoMutation = useMutation({
    mutationFn: deleteMyProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] })
      setDeletePhotoModalOpen(false)
    },
    onError: () => setDeletePhotoModalOpen(false),
  })

  // 서버 로그아웃 요청이 실패해도(네트워크 오류 등) 클라이언트는 항상 로그아웃 처리하므로,
  // API 응답을 기다리지 않고 fire-and-forget으로 호출합니다.
  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
  })

  const withdrawMutation = useMutation({
    mutationFn: withdrawMe,
    onSuccess: () => {
      clearTokens()
      clearLastLoginProvider()
      logout()
      navigate('/my', { state: { toast: '계정 삭제가 완료 되었습니다' } })
    },
    onError: () => setDeleteModalOpen(false),
  })

  const hasChanges = nickname.length > 0 || photoFile !== null

  const handleSave = () => {
    previousImageUrlRef.current = profile?.profileImageUrl ?? null
    updateProfileMutation.mutate()
  }

  const handleLogout = () => {
    navigate('/my', { state: { toast: '로그아웃이 완료 되었습니다' } })
    clearTokens()
    logout()
    logoutMutation.mutate()
  }

  const handleDeleteAccount = () => {
    withdrawMutation.mutate()
  }

  return (
    <div
      ref={pageRef}
      className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-32"
      style={{ '--shake-amp': PAGE_SHAKE_AMPLITUDE } as React.CSSProperties}
    >
      <Header title="내 정보" />

      <div className="mt-6 flex flex-col items-center gap-3">
        <ProfileAvatar imageUrl={profile?.profileImageUrl} onSelect={setPhotoFile} />
        <p className="text-h3-sb text-black">{profile?.nickname ?? '회원'}</p>
        {profile?.profileImageUrl && (
          <button
            type="button"
            onClick={() => setDeletePhotoModalOpen(true)}
            className="text-caption1-r text-gray-500"
          >
            사진 삭제
          </button>
        )}
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
        <Button disabled={!hasChanges || updateProfileMutation.isPending} onClick={handleSave}>
          저장
        </Button>
        {saveErrorMessage && <p className="text-caption1-r text-pink-500">{saveErrorMessage}</p>}
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
        open={deletePhotoModalOpen}
        title="프로필 사진을 삭제할까요?"
        confirmText="삭제하기"
        onCancel={() => setDeletePhotoModalOpen(false)}
        onConfirm={() => deletePhotoMutation.mutate()}
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

      <Toast
        open={photoToastOpen}
        message="프로필 사진 수정이 완료 되었습니다"
        actionLabel="실행취소"
        onAction={() => undoPhotoMutation.mutate()}
      />
    </div>
  )
}
