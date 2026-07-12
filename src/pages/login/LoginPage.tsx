import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CloseIcon from '../../components/icons/CloseIcon'
import TermsBottomSheet from './TermsBottomSheet'
import togetLogo from '../../assets/toget-logo.svg'
import loginCharacter from '../../assets/login-character.svg'
import heart from '../../assets/heart.svg'
import kakaoIcon from '../../assets/icon-kakao.png'
import googleIcon from '../../assets/icon-google.png'

/** 카카오/구글 소셜 로그인 페이지 */
export default function LoginPage() {
  const [termsOpen, setTermsOpen] = useState(false)
  const navigate = useNavigate()

  const handleConfirm = () => {
    setTermsOpen(false)
    // TODO: 닉네임 등록 페이지 구현 후 navigate('/signup/nickname')으로 연결
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white px-[18px]">
      <header className="flex h-[50px] shrink-0 items-center">
        <button type="button" aria-label="닫기" onClick={() => navigate(-1)} className="text-black">
          <CloseIcon />
        </button>
      </header>

      <img src={togetLogo} alt="To Get" className="mx-auto mt-[67px] h-14 w-[207px]" />

      <div className="mt-8 flex flex-col gap-1.5 text-center">
        <h1 className="text-h3-sb text-black">투겟에서 선물을 함께 준비해요</h1>
        <p className="text-caption1-r leading-normal text-gray-600">
          카카오 또는 구글 계정으로
          <br />
          선물 페이지를 만들고 참여할 수 있어요
        </p>
      </div>

      <div className="relative mx-auto mt-[87px] w-[207px]">
        <img src={loginCharacter} alt="투겟 캐릭터" className="h-[189px] w-full" />
        <img src={heart} alt="" className="absolute -left-11 -top-11 size-12 -rotate-[23deg]" />
        <img src={heart} alt="" className="absolute -left-9 -top-16 size-8 rotate-[6deg]" />
        <img src={heart} alt="" className="absolute -right-8 top-[100px] size-9 rotate-[34deg]" />
      </div>

      <div className="mt-[42px] flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setTermsOpen(true)}
          className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-[#fee500]"
        >
          <img src={kakaoIcon} alt="" className="size-6 object-contain p-1" />
          <span className="text-sm font-semibold text-[#3c1e1e]">카카오로 시작하기</span>
        </button>
        <button
          type="button"
          onClick={() => setTermsOpen(true)}
          className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-gray-600 bg-white"
        >
          <img src={googleIcon} alt="" className="size-6 object-contain p-1" />
          <span className="text-sm font-semibold text-black">구글로 시작하기</span>
        </button>
      </div>

      <p className="mt-6 text-center text-caption2-r leading-normal text-gray-700">
        카카오 또는 구글 계정으로 시작하면
        <br />
        서비스 이용약관과 개인정보처리방침에 동의하게 됩니다.
      </p>

      <TermsBottomSheet open={termsOpen} onClose={() => setTermsOpen(false)} onConfirm={handleConfirm} />
    </div>
  )
}
