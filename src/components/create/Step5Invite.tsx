import { useState } from 'react';
import { X } from 'lucide-react';
import { useFundingCreateStore } from '../../store/fundingCreateStore';
import Mascot, { INVITE_COLORS, CHARACTER_COUNT } from './Mascot';

interface Props {
  onNext: () => void;
}

type Tab = 'message' | 'color' | 'character';

const TITLE_MAX = 15;
const CONTENT_MAX = 60;

export default function Step5Invite({ onNext }: Props) {
  const { title, inviteTitle, inviteContent, inviteColor, inviteCharacter, setInvite } = useFundingCreateStore();
  const [tab, setTab] = useState<Tab>('message');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const previewName = title.split(' ')[0] || '희주';
  const displayTitle = inviteTitle || `${previewName}님의 생일이 다가오고 있어요!`;
  const displayContent = inviteContent || '따뜻한 축하를 함께 전해볼까요? 💌';

  const changeCharacter = (delta: number) => {
    const next = ((inviteCharacter - 1 + delta + CHARACTER_COUNT) % CHARACTER_COUNT) + 1;
    setInvite({ inviteCharacter: next });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">초대장을 작성해 주세요</h2>
          <p className="text-xs text-gray-400 mt-1">친구들이 처음 보는 화면이에요, 따뜻한 말과 마음을 전해보세요</p>
        </div>

        {/* 미리보기 - 탭하면 확대 모달 */}
        <button
          onClick={() => setShowPreviewModal(true)}
          className="w-full rounded-2xl overflow-hidden border border-pink-100 text-left"
          style={{ background: inviteColor }}
        >
          <div className="px-5 py-6 flex items-center gap-4">
            <Mascot character={inviteCharacter} color="white" size={64} />
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{displayTitle}</p>
              <p className="text-xs text-gray-500 mt-1 truncate">{displayContent}</p>
            </div>
          </div>
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
                <label className="text-sm font-medium text-gray-700">초대장 제목</label>
                <span className="text-[11px] text-gray-400">{inviteTitle.length}/{TITLE_MAX}</span>
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
                <label className="text-sm font-medium text-gray-700">초대장 내용</label>
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
            <div className="flex flex-wrap gap-3">
              {INVITE_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setInvite({ inviteColor: color })}
                  className={`w-9 h-9 rounded-full border-2 transition-transform ${
                    inviteColor === color ? 'border-gray-800 scale-110' : 'border-gray-200'
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
                <Mascot character={inviteCharacter} color={inviteColor} size={100} />
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
        className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl mt-4 hover:bg-gray-800 transition-colors"
      >
        저장
      </button>

      {/* 확대 미리보기 모달 */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="rounded-3xl p-6 w-full max-w-xs text-center relative shadow-xl"
            style={{ background: inviteColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreviewModal(false)}
              aria-label="닫기"
              className="absolute top-3 right-3 text-gray-500 bg-white/70 rounded-full p-1"
            >
              <X size={16} />
            </button>
            <div className="flex flex-col items-center gap-4 mt-4">
              <Mascot character={inviteCharacter} color="white" size={96} />
              <p className="text-sm font-semibold text-gray-800">따뜻한 축하를 함께 전해주시겠어요?</p>
              <div className="bg-white rounded-2xl p-4 w-full text-left shadow-sm">
                <p className="text-sm font-bold text-gray-900">{displayTitle}</p>
                <p className="text-xs text-gray-500 mt-2 whitespace-pre-line">{displayContent}</p>
                <p className="text-[11px] text-pink-400 mt-2">from. {previewName}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}