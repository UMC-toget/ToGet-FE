import togetLogoPink from '../../assets/toget-logo-pink.svg'
import heroCat from '../../assets/hero-cat-invitation.svg'
import heroStars from '../../assets/hero-stars.svg'

/**
 * E01 상단 히어로 섹션: ToGet 로고 + 검은 고양이 + 별/컨페티.
 * 핑크 글로우 배경은 카드 영역 뒤까지 이어져야 해서 InvitationPage에서 페이지 레벨로 깔아줌.
 * 좌표는 피그마 E01 프레임(402×874) 실측값 기준.
 * 402px 미만 화면에서도 중앙이 유지되도록 left-1/2 기준으로 배치 (가장자리는 좌우 대칭으로 잘림).
 */
export default function InvitationHero() {
  return (
    <section className="relative h-[454px] w-full">
      {/* ToGet 로고 (피그마: x5 y178 393×106.65 — 프레임 중앙 기준) */}
      <img
        src={togetLogoPink}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[178px] w-[393px] max-w-none -translate-x-1/2"
      />
      {/* 검은 고양이 (피그마: x100 y222 201×184 — 프레임 중앙 기준, 피그마 그룹 폭에 맞춰 201px) */}
      <img
        src={heroCat}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[222px] w-[201px] -translate-x-1/2"
      />
      {/* 별/컨페티 (피그마 실측: 상단 별 y118, 가로 중심이 프레임 중앙보다 28px 왼쪽) */}
      <img
        src={heroStars}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[118px] ml-[-28px] w-[346px] max-w-none -translate-x-1/2"
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
