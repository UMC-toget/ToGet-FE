import togetLogoPink from '../../assets/toget-logo-pink.svg'
import togetLogoWhite from '../../assets/toget-logo-white.svg'
import heroCat from '../../assets/hero-cat-invitation.svg'
import heroStars from '../../assets/hero-stars.svg'
import heroStarWhite from '../../assets/hero-star-white.svg'
import { getCharacterLayout } from './characterAssets'

interface Props {
  /** BE characters API에서 받은 캐릭터 이미지 URL. 없으면 기본 고양이 사용 */
  characterImageUrl?: string
  /** 캐릭터 id — 캐릭터별 크기·위치 보정에 사용(예: 화난 캐릭터 2는 더 크게+아래로) */
  characterId?: number | null
  /** 초대장 배경 테마 색. 로고를 이 색으로 틴트한다(피그마: 색 100%→30% 그라데이션) */
  logoColor?: string
  /** 화이트 배경 테마(id8): 틴트 대신 흰 fill + 회색 외곽선 전용 로고 사용 */
  whiteLogo?: boolean
}

/**
 * E01 상단 히어로 섹션: ToGet 로고 + 캐릭터 + 별/컨페티.
 * 핑크 글로우 배경은 카드 영역 뒤까지 이어져야 해서 InvitationPage에서 페이지 레벨로 깔아줌.
 * 좌표는 피그마 E01 프레임(402×874) 실측값 기준.
 * 402px 미만 화면에서도 중앙이 유지되도록 left-1/2 기준으로 배치 (가장자리는 좌우 대칭으로 잘림).
 */
export default function InvitationHero({
  characterImageUrl,
  characterId,
  logoColor = '#FE71A5',
  whiteLogo = false,
}: Props) {
  const characterLayout = getCharacterLayout(characterId)
  return (
    <section className="relative h-[454px] w-full">
      {/* ToGet 로고 (피그마: x5 y178 393×106.65 — 프레임 중앙 기준)
          화이트 테마는 흰 fill + 회색 외곽선 전용 SVG를 그대로 렌더.
          그 외 색은 단색 그라데이션 SVG를 mask로 써서 배경 테마 색으로 틴트한다.
          mask 알파가 원본의 100%→30% 페이드를 그대로 담고 있어 색만 바꿔도 그라데이션이 유지됨. */}
      {whiteLogo ? (
        <img
          src={togetLogoWhite}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[178px] w-[393px] max-w-none -translate-x-1/2"
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[178px] h-[107px] w-[393px] max-w-none -translate-x-1/2"
          style={{
            backgroundColor: logoColor,
            WebkitMaskImage: `url(${togetLogoPink})`,
            maskImage: `url(${togetLogoPink})`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      )}
      {/* 별/컨페티는 캐릭터보다 먼저 그려서 얼굴을 가리지 않고 뒤로 깔린다. */}
      {/* 별/컨페티 (피그마 실측: 상단 별 y118, 가로 중심이 프레임 중앙보다 28px 왼쪽) */}
      <img
        src={heroStars}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[118px] ml-[-28px] w-[346px] max-w-none -translate-x-1/2"
      />
      {/* heroStars 에셋에 빠져 있는 하단 흰 별 (피그마 노드 1714:68167 x260 y418, 박스 중심 기준 배치) */}
      <img
        src={heroStarWhite}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[425px] ml-[80px] w-[28px] max-w-none -translate-x-1/2"
      />
      {/* 캐릭터 (피그마 기본: x100 y222 201×184 — 프레임 중앙 기준)
          캐릭터 SVG마다 가로 비율이 달라서 높이 기준으로 고정해 세로 위치를 맞춤.
          위치·높이는 캐릭터별 보정값(getCharacterLayout) 사용 */}
      <img
        src={characterImageUrl ?? heroCat}
        alt=""
        aria-hidden
        onError={(e) => {
          // BE가 준 S3 캐릭터 URL이 로드 실패하면 기본 고양이로 대체 (onError 해제해 무한 루프 방지)
          e.currentTarget.onerror = null
          e.currentTarget.src = heroCat
        }}
        className="pointer-events-none absolute left-1/2 w-auto -translate-x-1/2"
        style={{ top: characterLayout.top, height: characterLayout.height }}
      />

      {/* 제목 (피그마: y100, H2_SB 20px, 중앙 정렬 — 줄바꿈은 br로만 제어) */}
      <p className="absolute left-1/2 top-[100px] -translate-x-1/2 whitespace-nowrap text-center text-h2-sb text-black">
        따뜻한 축하를
        <br />
        함께 전해주시겠어요?
      </p>
    </section>
  )
}
