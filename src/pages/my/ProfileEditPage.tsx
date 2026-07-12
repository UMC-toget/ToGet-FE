import { useState } from 'react'
import Header from '../../components/common/Header'
import TextField from '../../components/common/TextField'
import Button from '../../components/common/Button'
import MenuRow from '../../components/common/MenuRow'
import BottomNav from '../../components/common/BottomNav'
import ProfileAvatar from '../signup/ProfileAvatar'
import { MOCK_USER } from './mockUser'

const NICKNAME_MAX_LENGTH = 6

/** 내 정보 페이지: 닉네임/프로필 사진 변경, 로그아웃/계정 삭제 */
export default function ProfileEditPage() {
  const [name, setName] = useState(MOCK_USER.name)
  const [nickname, setNickname] = useState('')

  const handleSave = () => {
    // TODO: 회원 정보 수정 API 연동
    setName(nickname)
    setNickname('')
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
        {/* TODO: 로그아웃/계정 삭제 API 연동 */}
        <MenuRow label="로그아웃" chevron={false} />
        <MenuRow label="계정 삭제" chevron={false} />
      </div>

      <BottomNav active="my" />
    </div>
  )
}
