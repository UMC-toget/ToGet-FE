import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Link, X } from 'lucide-react';
import { useTogetherCreateStore } from '../../store/togetherCreateStore';
import { getInvitationAccent, useInvitationMeta } from './Mascot';
import heroStars from '../../assets/hero-stars.svg';

// 아직 "함께 선물" 준비방 상세 페이지가 없어서, 우선 홈으로 이동합니다.
export default function TogetherStepComplete() {
  const navigate = useNavigate();
  const { roomName, inviteCharacter, inviteBackgroundId, inviteColor } = useTogetherCreateStore();
  const [copied, setCopied] = useState(false);
  const { backgrounds, characters } = useInvitationMeta();
  const characterImageUrl = characters.find((item) => item.id === inviteCharacter)?.imageUrl;
  const selectedColor = backgrounds.find((item) => item.id === inviteBackgroundId)?.hexCode ?? inviteColor;
  const glowColor = selectedColor === '#FFFFFF' ? '#D1D5DB' : selectedColor;
  const accentColor = getInvitationAccent(selectedColor);
  const decorationColor = selectedColor === '#FFFFFF' ? accentColor : selectedColor;

  // 한글 등 비-ASCII 문자는 slug에서 전부 제거되므로, 로마자/숫자가 없는 이름이면 하이픈만 남습니다.
  const rawSlug = roomName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
  const slug = /[a-z0-9]/.test(rawSlug) ? rawSlug : 'together-gift';
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
        await navigator.share({ title: roomName, url: `https://${shareLink}` });
      } catch {
        // 사용자가 공유 시트를 취소한 경우 등
      }
    } else {
      handleCopy();
    }
  };

  const handleGoHome = () => navigate('/home');

  return (
    <div className="flex-1 min-h-0 w-full max-w-[350px] mx-auto flex flex-col items-center relative">
      {/* 페이지 전체 배경 그라데이션 - 캐릭터를 중심으로 진하게 시작해서 아래로 갈수록 옅어짐 */}
      <div
        className="absolute inset-x-0 top-0 h-96 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 38%, color-mix(in srgb, ${glowColor} 26%, transparent) 0%, color-mix(in srgb, ${glowColor} 14%, transparent) 38%, transparent 68%)` }}
      />
      <button
        onClick={handleGoHome}
        aria-label="닫기"
        className="absolute top-0 right-0 p-2 text-gray-600 hover:text-gray-900 transition-colors z-10"
      >
        <X size={20} />
      </button>

      <div className="flex flex-col items-center w-full pt-7 gap-4">
        {/* 완료 아이콘 - 초대장에서 고른 캐릭터를 그대로 사용해 일관성 유지 */}
        <div className="relative flex items-center justify-center w-64 h-64 shrink-0">
          <div
            className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
            style={{ background: `radial-gradient(circle, color-mix(in srgb, ${glowColor} 28%, transparent) 0%, transparent 70%)`, opacity: 0.55 }}
          />
          <img
            src={heroStars}
            alt=""
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 w-[430px] max-w-none -translate-x-1/2 -translate-y-1/2 z-10"
          />
          {characterImageUrl && <img src={characterImageUrl} alt="" className="w-[210px] h-[210px] object-contain relative z-10" />}
          <div
            className="absolute bottom-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center border-2 border-white z-20"
            style={{ backgroundColor: decorationColor }}
          >
            <Check size={26} className="text-white" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-base font-bold text-gray-900">준비방이 만들어졌어요!</h2>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            링크를 공유해서 친구들을 초대하고<br />
            함께 선물을 준비해보세요.
          </p>
        </div>

        <div className="w-full space-y-2 mt-3">
          <p className="text-sm font-semibold text-gray-700">초대장 링크</p>
          <div className="border border-gray-200 rounded-xl p-3 bg-white space-y-2">
            <div className="flex h-12 items-center gap-2 rounded-lg bg-gray-100 px-3">
              <div className="flex-1 text-sm text-gray-400 truncate">{shareLink}</div>
              <button
                onClick={handleCopy}
                className={`h-8 px-3 rounded text-xs font-medium transition-colors whitespace-nowrap
                  ${copied ? 'bg-gray-800 text-white' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
              >
                {copied ? '복사 완료' : '링크 복사'}
              </button>
            </div>
            <button
              onClick={handleShare}
              className="w-full h-10 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Link size={14} /> 초대장 공유
            </button>
          </div>
        </div>
      </div>

      <div className="w-full mt-8 pb-2">
        <button
          onClick={handleGoHome}
          className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
        >
          준비방 상세 보기
        </button>
      </div>
    </div>
  );
}
