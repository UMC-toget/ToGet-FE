import type { CSSProperties } from 'react'

/**
 * 초대장 배경(backgroundId 1~8) → 테마 색상.
 * 피그마 스펙(node 1706-76382) 기준, 순서는 빨·주·노·초·파·남·보·검정.
 * 로고는 이 색의 100%→30% 그라데이션, 글로우는 같은 색 50%로 칠한다.
 * (BE invitation-backgrounds가 주는 hexCode는 연한 파스텔이라 로고/글로우 채도가 부족해 별도 팔레트 사용)
 */
export const INVITE_THEME_COLORS: Record<number, string> = {
  1: '#FE71A5', // 빨
  2: '#FF6767', // 주
  3: '#FFC300', // 노
  4: '#93D700', // 초
  5: '#27ACFF', // 파
  6: '#8284FF', // 남
  7: '#B783FF', // 보
  8: '#C1BCC0', // 검정(화이트 배경): 로고는 회색 외곽선 톤
}

/** backgroundId로 테마 색을 찾는다. 없으면 기본 핑크. */
export const getInviteThemeColor = (backgroundId?: number | null): string =>
  (backgroundId != null && INVITE_THEME_COLORS[backgroundId]) || '#FE71A5'

/**
 * 초대장 글로우 배경 style.
 * 중심에 테마 색 50% → 가장자리 투명 원형 그라데이션. 절대 위치(top)와 크기 포함.
 * 컬러 테마는 피그마 스펙(286, blur100)으로 은은한 색 wash.
 * 화이트 테마(id8)는 어두운 #1E1D1E라 blur100이면 배경이 더럽게 차서, blur를 줄이고 원을 키워
 * 또렷한 원형 글로우로 낸다. (그라데이션이 falloff를 담당, blur는 경계만 살짝 부드럽게)
 */
export const getInviteGlowStyle = (themeColor: string, whiteTheme: boolean): CSSProperties =>
  whiteTheme
    ? {
        top: 200,
        width: 440,
        height: 440,
        background: 'radial-gradient(circle, rgba(30,29,30,0.30) 0%, transparent 60%)',
        filter: 'blur(14px)',
      }
    : {
        top: 292,
        width: 286,
        height: 286,
        background: `radial-gradient(circle, ${themeColor}80 0%, transparent 100%)`,
        filter: 'blur(100px)',
      }
