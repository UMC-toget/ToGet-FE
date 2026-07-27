import { useQuery } from '@tanstack/react-query'
import { getContributionBackgrounds, getCharacters } from '../../api/decorations'

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
