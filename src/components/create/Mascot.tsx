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
import { useEffect, useState } from 'react';
import { fetchCharacters, fetchInvitationBackgrounds, type BackgroundMeta, type CharacterMeta } from '../../api/metaApi';
