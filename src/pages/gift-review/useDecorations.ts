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

/**
 * 로컬 LETTER_COLORS id → 서버 backgroundId 변환.
 * ⚠️ 서버 목록이 LETTER_COLORS와 동일한 순서(피그마 "편지지" 팔레트 순)로 내려온다고 가정한 임시 매핑.
 * 이름/코드 기반 매핑으로 교체하려면 서버 목록의 name·hexCode 확정 후 변경 필요.
 */
export function colorIdToBackgroundId(colorId: string, backgrounds: ContributionBackground[]): number | undefined {
  const index = LETTER_COLORS.findIndex((c) => c.id === colorId)
  return backgrounds[index]?.id
}

/** 서버 backgroundId → 로컬 LETTER_COLORS id 역변환 (조회 화면에서 편지지 색을 복원할 때 사용) */
export function backgroundIdToColorId(backgroundId: number | null, backgrounds: ContributionBackground[]): string {
  const whiteId = LETTER_COLORS[7].id
  if (backgroundId == null) return whiteId
  const index = backgrounds.findIndex((b) => b.id === backgroundId)
  return LETTER_COLORS[index]?.id ?? whiteId
}
