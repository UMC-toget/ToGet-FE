import { useEffect, useState } from 'react';
import { X, Expand, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTogetherCreateStore } from '../../store/togetherCreateStore';
import { getCharacterImageSrc, getInvitePreviewAccent, InviteColorSwatchGrid, useInvitationMeta } from './Mascot';
import { TogetLogoMark, InviteSparkles } from './Step5Invite';
import { useMyProfile } from '../../hooks/useMyProfile';
import InvitationPreviewCard from './InvitationPreviewCard';
import CategoryChips from '../common/CategoryChips';
import ZoomInIcon from '../icons/ZoomInIcon';

export interface TogetherInviteInitialValue {
  title: string;
  content: string;
  characterId: number;
  backgroundId: number;
}

interface Props {
  onNext: () => void;
  submitLabel?: string;
  disabled?: boolean;
  initialValue?: TogetherInviteInitialValue;
}

type Tab = 'message' | 'color' | 'character';

const TABS: { key: Tab; label: string }[] = [
  { key: 'message', label: '초대 메시지' },
  { key: 'color', label: '초대장 색상' },
  { key: 'character', label: '캐릭터' },
];

const TITLE_MAX = 15;
const CONTENT_MAX = 60;

export default function TogetherStep3Invite({ onNext, submitLabel = '저장', disabled = false, initialValue }: Props) {
  const { inviteTitle, inviteContent, inviteBackgroundId, inviteColor, inviteCharacter, setInvite } = useTogetherCreateStore();
  const initialTitle = initialValue?.title;
  const initialContent = initialValue?.content;
  const initialCharacterId = initialValue?.characterId;
  const initialBackgroundId = initialValue?.backgroundId;
  const [tab, setTab] = useState<Tab>('message');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const { backgrounds, characters, isLoading, backgroundError, characterError } = useInvitationMeta();
  const { data: profile } = useMyProfile();

  useEffect(() => {
    const selectedBackground = backgrounds.find((item) => item.id === inviteBackgroundId);
    const targetBackground = selectedBackground ?? backgrounds[0];
    const shouldSyncBackground = Boolean(targetBackground && (targetBackground.id !== inviteBackgroundId || targetBackground.hexCode !== inviteColor));
    const selectedCharacterExists = characters.some((item) => item.id === inviteCharacter);
    const nextCharacter = selectedCharacterExists ? undefined : characters[0];
    if (shouldSyncBackground || nextCharacter) {
      setInvite({
        ...(shouldSyncBackground && targetBackground && { inviteBackgroundId: targetBackground.id, inviteColor: targetBackground.hexCode }),
        ...(nextCharacter && { inviteCharacter: nextCharacter.id }),
      });
    }
  }, [backgrounds, characters, inviteBackgroundId, inviteColor, inviteCharacter, setInvite]);

  useEffect(() => {
    if (
      initialTitle == null ||
      initialContent == null ||
      initialCharacterId == null ||
      initialBackgroundId == null
    ) return;
    setInvite({
      inviteTitle: initialTitle,
      inviteContent: initialContent,
      inviteCharacter: initialCharacterId,
      inviteBackgroundId: initialBackgroundId,
    });
  }, [
    initialBackgroundId,
    initialCharacterId,
    initialContent,
    initialTitle,
    setInvite,
  ]);

  // "from." 은 선물 페이지 제목이 아니라 가입한 사용자(로그인 계정)의 닉네임으로 표시합니다.
  const previewName = profile?.nickname ?? '회원';
  // 아직 입력 전이면(필수값) 안내 문구 대신 라벨 그대로 자리표시용으로 보여줍니다.
  const displayTitle = inviteTitle || '초대장 제목';
  const displayContent = inviteContent || '초대장 내용';
  const isFormValid = inviteTitle.trim().length > 0 && inviteContent.trim().length > 0;
  const isSubmitDisabled = !isFormValid || disabled;

  const changeCharacter = (delta: number) => {
    if (!characters.length) return;
    const currentIndex = characters.findIndex((item) => item.id === inviteCharacter);
    const nextIndex = ((currentIndex >= 0 ? currentIndex : 0) + delta + characters.length) % characters.length;
    setInvite({ inviteCharacter: characters[nextIndex].id });
  };

  const currentCharacter = characters.find((item) => item.id === inviteCharacter) ?? characters[0];
  const currentCharacterIndex = Math.max(0, characters.findIndex((item) => item.id === currentCharacter?.id));
  const currentCharacterNumber = String(currentCharacterIndex + 1).padStart(2, '0');
  const currentCharacterImage = getCharacterImageSrc(currentCharacter);
  const { isWhite, accentColor, glowColor } = getInvitePreviewAccent(inviteColor);

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
          className="relative block w-full text-left"
        >
          <div className="hidden">
          <div
            className="absolute inset-x-0 top-0 h-40 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 45%, color-mix(in srgb, ${glowColor} 50%, transparent) 0%, color-mix(in srgb, ${glowColor} 30%, transparent) 32%, transparent 68%)`,
              filter: 'blur(33px)',
            }}
          />
          <InviteSparkles />
          <TogetLogoMark
            accentColor={accentColor}
            isWhite={isWhite}
            className="absolute left-1/2 top-4 -translate-x-1/2 h-12 z-0"
          />
          {currentCharacterImage && <img src={currentCharacterImage} alt="" className="absolute left-1/2 top-9.5 -translate-x-1/2 h-19 z-10" />}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-3/5 bg-white rounded-2xl px-5 py-4 shadow-sm">
            <p className="text-sm font-bold text-gray-900 truncate">{displayTitle}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{displayContent}</p>
            <span className="block text-right text-[10px] font-normal mt-2" style={{ color: accentColor }}>from. {previewName}</span>
          </div>
          <Expand size={14} className="absolute right-3 bottom-3 text-gray-300 z-20" />
          </div>
          <InvitationPreviewCard
            characterId={currentCharacter?.id}
            backgroundId={inviteBackgroundId}
            title={displayTitle}
            content={displayContent}
            fromName={previewName}
            compact
            overlay={
              <span className="absolute bottom-3 right-3 z-30 flex size-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 shadow-[0px_10px_62.5px_rgba(0,0,0,0.04)]">
                <ZoomInIcon className="size-5" />
              </span>
            }
          />
        </button>

        {/* 탭 — 공용 카테고리 칩 디자인(CategoryChips) 재사용 */}
        <CategoryChips
          categories={TABS.map((t) => t.label)}
          selected={TABS.find((t) => t.key === tab)?.label ?? TABS[0].label}
          onSelect={(label) => {
            const next = TABS.find((t) => t.label === label);
            if (next) setTab(next.key);
          }}
        />

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
            <InviteColorSwatchGrid
              backgrounds={backgrounds}
              selectedBackgroundId={inviteBackgroundId}
              onSelect={(background) => setInvite({ inviteBackgroundId: background.id, inviteColor: background.hexCode })}
            />
            {!isLoading && backgroundError && <p className="mt-3 text-xs text-red-400">색상 목록을 불러오지 못했어요.</p>}
          </div>
        )}

        {tab === 'character' && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">캐릭터 선택</p>
            <div className="flex items-center justify-between px-2">
              <button
                onClick={() => changeCharacter(-1)}
                aria-label="이전 캐릭터"
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft size={28} />
              </button>
              <div className="flex flex-col items-center gap-2">
                {currentCharacterImage ? <img src={currentCharacterImage} alt={currentCharacter?.name ?? '초대장 캐릭터'} className="w-32 h-32 object-contain" /> : <div className="w-32 h-32 rounded-full bg-gray-100 animate-pulse" />}
                {currentCharacter ? (
                  <span className="rounded-[3.46px] bg-pink-500 px-1.5 py-[4.73px] text-caption2-r text-white">No.{currentCharacterNumber}</span>
                ) : (
                  <span className="text-xs font-semibold text-pink-400">{characterError ? '불러오기 실패' : '불러오는 중'}</span>
                )}
              </div>
              <button
                onClick={() => changeCharacter(1)}
                aria-label="다음 캐릭터"
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={isSubmitDisabled}
        className={`w-full py-4 font-semibold rounded-xl mt-4 transition-colors ${
          !isSubmitDisabled ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-300 text-white cursor-not-allowed'
        }`}
      >
        {submitLabel}
      </button>

      {/* 확대 미리보기 모달 */}
      <div
          className={`${showPreviewModal ? 'flex' : 'hidden'} fixed inset-0 z-50 items-start justify-center bg-black/30 px-6 pt-24`}
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative w-full max-w-[350px] overflow-visible text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hidden">
              <div
                className="absolute inset-x-0 top-0 h-96 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 65%, color-mix(in srgb, ${glowColor} 50%, transparent) 0%, color-mix(in srgb, ${glowColor} 30%, transparent) 32%, transparent 68%)`,
                  filter: 'blur(33px)',
                }}
              />
              <InviteSparkles />
              <div className="flex flex-col items-center pt-6">
                <p className="text-base font-bold text-gray-900 px-4">따뜻한 축하를<br />함께 전해주시겠어요?</p>
                <TogetLogoMark accentColor={accentColor} isWhite={isWhite} className="h-24 relative z-0 mt-2" />
                {currentCharacterImage && <img src={currentCharacterImage} alt="" className="h-52 -mt-9 relative z-10" />}
                <div className="bg-white rounded-2xl p-5 w-full text-left shadow-sm mt-6">
                  <p className="text-lg font-bold text-gray-900">{displayTitle}</p>
                  <p className="text-xs text-gray-500 mt-2 whitespace-pre-line">{displayContent}</p>
                  <p className="text-sm font-bold mt-3 text-right" style={{ color: accentColor }}>from. {previewName}</p>
                </div>
              </div>
            </div>
            <InvitationPreviewCard
              characterId={currentCharacter?.id}
              backgroundId={inviteBackgroundId}
              title={displayTitle}
              content={displayContent}
              fromName={previewName}
            />

            <button
              onClick={() => setShowPreviewModal(false)}
              aria-label="닫기"
              className="absolute left-1/2 -bottom-16 -translate-x-1/2 text-gray-500 bg-white rounded-full p-2 shadow-md z-20"
            >
              <X size={16} />
            </button>
          </div>
        </div>
    </div>
  );
}
