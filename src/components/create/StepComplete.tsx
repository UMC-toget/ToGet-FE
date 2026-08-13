import { useState } from 'react';
import { Check, Heart, X } from 'lucide-react';
import { useFundingCreateStore } from '../../store/fundingCreateStore';
import { getCharacterImageSrc, getInvitationAccent, useInvitationMeta } from './Mascot';
import { trackEvent } from '../../lib/analytics';

interface Props {
  fundingId: number;
  onViewFunding: () => void;
  onGoHome: () => void;
}

export default function StepComplete({ fundingId, onViewFunding, onGoHome }: Props) {
  const { inviteCharacter, inviteBackgroundId, inviteColor } = useFundingCreateStore();
  const [copied, setCopied] = useState(false);
  const { backgrounds, characters } = useInvitationMeta();
  const characterImageUrl = getCharacterImageSrc(characters.find((item) => item.id === inviteCharacter));
  const selectedColor = backgrounds.find((item) => item.id === inviteBackgroundId)?.hexCode ?? inviteColor;
  const glowColor = selectedColor === '#FFFFFF' ? '#D1D5DB' : selectedColor;
  const accentColor = getInvitationAccent(selectedColor);
  const decorationColor = selectedColor === '#FFFFFF' ? accentColor : selectedColor;

  const sharePath = `/funding/${fundingId}/invitation`;
  const shareLink = `toget.kr${sharePath}`;
  const shareUrl = `${window.location.origin}${sharePath}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackEvent('invitation_share', { method: 'copy', funding_type: 'my' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 권한이 없는 등의 경우 - 조용히 무시 (필요시 토스트 처리)
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center relative">
      {/* 페이지 전체 배경 그라데이션 - 캐릭터를 중심으로 진하게 시작해서 아래로 갈수록 옅어짐 */}
      <div
        className="absolute inset-x-0 top-0 h-96 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 62%, color-mix(in srgb, ${glowColor} 48%, transparent) 0%, color-mix(in srgb, ${glowColor} 36%, transparent) 38%, transparent 68%)`,
        }}
      />
      <button
        onClick={onGoHome}
        aria-label="닫기"
        className="absolute top-0 right-0 p-2 text-gray-600 hover:text-gray-900 transition-colors z-10"
      >
        <X size={20} />
      </button>

      <div className="flex flex-col items-center w-full pt-24 gap-5">
        {/* 완료 아이콘 - 초대장에서 고른 캐릭터/색상을 그대로 사용해 일관성 유지 */}
        <div className="relative flex items-center justify-center w-64 h-72 shrink-0">
          {/* 캐릭터 바로 뒤 글로우 - 페이지 배경 그라데이션 위에 한 번 더 진하게 */}
          <div
            className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
            style={{
              background: `radial-gradient(circle, color-mix(in srgb, ${glowColor} 50%, transparent) 0%, transparent 70%)`,
              opacity: 0.55,
            }}
          />
          <Heart size={24} className="absolute top-4 -left-7 -rotate-12 z-10" style={{ color: decorationColor, fill: decorationColor }} />
          <Heart size={36} className="absolute top-12 -left-6 -rotate-12 z-10" style={{ color: decorationColor, fill: decorationColor }} />
          <Heart size={30} className="absolute bottom-14 -right-5 rotate-12 z-10" style={{ color: decorationColor, fill: decorationColor }} />
          {characterImageUrl && <img src={characterImageUrl} alt="" className="w-[230px] h-[230px] object-contain relative z-10" />}
          <div
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center border-2 border-white z-20"
            style={{ backgroundColor: decorationColor }}
          >
            <Check size={28} strokeWidth={2.5} className="text-white" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">선물 페이지가 준비됐어요!</h2>
          <p className="text-sm text-gray-500 mt-2">
            친구들에게 초대장을 공유하면<br />
            축하 메시지를 남기거나 선물에 함께할 수 있어요
          </p>
        </div>

        <div className="w-full space-y-2 mt-5">
          <p className="text-sm font-semibold text-gray-700">초대장 링크</p>
          <div className="border border-gray-200 rounded-xl p-3 bg-white">
            <div className="flex h-14 items-center gap-2 rounded-lg bg-gray-100 px-4">
              <div className="flex-1 text-sm text-gray-400 truncate">{shareLink}</div>
              <button
                onClick={handleCopy}
                className={`h-9 px-4 rounded text-sm font-medium transition-colors whitespace-nowrap
                  ${copied ? 'bg-gray-800 text-white' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
              >
                {copied ? '복사 완료' : '링크 복사'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-24 pb-2">
        <button
          onClick={onViewFunding}
          className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
        >
          선물 페이지 보기
        </button>
      </div>
    </div>
  );
}
