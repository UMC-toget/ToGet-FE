import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, Link, X } from 'lucide-react';
import { useTogetherCreateStore } from '../../store/togetherCreateStore';
import { CHARACTER_IMAGES, ACCENT_COLORS } from './Step5Invite';
import heroStars from '../../assets/hero-stars.svg';

// 아직 "함께 선물" 준비방 상세 페이지가 없어서, 우선 홈으로 이동합니다.
export default function TogetherStepComplete() {
  const navigate = useNavigate();
  const { roomName, inviteCharacter, inviteColor } = useTogetherCreateStore();
  const [copied, setCopied] = useState(false);
  const glowColor = inviteColor === '#FFFFFF' ? '#D1D5DB' : inviteColor;
  const accentColor = ACCENT_COLORS[inviteColor] ?? '#DB2777';

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
    <div className="flex flex-col items-center h-full relative">
      {/* 페이지 전체 배경 그라데이션 - 캐릭터를 중심으로 진하게 시작해서 아래로 갈수록 옅어짐 */}
      <div
        className="absolute inset-x-0 top-0 h-96 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 25%, ${accentColor} 0%, ${glowColor} 15%, transparent 60%)`, opacity: 0.55 }}
      />
      <button
        onClick={handleGoHome}
        aria-label="닫기"
        className="absolute top-0 right-0 p-2 text-gray-600 hover:text-gray-900 transition-colors z-10"
      >
        <X size={20} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center w-full gap-6">
        {/* 완료 아이콘 - 초대장에서 고른 캐릭터를 그대로 사용해 일관성 유지 */}
        <div className="relative flex items-center justify-center w-64 h-64">
          <div
            className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
            style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`, opacity: 0.9 }}
          />
          <img
            src={heroStars}
            alt=""
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 w-[300px] max-w-none -translate-x-1/2 -translate-y-1/2 z-10"
          />
          <img
            src={CHARACTER_IMAGES[inviteCharacter - 1]}
            alt=""
            className="w-[190px] h-[190px] object-contain relative z-10"
          />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center border-2 border-white z-20">
            <Check size={22} className="text-white" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">준비방이 만들어졌어요!</h2>
          <p className="text-sm text-gray-500 mt-2">
            링크를 공유해서 친구들을 초대하고<br />
            함께 선물을 준비해보세요.
          </p>
        </div>

        <div className="w-full border border-gray-100 rounded-2xl p-4 bg-white shadow-sm space-y-3">
          <p className="text-sm font-semibold text-gray-700">초대장 링크</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 truncate bg-gray-100">
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
            <Link size={14} /> 초대장 공유
          </button>
        </div>
      </div>

      <div className="w-full mt-8">
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
