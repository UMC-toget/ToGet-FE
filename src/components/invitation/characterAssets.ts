/** 초대장 히어로에서 캐릭터 이미지의 세로 위치·높이(px, 402 프레임 기준) */
export interface CharacterLayout {
  top: number
  height: number
}

// 기본값 = 기본 고양이(id1). 카드 위에 살짝 떠 있는 포즈라 몸통을 카드에 붙이지 않는다.
const DEFAULT_CHARACTER_LAYOUT: CharacterLayout = { top: 222, height: 184 }

/**
 * 캐릭터별 배치 override — 피그마 E01 각 캐릭터 프레임의 실측 좌표(402 기준).
 * 전부 문구 박스(y454) 뒤 레이어라, 몸통 하단이 박스에 걸치면 박스가 위에 그려져 가려진다.
 * id4는 선물박스가 박스와 겹치지 않게 캐릭터를 위로 올린 시안으로 맞췄다.
 */
const CHARACTER_LAYOUTS: Record<number, CharacterLayout> = {
  2: { top: 225, height: 229 },
  3: { top: 225, height: 229 },
  4: { top: 222, height: 200 },
  5: { top: 238, height: 229 },
  6: { top: 238, height: 229 },
}

export const getCharacterLayout = (characterId?: number | null): CharacterLayout =>
  (characterId != null && CHARACTER_LAYOUTS[characterId]) || DEFAULT_CHARACTER_LAYOUT
