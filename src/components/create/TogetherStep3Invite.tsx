import { useState } from 'react';
import { X, Expand } from 'lucide-react';
import { useTogetherCreateStore } from '../../store/togetherCreateStore';
import { INVITE_COLORS, CHARACTER_COUNT } from './Mascot';
import { CHARACTER_IMAGES, ACCENT_COLORS, TogetLogoMark, InviteSparkles } from './Step5Invite';
import { MOCK_USER } from '../../pages/my/mockUser';

interface Props {
  onNext: () => void;
}

type Tab = 'message' | 'color' | 'character';

const TITLE_MAX = 15;
const CONTENT_MAX = 60;

export default function TogetherStep3Invite({ onNext }: Props) {
  const { inviteTitle, inviteContent, inviteColor, inviteCharacter, setInvite } = useTogetherCreateStore();
  const [tab, setTab] = useState<Tab>('message');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // "from." 은 선물 페이지 제목이 아니라 가입한 사용자(로그인 계정)의 닉네임으로 표시합니다.
  const previewName = MOCK_USER.name;
  // 아직 입력 전이면(필수값) 안내 문구 대신 라벨 그대로 자리표시용으로 보여줍니다.
  const displayTitle = inviteTitle || '초대장 제목';
  const displayContent = inviteContent || '초대장 내용';
  const isFormValid = inviteTitle.trim().length > 0 && inviteContent.trim().length > 0;

  const changeCharacter = (delta: number) => {
    const next = ((inviteCharacter - 1 + delta + CHARACTER_COUNT) % CHARACTER_COUNT) + 1;
    setInvite({ inviteCharacter: next });
  };

  const currentCharacterImage = CHARACTER_IMAGES[inviteCharacter - 1];
  const isWhite = inviteColor === '#FFFFFF';
  const accentColor = ACCENT_COLORS[inviteColor] ?? '#DB2777';
  const glowColor = isWhite ? '#D1D5DB' : inviteColor;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">초대장을 작성해 주세요</h2>
          <p className="text-xs text-gray-400 mt-1">친구들이 처음 보는 화면이에요, 마음을 모을 수 있도록 적어보세요</p>
        </div>

        {/* 미리보기 - 탭하면 확대 모달 */}
        <button
          onClick={() => setShowPreviewModal(true)}
          className="relative block w-full h-64 rounded-2xl overflow-hidden border border-gray-200 text-left bg-white"
        >
          <div
            className="absolute inset-x-0 top-0 h-40 pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 45%, ${accentColor} 0%, ${glowColor} 20%, transparent 65%)`, opacity: 1 }}
          />
          <InviteSparkles />
          <TogetLogoMark
            accentColor={accentColor}
            isWhite={isWhite}
            className="absolute left-1/2 top-4 -translate-x-1/2 h-12 z-0"
          />
          <img src={currentCharacterImage} alt="" className="absolute left-1/2 top-9.5 -translate-x-1/2 h-19 z-10" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-3/5 bg-white rounded-2xl px-5 py-4 shadow-sm">
            <p className="text-sm font-bold text-gray-900 truncate">{displayTitle}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{displayContent}</p>
            <span className="block text-right text-[10px] font-normal mt-2" style={{ color: accentColor }}>from. {previewName}</span>
          </div>
          <Expand size={14} className="absolute right-3 bottom-3 text-gray-300 z-20" />
        </button>

        {/* 탭 */}
        <div className="flex gap-2">
          {(
            [
              { key: 'message', label: '초대 메시지' },
              { key: 'color', label: '초대장 색상' },
              { key: 'character', label: '캐릭터' },
            ] as { key: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors
                ${tab === t.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'message' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">
                  초대장 제목 <span className="text-red-400">*</span>
                </label>
                <span className={`text-[11px] ${inviteTitle.length >= TITLE_MAX ? 'text-pink-400 font-semibold' : 'text-gray-400'}`}>
                  {inviteTitle.length}/{TITLE_MAX}
                </span>
              </div>
              <input
                type="text"
                maxLength={TITLE_MAX}
                placeholder="초대장 제목을 입력해 주세요"
                value={inviteTitle}
                onChange={(e) => setInvite({ inviteTitle: e.target.value.slice(0, TITLE_MAX) })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-800 transition-colors"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">
                  초대장 내용 <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] text-gray-400">{inviteContent.length}/{CONTENT_MAX}</span>
              </div>
              <textarea
                maxLength={CONTENT_MAX}
                placeholder="초대장으로 전할 말을 적어주세요"
                value={inviteContent}
                onChange={(e) => setInvite({ inviteContent: e.target.value.slice(0, CONTENT_MAX) })}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-800 resize-none transition-colors"
              />
            </div>
          </div>
        )}

        {tab === 'color' && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">초대장 색상</p>
            <div className="grid grid-cols-8 gap-2">
              {INVITE_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setInvite({ inviteColor: color })}
                  className={`relative aspect-square rounded-[3px] transition-colors ${
                    inviteColor === color
                      ? 'z-10 border-2 border-[#28345A]'
                      : color === '#FFFFFF'
                        ? 'border border-gray-200'
                        : 'border border-transparent'
                  }`}
                  style={{ background: color }}
                  aria-label={`색상 ${color} 선택`}
                  aria-pressed={inviteColor === color}
                />
              ))}
            </div>
          </div>
        )}

        {tab === 'character' && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">캐릭터 선택</p>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => changeCharacter(-1)}
                aria-label="이전 캐릭터"
                className="text-gray-400 text-2xl px-2 hover:text-gray-700 transition-colors"
              >
                ‹
              </button>
              <div className="flex flex-col items-center gap-2">
                <img src={currentCharacterImage} alt={`캐릭터 ${inviteCharacter}`} className="w-24 h-24 object-contain" />
                <span className="text-xs font-semibold text-pink-400">
                  No.{String(inviteCharacter).padStart(2, '0')}
                </span>
              </div>
              <button
                onClick={() => changeCharacter(1)}
                aria-label="다음 캐릭터"
                className="text-gray-400 text-2xl px-2 hover:text-gray-700 transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!isFormValid}
        className={`w-full py-4 font-semibold rounded-xl mt-4 transition-colors ${
          isFormValid ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-300 text-white cursor-not-allowed'
        }`}
      >
        저장
      </button>

      {/* 확대 미리보기 모달 */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 px-6 pt-24"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="rounded-3xl p-7 w-full max-w-md text-center relative shadow-xl overflow-visible bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden border border-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.12)] bg-white">
              <div
                className="absolute inset-x-0 top-0 h-96 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 65%, ${accentColor} 0%, ${glowColor} 25%, transparent 65%)`, opacity: 1 }}
              />
              <InviteSparkles />
              <div className="flex flex-col items-center pt-6">
                <p className="text-base font-bold text-gray-900 px-4">따뜻한 축하를<br />함께 전해주시겠어요?</p>
                <TogetLogoMark accentColor={accentColor} isWhite={isWhite} className="h-24 relative z-0 mt-2" />
                <img src={currentCharacterImage} alt="" className="h-52 -mt-9 relative z-10" />
                <div className="bg-white rounded-2xl p-5 w-full text-left shadow-sm mt-6">
                  <p className="text-lg font-bold text-gray-900">{displayTitle}</p>
                  <p className="text-xs text-gray-500 mt-2 whitespace-pre-line">{displayContent}</p>
                  <p className="text-sm font-bold mt-3 text-right" style={{ color: accentColor }}>from. {previewName}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPreviewModal(false)}
              aria-label="닫기"
              className="absolute left-1/2 -bottom-16 -translate-x-1/2 text-gray-500 bg-white rounded-full p-2 shadow-md z-20"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
