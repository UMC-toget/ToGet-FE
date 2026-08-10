import char1 from '../../assets/characters/1.svg'
import char2 from '../../assets/characters/2.svg'
import char3 from '../../assets/characters/3.svg'
import char4 from '../../assets/characters/4.svg'
import char5 from '../../assets/characters/5.svg'
import char6 from '../../assets/characters/6.svg'

/**
 * 캐릭터 id → 로컬 SVG 매핑.
 * BE가 characters API로 내려주는 S3 PNG는 저해상도(137×125)라 확대 시 뭉개짐 →
 * 벡터 SVG로 대체해 어떤 크기에서도 선명하게 렌더링한다.
 * 매핑에 없는 id는 BE imageUrl(PNG)로 폴백.
 */
export const CHARACTER_SVGS: Record<number, string> = {
  1: char1,
  2: char2,
  3: char3,
  4: char4,
  5: char5,
  6: char6,
}

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
