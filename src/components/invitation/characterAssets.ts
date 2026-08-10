/** 초대장 히어로에서 캐릭터 이미지의 세로 위치·높이(px, 402 프레임 기준) */
export interface CharacterLayout {
  top: number
  height: number
}

// 기본값 = 기본 고양이(id1). 카드 위에 살짝 떠 있는 포즈라 몸통을 카드에 붙이지 않는다.
const DEFAULT_CHARACTER_LAYOUT: CharacterLayout = { top: 222, height: 184 }

/**
 * 캐릭터별 배치 override.
 * 고양이(id1)를 뺀 나머지는 몸통이 초대장 문구 박스 윗면(y454)에 얹히도록 아래로 내려 앉힌다
 * (문구 박스가 캐릭터 위에 그려져서, 박스에 걸친 다리 아래쪽은 자연스럽게 가려짐).
 * 크기는 고양이와 같은 배율로 맞추고, 화난 캐릭터(2)만 웅크린 포즈라 더 크게 잡아 균형을 맞춘다.
 */
const CHARACTER_LAYOUTS: Record<number, CharacterLayout> = {
  2: { top: 220, height: 240 },
  3: { top: 247, height: 213 },
  4: { top: 247, height: 213 },
  5: { top: 247, height: 213 },
  6: { top: 247, height: 213 },
}

export const getCharacterLayout = (characterId?: number | null): CharacterLayout =>
  (characterId != null && CHARACTER_LAYOUTS[characterId]) || DEFAULT_CHARACTER_LAYOUT
