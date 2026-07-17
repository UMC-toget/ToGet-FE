interface MascotProps {
  character?: number; // 1 ~ CHARACTER_COUNT
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

export const INVITE_COLORS = [
  '#FBCFE8', // pink (기본)
  '#FCA5A5', // red/coral
  '#FDE68A', // yellow
  '#BBF7D0', // green
  '#BFDBFE', // blue
  '#DDD6FE', // purple
  '#E9D5FF', // light purple
  '#FFFFFF', // white
];

export const CHARACTER_COUNT = Object.keys(ACCESSORIES).length;

export default function Mascot({ character = 1, color = '#FBCFE8', size = 120 }: MascotProps) {
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