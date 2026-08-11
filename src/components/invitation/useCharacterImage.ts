import { useEffect, useState } from 'react'
import { fetchCharacters, type CharacterMeta } from '../../api/metaApi'

/**
 * 캐릭터 목록(BE `/api/v1/characters`)을 한 번만 받아두고 characterId로 이미지 URL을 매핑한다.
 * 저장 전 미리보기처럼 characterId가 실시간으로 바뀌는 경우, 목록은 재조회하지 않고 로컬 매핑만 갱신한다.
 * `enabled=false`면 목록을 받지 않는다(펀딩 조회 모드에서 불필요한 호출 방지).
 */
export function useCharacterImage(
  characterId?: number | null,
  enabled = true,
): string | undefined {
  const [characters, setCharacters] = useState<CharacterMeta[]>([])

  useEffect(() => {
    if (!enabled) return
    fetchCharacters()
      .then(setCharacters)
      .catch(() => {})
  }, [enabled])

  if (characterId == null) return undefined
  return characters.find((c) => c.id === characterId)?.imageUrl
}
