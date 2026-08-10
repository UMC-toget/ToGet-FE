import { useEffect, useState } from 'react';
import { fetchCharacters, fetchInvitationBackgrounds, type BackgroundMeta, type CharacterMeta } from '../../api/metaApi';
import char1 from '../../assets/invite-character1.svg';
import char2 from '../../assets/invite-character2.svg';
import char3 from '../../assets/invite-character3.svg';
import char4 from '../../assets/invite-character4.svg';
import char5 from '../../assets/invite-character5.svg';
import char6 from '../../assets/invite-character6.svg';

interface MascotProps {
  character?: number;
  color?: string;
  size?: number;
}

const ACCESSORIES: Record<number, string> = {
  1: '',
  2: '🎀',
  3: '👑',
  4: '💗',
  5: '⭐',
  6: '🎁',
};

let backgroundCache: BackgroundMeta[] | null = null;
let characterCache: CharacterMeta[] | null = null;

export function useInvitationMeta() {
  const [backgrounds, setBackgrounds] = useState<BackgroundMeta[]>(backgroundCache ?? []);
  const [characters, setCharacters] = useState<CharacterMeta[]>(characterCache ?? []);
  const [isLoading, setIsLoading] = useState(true);
  const [backgroundError, setBackgroundError] = useState(false);
  const [characterError, setCharacterError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.allSettled([fetchInvitationBackgrounds(), fetchCharacters()])
      .then(([backgroundResult, characterResult]) => {
        if (!active) return;
        if (backgroundResult.status === 'fulfilled') {
          backgroundCache = backgroundResult.value;
          setBackgrounds(backgroundResult.value);
        }
        if (characterResult.status === 'fulfilled') {
          characterCache = characterResult.value;
          setCharacters(characterResult.value);
        }
        setBackgroundError(backgroundResult.status === 'rejected');
        setCharacterError(characterResult.status === 'rejected');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  return { backgrounds, characters, isLoading, backgroundError, characterError };
}

// 백엔드 characters API가 내려주는 SVG를 우선 사용합니다.
// imageUrl이 비어 있는 기존 데이터만 로컬 SVG로 보완합니다.
const LOCAL_CHARACTER_IMAGES: Record<number, string> = { 1: char1, 2: char2, 3: char3, 4: char4, 5: char5, 6: char6 };

export function getCharacterImageSrc(character?: Pick<CharacterMeta, 'id' | 'imageUrl'>): string | undefined {
  if (!character) return undefined;
  return character.imageUrl || LOCAL_CHARACTER_IMAGES[character.id];
}

export function getInvitationAccent(hexCode?: string) {
  if (!hexCode || !/^#[0-9a-f]{6}$/i.test(hexCode)) return '#DB2777';
  if (hexCode.toUpperCase() === '#FFFFFF') return '#9CA3AF';
  const value = Number.parseInt(hexCode.slice(1), 16);
  const r = (value >> 16) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }
  return `hsl(${hue} 78% 48%)`;
}

export default function Mascot({ character = 1, color = '#F5DCE6', size = 120 }: MascotProps) {
  const accessory = ACCESSORIES[character] ?? '';
  return (
    <div
      className="relative flex items-center justify-center rounded-full shrink-0"
      style={{ width: size, height: size, background: color }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 100 100" fill="none">
        <path d="M15 30 L30 8 L36 36 Z" fill="#1f2937" />
        <path d="M85 30 L70 8 L64 36 Z" fill="#1f2937" />
        <circle cx="50" cy="56" r="36" fill="#1f2937" />
        <circle cx="37" cy="52" r="13" fill="white" />
        <circle cx="63" cy="52" r="13" fill="white" />
        <circle cx="37" cy="54" r="6.5" fill="#1f2937" />
        <circle cx="63" cy="54" r="6.5" fill="#1f2937" />
        <path d="M46 70 L54 70 L50 76 Z" fill="#ec4899" />
      </svg>
      {accessory && (
        <span className="absolute -top-1 -right-1 text-xl leading-none">{accessory}</span>
      )}
    </div>
  );
}
