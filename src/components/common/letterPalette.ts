import { blendColor, unblendColor } from '../../utils/colorOpacity'

/**
 * 편지지 색상 (피그마 "편지지" 공통 컴포넌트, 접힘/입력전/열림 3상태 공용).
 *
 * 색값은 하드코딩하지 않고, BE(`GET /contribution-backgrounds`)가 주는 hexCode에서 런타임 파생한다.
 * BE hexCode = "원색을 흰색에 50%로 얹은 pastel" 값이라, 원색을 역산(unblendColor)한 뒤
 * 원색에 불투명도만 다르게 얹어(흰 배경) 각 용도 색을 만든다. (검정 혼합 X → 회색빛 없음)
 *
 * - 원색      = unblendColor(BE, 0.5)
 * - 선택 칩   = 원색 @ 50%  (= BE hexCode와 동일)
 * - 미선택 칩 = 원색 @ 25%
 * - 편지지    = 원색 @ 15%
 * - 테두리    = 원색 (불투명)
 *
 * 실제 색 목록은 `useLetterColors()` 훅(useDecorations.ts)이 BE에서 만들어 준다.
 * E(참여)·H(함께 선물 편지)·J(후기·소식·마음전하기) 화면이 공유한다.
 */
export interface LetterColor {
  /** 색 식별자(backgroundId 순서 별칭). draft/조회 저장 호환용 — 색값 아님 */
  id: string
  name: string
  /** BE 배경 id (1~8). 제출 시 이 값을 보낸다 */
  backgroundId: number
  /** 선택된 컬러칩 색 = 원색 @ 50% */
  chipSelected: string
  /** 미선택 컬러칩 색 = 원색 @ 25% */
  chipUnselected: string
  /** 편지지 배경색 = 원색 @ 15% */
  background: string
  /** 편지지 테두리 색 = 원색 */
  border: string
  /** 편지지 밑줄 색 = 원색 @ 50% */
  lineColor: string
  /** '내용을 입력해주세요' placeholder 색 = 원색 */
  placeholder: string
  /** 스와치 선택 시 2px 테두리 색 = 원색 */
  swatchSelectedBorder: string
}

/** backgroundId(1~8) → 색 식별자 별칭. 순서 식별용이라 색값과 무관 */
export const COLOR_ID_BY_BACKGROUND_ID: Record<number, string> = {
  1: 'pink',
  2: 'red',
  3: 'yellow',
  4: 'green',
  5: 'skyBlue',
  6: 'darkPurple',
  7: 'lightPurple',
  8: 'white',
}

/** BE 색 항목(id/name/hexCode) → 파생된 LetterColor */
export function buildLetterColor(background: { id: number; name: string; hexCode: string }): LetterColor {
  const primary = unblendColor(background.hexCode, 0.5) // pastel → 원색 복원
  // 화이트는 원색이 #FFFFFF라 테두리/밑줄/placeholder가 흰 배경에 안 보임 → 회색으로 대체
  const isWhite = background.hexCode.toUpperCase() === '#FFFFFF'
  return {
    id: COLOR_ID_BY_BACKGROUND_ID[background.id] ?? String(background.id),
    name: background.name,
    backgroundId: background.id,
    chipSelected: blendColor(primary, 0.5), // = hexCode
    chipUnselected: blendColor(primary, 0.25),
    background: blendColor(primary, 0.15),
    border: isWhite ? 'var(--color-gray-400)' : primary,
    lineColor: isWhite ? 'var(--color-gray-300)' : blendColor(primary, 0.5),
    placeholder: isWhite ? 'var(--color-gray-400)' : primary,
    swatchSelectedBorder: isWhite ? 'var(--color-gray-400)' : primary,
  }
}
