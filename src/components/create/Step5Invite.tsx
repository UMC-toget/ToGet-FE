import { useState, useId } from 'react';
import { X, Expand } from 'lucide-react';
import { useFundingCreateStore } from '../../store/fundingCreateStore';
import { INVITE_COLORS, CHARACTER_COUNT } from './Mascot';
import { MOCK_USER } from '../../pages/my/mockUser';
import char1 from '../../assets/invite-character1.svg';
import char2 from '../../assets/invite-character2.svg';
import char3 from '../../assets/invite-character3.svg';
import char4 from '../../assets/invite-character4.svg';
import char5 from '../../assets/invite-character5.svg';
import char6 from '../../assets/invite-character6.svg';

interface Props {
  onNext: () => void;
  submitLabel?: string;
  disabled?: boolean;
}

type Tab = 'message' | 'color' | 'character';

const TITLE_MAX = 15;
const CONTENT_MAX = 60;

// inviteCharacter(1~6)에 대응하는 캐릭터 이미지
// StepComplete 등 다른 화면에서도 동일한 캐릭터 이미지를 써야 해서 export 합니다.
export const CHARACTER_IMAGES = [char1, char2, char3, char4, char5, char6];

// 초대장 색상(파스텔)마다 로고/글씨에 쓸 포인트 색상 (채도를 낮춘 톤)
export const ACCENT_COLORS: Record<string, string> = {
  '#FCE4F0': '#FF2D95', // pink (형광 느낌)
  '#FFD3CC': '#FF3B30', // red (형광 느낌)
  '#FFF7DA': '#FFC400', // yellow (형광 느낌)
  '#EEF6DD': '#6FCF00', // green (형광 느낌)
  '#DCEBFA': '#00C2FF', // blue (형광 느낌)
  '#E9E3F5': '#7B2FFF', // purple (형광 느낌)
  '#F0E5F7': '#B84DFF', // light purple (형광 느낌)
  '#FFFFFF': '#9CA3AF', // white → 중립 회색
};

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// hex를 흰색과 섞어 밝은 톤을 만듭니다 (ratio 0~1, 1에 가까울수록 더 밝아짐)
function lighten(hex: string, ratio: number) {
  const c = hexToRgb(hex);
  const r = Math.round(c.r + (255 - c.r) * ratio);
  const g = Math.round(c.g + (255 - c.g) * ratio);
  const b = Math.round(c.b + (255 - c.b) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

// 초대장 배경에 흩뿌려지는 반짝이 별 장식 (퍼센트 좌표라 카드/모달 크기 상관없이 재사용 가능)
const SPARKLES: { top: string; left?: string; right?: string; size: number; color: string; rotate: number }[] = [
  { top: '52%', right: '22%', size: 12, color: '#FFFFFF', rotate: 20 },
  { top: '49%', left: '16%', size: 18, color: '#FFFFFF', rotate: 8 },
  { top: '46%', left: '32%', size: 10, color: '#FBCFE8', rotate: 0 },
  { top: '53%', left: '45%', size: 9, color: '#FFFFFF', rotate: 15 },
  { top: '50%', right: '30%', size: 11, color: '#F472B6', rotate: 25 },
  { top: '20%', left: '40%', size: 8, color: '#FBCFE8', rotate: -10 },
];

function InviteSparkles() {
  return (
    <>
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute select-none pointer-events-none"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            fontSize: s.size,
            color: s.color,
            transform: `rotate(${s.rotate}deg)`,
          }}
        >
          ✦
        </span>
      ))}
    </>
  );
}

// "To Get" 로고 원본 path (CSS mask 방식은 브라우저마다 스케일링이 달라 좌우가 잘리는 문제가 있어서,
// img/character와 동일하게 신뢰할 수 있는 방식인 "SVG를 코드에 직접 그리기"로 전환했습니다.
// viewBox만 맞으면 height 하나만 지정해도 항상 정확한 비율로 렌더링됩니다.)
const TOGET_LOGO_PATH =
  'M48.0117 12.9177C58.9686 12.918 66.7148 23.29 66.7148 34.5506C66.7146 45.811 58.9684 56.1831 48.0117 56.1834C37.0548 56.1834 29.3088 45.8111 29.3086 34.5506C29.3086 23.2898 37.0546 12.9177 48.0117 12.9177ZM101.861 3.55739C111.619 3.55739 119.585 10.3465 122.945 19.3435L119.302 20.7039L115.658 22.0652C113.193 15.4646 107.734 11.3367 101.861 11.3367C94.0332 11.337 86.7637 18.8745 86.7637 29.3972C86.7638 40.242 92.512 47.1552 100.271 47.7693C104.789 48.1268 109.154 47.1556 112.863 43.2351C113.127 42.9566 113.613 42.3419 114.158 41.5047C114.692 40.6852 115.179 39.8084 115.503 39.0535C115.709 38.5729 115.85 38.0116 115.938 37.3767H101.861V29.5984H123.813V33.4871C123.813 34.0279 123.879 35.1414 123.813 36.5193V55.3631H116.035V50.8592C110.855 54.9837 104.995 55.9464 99.6582 55.5242C86.5104 54.4837 78.9846 42.797 78.9844 29.3972C78.9844 15.6752 88.7169 3.55773 101.861 3.55739ZM179.201 0.214621C181.732 -0.328734 185.686 -0.0260564 188.414 3.32595C191.052 6.56808 191.585 11.539 190.167 18.073L190.154 18.1287L190.141 18.1843C189.466 20.9039 188.075 25.0296 186.019 28.7273C185.821 29.0825 185.612 29.4366 185.396 29.7908H191.998V37.5701H180.128C180.257 38.035 180.401 38.5202 180.562 39.0154C181.344 41.4096 182.336 43.544 183.302 44.7927C184.966 46.9438 186.935 47.4029 188.155 47.5525C190.43 47.831 192.459 47.3475 194.126 46.1941C195.792 45.0412 197.367 43.0266 198.366 39.784C198.369 39.7728 198.373 39.7608 198.376 39.7478C198.4 39.6529 198.434 39.5091 198.477 39.3269C198.562 38.9609 198.677 38.4456 198.791 37.8572C199.031 36.6169 199.222 35.2904 199.222 34.3533H207.001C207.001 36.0639 206.689 37.989 206.428 39.3377C206.291 40.0437 206.154 40.6581 206.052 41.0974C206 41.3176 205.956 41.4958 205.925 41.6218C205.909 41.6849 205.897 41.7353 205.888 41.7713C205.883 41.789 205.88 41.8035 205.877 41.8142C205.876 41.8195 205.874 41.8244 205.873 41.8279C205.873 41.8296 205.872 41.8315 205.872 41.8328L205.871 41.8347L202.107 40.8552L205.871 41.8357L205.852 41.9129L205.828 41.9881C204.414 46.6307 201.919 50.2609 198.553 52.5906C195.176 54.927 191.198 55.7617 187.21 55.2732C184.882 54.988 180.569 53.9762 177.147 49.5515C175.38 47.2656 174.055 44.1478 173.168 41.4275C172.746 40.1347 172.387 38.8127 172.114 37.5701H165.658V29.7908H170.48C169.626 25.6852 168.998 20.8319 169.173 16.3015C169.299 13.0288 169.854 9.61382 171.29 6.7195C172.785 3.70491 175.291 1.18981 179.074 0.243918L179.138 0.228293L179.201 0.214621ZM37.6523 10.6726H22.7168V54.9256H14.9375V10.6726H0V2.89333H37.6523V10.6726ZM148.743 13.0183C154.455 12.4931 158.692 14.0699 161.156 17.3758C163.428 20.4234 163.514 24.0685 163.056 26.3943L163.031 26.5174L162.999 26.6384C161.295 33.068 155.869 36.5043 150.911 38.2693C146.284 39.9163 141.291 40.4131 137.756 40.3816C137.928 40.6944 138.121 41.0057 138.34 41.3084C139.472 42.8759 141.341 44.3629 144.613 44.7967L144.935 44.8347L144.984 44.8406L145.034 44.8474C146.914 45.1005 149.906 44.974 152.495 43.8494C154.901 42.8044 156.936 40.9428 157.648 37.3816L161.463 38.1443L165.276 38.907C163.988 45.347 159.957 49.0889 155.594 50.9842C151.414 52.7994 146.932 52.9516 143.996 52.5564V52.5554C138.3 51.9108 134.427 49.1738 132.035 45.864C130.738 44.0692 129.904 42.1486 129.41 40.367H126.356V32.5877H129.026C129.803 26.7029 132.619 22.2812 136.069 19.1629C140.139 15.4853 145.031 13.6491 148.435 13.0584L148.588 13.032L148.743 13.0183ZM48.0117 20.6951C42.6055 20.6951 37.0859 26.2119 37.0859 34.5506C37.0861 42.889 42.6056 48.4051 48.0117 48.4051C53.4177 48.4047 58.9363 42.8887 58.9365 34.5506C58.9365 26.2122 53.4178 20.6954 48.0117 20.6951ZM154.92 22.0252C154.574 21.5611 153.443 20.4317 149.61 20.7517C147.405 21.1658 144.029 22.4535 141.285 24.9334C139.281 26.7449 137.584 29.2069 136.906 32.5877H137.085L137.155 32.5906C139.993 32.6934 144.425 32.3211 148.302 30.9412C152.188 29.5577 154.663 27.5016 155.444 24.7703C155.599 23.8323 155.441 22.7236 154.92 22.0252ZM182.381 8.23611C182.083 7.87007 181.552 7.68219 180.882 7.81228C179.769 8.11268 178.934 8.81358 178.259 10.1756C177.508 11.69 177.052 13.8754 176.946 16.6023C176.816 19.985 177.238 23.7248 177.872 27.0779C178.33 26.447 178.783 25.7323 179.221 24.9461C180.859 21.9999 182.026 18.5706 182.581 16.3465C183.795 10.6961 182.774 8.71996 182.381 8.23611Z';

// "To Get" 로고 - SVG를 직접 렌더링해서 색을 동적으로 입힙니다 (mask 방식 대비 크로스브라우저로 안전함).
// 흰색 팔레트를 고른 경우엔 글씨를 흰색으로 채우고 회색 stroke로 테두리를 그립니다.
function TogetLogoMark({ accentColor, isWhite, className }: { accentColor: string; isWhite?: boolean; className?: string }) {
  const gradId = useId();
  // viewBox에 여백(padding)을 살짝 줬습니다. path의 'T'가 x=0에 딱 붙어있다보니
  // 안티앨리어싱/둥근 모서리(overflow-hidden) 경계와 맞물려 아주 미세하게 잘려 보이는 문제가 있었는데,
  // 이렇게 여백을 주면 어떤 브라우저/컨테이너 상황에서도 잘릴 여지가 없어집니다.
  return (
    <svg viewBox="-4 -4 215.001 64.1834" className={className} style={{ overflow: 'visible' }} aria-hidden focusable="false">
      {!isWhite && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="56.1834" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={lighten(accentColor, 0.92)} />
            <stop offset="55%" stopColor={lighten(accentColor, 0.35)} />
            <stop offset="100%" stopColor={accentColor} />
          </linearGradient>
        </defs>
      )}
      <path
        d={TOGET_LOGO_PATH}
        fill={isWhite ? '#FFFFFF' : `url(#${gradId})`}
        stroke={isWhite ? '#9CA3AF' : 'none'}
        strokeWidth={isWhite ? 2 : 0}
        strokeLinejoin="round"
        paintOrder="stroke fill"
      />
    </svg>
  );
}

export default function Step5Invite({ onNext, submitLabel = '저장', disabled = false }: Props) {
  const { inviteTitle, inviteContent, inviteColor, inviteCharacter, setInvite } = useFundingCreateStore();
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">초대장을 작성해 주세요</h2>
          <p className="text-xs text-gray-400 mt-1">친구들이 처음 보는 화면이에요, 따뜻한 말과 마음을 전해보세요</p>
        </div>

        {/* 미리보기 - 탭하면 확대 모달 */}
        <button
          onClick={() => setShowPreviewModal(true)}
          className="relative block w-full h-64 rounded-2xl overflow-hidden border border-gray-200 text-left bg-white"
        >
          {/* 그라데이션은 초대장(로고+캐릭터) 영역까지만, 나머지 바탕은 순백색으로 남도록
              흰색이 아니라 '투명'으로 빠지게 해서 카드 하단부는 아예 그라데이션 영향이 없게 함 */}
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
        disabled={!isFormValid || disabled}
        className={`w-full py-4 font-semibold rounded-xl mt-4 transition-colors ${
          isFormValid && !disabled ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-300 text-white cursor-not-allowed'
        }`}
      >
        {submitLabel}
      </button>

      {/* 확대 미리보기 모달 - 피그마 시안처럼 상단에 붙고, 배경이 옅게 비치고, 닫기 버튼은 하단 중앙에 */}
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
              {/* 캐릭터를 중심으로 진하게 시작해서 바깥으로 갈수록 옅어지는 글로우 - 작은 미리보기 카드와 동일한 톤 */}
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
