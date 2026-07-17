import { useFundingCreateStore } from '../../store/fundingCreateStore';

interface Props {
  onNext: () => void;
}

interface ToggleItemProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleItem({ label, description, checked, onChange }: ToggleItemProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      {/* transform/translate 픽셀 계산 대신 flex justify-start/end로 위치를 잡아서
          트랙 너비가 어떻게 렌더링되든 knob이 항상 정확히 좌/우 끝에 붙습니다. */}
      <button
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`w-12 h-7 rounded-full flex items-center px-1 shrink-0 transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2
          ${checked ? 'bg-pink-500 justify-end' : 'bg-gray-300 justify-start'}`}
      >
        <span className="w-5 h-5 bg-white rounded-full shadow" />
      </button>
    </div>
  );
}

export default function Step3Visibility({ onNext }: Props) {
  const {
    showProgress, showAmount, showParticipantCount, showParticipantNames, showMessages,
    setVisibility,
  } = useFundingCreateStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">친구들에게 보일 정보를 선택해 주세요</h2>
          <p className="text-xs text-gray-400 mt-1">공개범위는 마이페이지에서 언제든지 수정할 수 있어요</p>
        </div>

        <div className="border border-gray-100 rounded-2xl px-4 bg-white shadow-sm">
          <p className="text-xs text-gray-400 pt-4 pb-2">표시 정보 설정</p>
          <ToggleItem
            label="진행률 공개"
            description="달성 % 표시 여부"
            checked={showProgress}
            onChange={(v) => setVisibility({ showProgress: v })}
          />
          <ToggleItem
            label="모인 금액 보이기"
            description="모인 총 금액 공개 여부"
            checked={showAmount}
            onChange={(v) => setVisibility({ showAmount: v })}
          />
          <ToggleItem
            label="참여한 친구 수 보이기"
            description="참여한 친구 수 표시 여부"
            checked={showParticipantCount}
            onChange={(v) => setVisibility({ showParticipantCount: v })}
          />
          <ToggleItem
            label="참여한 친구 이름 보이기"
            description="축하 메시지 작성자 이름 공개 여부"
            checked={showParticipantNames}
            onChange={(v) => setVisibility({ showParticipantNames: v })}
          />
          <ToggleItem
            label="축하 메시지 보이기"
            description="메시지 내용 공개 여부"
            checked={showMessages}
            onChange={(v) => setVisibility({ showMessages: v })}
          />
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl mt-4 hover:bg-gray-800 transition-colors"
      >
        다음
      </button>
    </div>
  );
}