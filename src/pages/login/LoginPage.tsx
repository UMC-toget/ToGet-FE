import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import CloseIcon from '../../components/icons/CloseIcon'
import Toast from '../../components/common/Toast'
import BadgeTailIcon from '../../components/icons/BadgeTailIcon'
import togetLogo from '../../assets/toget-logo.svg'
import loginCharacter from '../../assets/login-character.svg'
import heartBig from '../../assets/heart-big.svg'
import heartSmall from '../../assets/heart-small.svg'
import heartRight from '../../assets/heart-right.svg'
import kakaoIcon from '../../assets/icon-kakao.png'
import googleIcon from '../../assets/icon-google.png'
import { useAuth } from '../../hooks/useAuth'
import { postSocialLogin } from '../../api/auth'
import type { SocialLoginProvider } from '../../api/auth'
import { setTokens, getLastLoginProvider, setLastLoginProvider } from '../../lib/tokenStorage'
import { kakaoAuthorize, exchangeKakaoCode } from '../../lib/kakao'

const LOGIN_FAIL_MESSAGE = '로그인에 실패했어요. 다시 시도해 주세요.'
/** 카카오 authorize()가 로그인 완료 후 돌아오는 주소. 카카오 디벨로퍼스에 등록된 Redirect URI와 정확히 일치해야 함 */
const KAKAO_REDIRECT_URI = `${window.location.origin}/login`

/** 카카오/구글 버튼 위에 붙는 "최근에 로그인한 계정" 말풍선 배지 */
function LastLoginBadge() {
  return (
    <div className="absolute -top-6 left-[13px] z-20 flex items-center gap-2.5 whitespace-nowrap rounded-full bg-[#fff1f6] px-2.5 py-1.5">
      <span className="text-[12px] font-semibold text-pink-500">최근에 로그인한 계정</span>
      <BadgeTailIcon className="absolute left-[54.5px] top-[21px] size-4 text-[#fff1f6]" />
    </div>
  )
}

/** 카카오/구글 소셜 로그인 페이지 */
export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastProvider] = useState(getLastLoginProvider)
  /** 카카오 인가 code는 1회용이라, StrictMode의 effect 이중 실행으로 같은 code를 두 번 교환하지 않도록 막습니다 */
  const kakaoCodeHandledRef = useRef(false)

  const completeSocialLogin = async (provider: SocialLoginProvider, identityToken: string) => {
    setErrorMessage(null)
    try {
      const result = await postSocialLogin(provider, identityToken)
      if (!result.isProfileCompleted) {
        // 아직 회원이 아닙니다 — 이 시점엔 토큰이 없으므로 로그인 처리하지 않고, 프로필 설정
        // 화면에서 signupToken과 함께 POST /api/v1/users를 호출해야 비로소 회원이 생성됩니다.
        navigate('/signup/profile', { replace: true, state: { signupToken: result.signupToken } })
        return
      }
      setTokens(result.accessToken, result.refreshToken)
      setLastLoginProvider(provider)
      login()
      navigate('/home', { replace: true })
    } catch {
      setErrorMessage(LOGIN_FAIL_MESSAGE)
    }
  }

  // 카카오 authorize()가 로그인 완료 후 이 페이지로 돌려보내면(?code=...), 그 code를 access token으로
  // 교환해서 로그인을 마저 진행합니다.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const kakaoError = params.get('error')
    if (!code && !kakaoError) return
    if (kakaoCodeHandledRef.current) return
    kakaoCodeHandledRef.current = true

    navigate('/login', { replace: true })
    if (kakaoError) return

    exchangeKakaoCode(code!, KAKAO_REDIRECT_URI)
      .then((accessToken) => completeSocialLogin('kakao', accessToken))
      .catch((error) => {
        console.error('[카카오 로그인 실패]', error)
        setErrorMessage(LOGIN_FAIL_MESSAGE)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleKakaoLogin = () => {
    kakaoAuthorize(KAKAO_REDIRECT_URI)
  }

  // 진짜 구글 iframe 버튼을 숨기고 커스텀 버튼을 얹는 방식은, 서드파티 쿠키가 차단된 환경(FedCM)에서
  // "완전히 안 보이는 iframe" 클릭을 보안상 무시해 프로덕션에서 로그인이 먹통이 되는 문제가 있었다.
  // 팝업 방식은 우리 버튼이 직접 여는 것이라 숨겨진 iframe 자체가 없어 이 문제에서 자유롭다.
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => completeSocialLogin('google', tokenResponse.access_token),
    onError: () => setErrorMessage(LOGIN_FAIL_MESSAGE),
  })

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

      <div className="relative mx-auto -mb-[11px] mt-[117px] w-[207px]">
        <img src={loginCharacter} alt="투겟 캐릭터" className="h-[189px] w-full" />
        <img src={heartBig} alt="" className="absolute -left-[60px] -top-[43px] size-[61px] -rotate-[23deg]" />
        <img src={heartSmall} alt="" className="absolute -left-[54px] -top-[65px] size-8 rotate-[6deg]" />
        <img src={heartRight} alt="" className="absolute -right-[52px] top-[101px] size-12 rotate-[34deg]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="relative w-full">
          {lastProvider === 'kakao' && <LastLoginBadge />}
          <button
            type="button"
            onClick={handleKakaoLogin}
            className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-[#fee500]"
          >
            <img src={kakaoIcon} alt="" className="size-6 object-contain p-1" />
            <span className="text-b2-m text-[#3c1e1e]">카카오로 시작하기</span>
          </button>
        </div>
        <div className="relative w-full">
          {lastProvider === 'google' && <LastLoginBadge />}
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-gray-600 bg-white"
          >
            <img src={googleIcon} alt="" className="size-4 object-contain" />
            <span className="text-b2-m text-black">구글로 시작하기</span>
          </button>
        </div>
      </div>

      <p className="mt-5 text-center text-caption2-r leading-normal text-gray-700">
        카카오 또는 구글 계정으로 시작하면
        <br />
        서비스 이용약관과 개인정보처리방침에 동의하게 됩니다.
      </p>

      <Toast open={errorMessage !== null} message={errorMessage ?? ''} standalone />
    </div>
  )
}
