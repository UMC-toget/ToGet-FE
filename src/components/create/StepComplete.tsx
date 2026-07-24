import { useState } from 'react';
import { Check, Copy, Share2, Heart, X } from 'lucide-react';
import { useFundingCreateStore } from '../../store/fundingCreateStore';
import { CHARACTER_IMAGES, ACCENT_COLORS } from './Step5Invite';

interface Props {
  onViewFunding: () => void;
  onGoHome: () => void;
}

export default function StepComplete({ onViewFunding, onGoHome }: Props) {
  const { title, anniversaryDate, inviteCharacter, inviteColor } = useFundingCreateStore();
  const [copied, setCopied] = useState(false);
  const glowColor = inviteColor === '#FFFFFF' ? '#D1D5DB' : inviteColor;
  const accentColor = ACCENT_COLORS[inviteColor] ?? '#DB2777';

  const slug = title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '') || 'my-funding';
  const shareLink = `toget.kr/p/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 권한이 없는 등의 경우 - 조용히 무시 (필요시 토스트 처리)
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: `https://${shareLink}` });
      } catch {
        // 사용자가 공유 시트를 취소한 경우 등
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col items-center h-full relative">
      {/* 페이지 전체 배경 그라데이션 - 캐릭터를 중심으로 진하게 시작해서 아래로 갈수록 옅어짐 */}
      <div
        className="absolute inset-x-0 top-0 h-96 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 25%, ${accentColor} 0%, ${glowColor} 15%, transparent 60%)`, opacity: 0.5 }}
      />
      <button
        onClick={onGoHome}
        aria-label="닫기"
        className="absolute top-0 right-0 p-2 text-gray-600 hover:text-gray-900 transition-colors z-10"
      >
        <X size={20} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center w-full gap-6">
        {/* 완료 아이콘 - 초대장에서 고른 캐릭터/색상을 그대로 사용해 일관성 유지 */}
        <div className="relative flex items-center justify-center w-64 h-64">
          {/* 캐릭터 바로 뒤 글로우 - 페이지 배경 그라데이션 위에 한 번 더 진하게 */}
          <div
            className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
            style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`, opacity: 0.8 }}
          />
          <Heart size={22} className="absolute top-8 left-4 -rotate-15 z-10" style={{ color: accentColor, fill: accentColor }} />
          <Heart size={14} className="absolute top-18 left-0 -rotate-15 z-10" style={{ color: accentColor, fill: accentColor, opacity: 0.6 }} />
          <Heart size={16} className="absolute bottom-18 right-2 -rotate-15 z-10" style={{ color: accentColor, fill: accentColor, opacity: 0.6 }} />
          <img
            src={CHARACTER_IMAGES[inviteCharacter - 1]}
            alt=""
            className="w-[150px] h-[150px] object-contain relative z-10"
          />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-9 h-9 bg-pink-400 rounded-full flex items-center justify-center border-2 border-white z-20">
            <Check size={16} className="text-white" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">선물 페이지가 준비됐어요!</h2>
          <p className="text-sm text-gray-500 mt-2">
            친구들에게 초대장을 공유하면<br />
            축하 메시지를 남기거나 선물에 함께할 수 있어요
          </p>
        </div>

        <div className="w-full border border-gray-100 rounded-2xl p-4 bg-white shadow-sm space-y-3">
          <p className="text-sm font-semibold text-gray-700">초대장 링크</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 truncate bg-gray-50">
              {shareLink}
            </div>
            <button
              onClick={handleCopy}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap
                ${copied ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
            >
              {copied ? '복사 완료' : (
                <span className="flex items-center gap-1"><Copy size={14} />링크 복사</span>
              )}
            </button>
          </div>
          <button
            onClick={handleShare}
            className="w-full py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
          >
            <Share2 size={14} /> 초대장 공유
          </button>
        </div>

        {anniversaryDate && (
          <p className="text-xs text-gray-400">기념일: {anniversaryDate}</p>
        )}
      </div>

      <div className="w-full mt-4">
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
