import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getContributionBackgrounds, getCharacters } from '../../api/decorations'
import {
  buildLetterColor,
  COLOR_ID_BY_BACKGROUND_ID,
  type LetterColor,
} from '../../components/common/letterPalette'

/** 편지지 배경 색상 목록 (GET /api/v1/contribution-backgrounds 연동) */
export function useContributionBackgrounds() {
  const query = useQuery({
    queryKey: ['contributionBackgrounds'],
    queryFn: getContributionBackgrounds,
  })
  return query.data ?? []
}

/**
 * 편지지 색상 목록 (BE hexCode에서 파생). E·H·J 편지지/컬러칩이 공유하는 공용 소스.
 * BE 로딩 전/실패 시 빈 배열이므로, 소비처는 `colors.length`로 로딩을 구분한다.
 */
export function useLetterColors(): LetterColor[] {
  const backgrounds = useContributionBackgrounds()
  return useMemo(() => backgrounds.map(buildLetterColor), [backgrounds])
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

/** 색 식별자(colorId) → 서버 backgroundId. 순서 별칭 맵의 역방향 */
export function colorIdToBackgroundId(colorId: string): number | undefined {
  const entry = Object.entries(COLOR_ID_BY_BACKGROUND_ID).find(([, id]) => id === colorId)
  return entry ? Number(entry[0]) : undefined
}

/** 서버 backgroundId → 색 식별자(colorId). 조회 화면에서 편지지 색을 복원할 때 사용 */
export function backgroundIdToColorId(backgroundId: number | null): string {
  if (backgroundId == null) return WHITE_COLOR_ID
  return COLOR_ID_BY_BACKGROUND_ID[backgroundId] ?? WHITE_COLOR_ID
}
