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
