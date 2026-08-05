import { useQuery } from '@tanstack/react-query'
import { getContributionBackgrounds, getCharacters } from '../../api/decorations'
import type { ContributionBackground } from '../../api/decorations'
import { LETTER_COLORS } from '../../components/common/letterPalette'

/** 편지지 배경 색상 목록 (GET /api/v1/contribution-backgrounds 연동) */
export function useContributionBackgrounds() {
  const query = useQuery({
    queryKey: ['contributionBackgrounds'],
    queryFn: getContributionBackgrounds,
  })
  return query.data ?? []
}

/** 편지지 캐릭터 목록 (GET /api/v1/characters 연동) */
export function useCharacters() {
  const query = useQuery({
    queryKey: ['characters'],
    queryFn: getCharacters,
  })
  return query.data ?? []
}

const WHITE_COLOR_ID = 'white'

/** LETTER_COLORS id → 서버 매칭용 불투명 hex. 로컬 팔레트는 반투명(rgba) 값을 쓰므로 서버 hexCode와 직접 비교할 수 없어 별도로 둔다. */
const LETTER_COLOR_HEX: Record<string, string> = {
  pink: '#FE71A5',
  red: '#FF6767',
  yellow: '#FFD000',
  green: '#93D700',
  skyBlue: '#27ACFF',
  darkPurple: '#3724CD',
  lightPurple: '#5A1497',
  white: '#FFFFFF',
}

function normalizeHex(hex: string) {
  return hex.trim().toUpperCase().replace(/^#?/, '#')
}

/**
 * 로컬 LETTER_COLORS id → 서버 backgroundId 변환.
 * 서버 목록의 hexCode(우선) 또는 name으로 매칭한다. 순서 가정이 없어 관리자가 색상을
 * 추가/삭제/순서변경해도 어긋나지 않는다.
 */
export function colorIdToBackgroundId(colorId: string, backgrounds: ContributionBackground[]): number | undefined {
  const letterColor = LETTER_COLORS.find((c) => c.id === colorId)
  if (!letterColor) return undefined

  const hex = LETTER_COLOR_HEX[colorId]
  const byHex = hex ? backgrounds.find((b) => normalizeHex(b.hexCode) === normalizeHex(hex)) : undefined
  if (byHex) return byHex.id

  return backgrounds.find((b) => b.name === letterColor.name)?.id
}

/** 서버 backgroundId → 로컬 LETTER_COLORS id 역변환 (조회 화면에서 편지지 색을 복원할 때 사용) */
export function backgroundIdToColorId(backgroundId: number | null, backgrounds: ContributionBackground[]): string {
  if (backgroundId == null) return WHITE_COLOR_ID
  const background = backgrounds.find((b) => b.id === backgroundId)
  if (!background) return WHITE_COLOR_ID

  const byHex = LETTER_COLORS.find((c) => normalizeHex(LETTER_COLOR_HEX[c.id] ?? '') === normalizeHex(background.hexCode))
  if (byHex) return byHex.id

  return LETTER_COLORS.find((c) => c.name === background.name)?.id ?? WHITE_COLOR_ID
}
