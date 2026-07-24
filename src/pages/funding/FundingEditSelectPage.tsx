import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFundingCreateStore, isStepDirty } from '../../store/fundingCreateStore';
import { getMockEditData } from './editFundingMock';

const STEPS = [
  { step: 1, label: '1단계 : 기본 정보', desc: '선물 페이지 제목, 날짜, 소개글, 페이지 이미지' },
  { step: 2, label: '2단계 : 받고 싶은 선물', desc: '받고 싶은 선물 등록' },
  { step: 3, label: '3단계 : 공개 범위', desc: '진행률, 모인 금액, 참여한 친구 수, 이름, 축하메시지' },
  { step: 4, label: '4단계 : 계좌 정보', desc: '계좌 정보 수정' },
  { step: 5, label: '5단계 : 초대장', desc: '초대장 제목, 내용, 색상, 캐릭터' },
];

/**
 * D 섹션: 내 선물 페이지 수정하기 - 단계 선택 화면 (/funding/:id/edit)
 * 각 항목을 누르면 해당 단계의 수정 폼(FundingEditStepPage)으로 이동하고,
 * 원본과 달라진 단계에는 "변경됨" 뱃지가 붙습니다.
 */
export default function FundingEditSelectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useFundingCreateStore();
  const { editFundingId, loadForEdit } = state;

  // 이 선물 페이지의 수정 세션이 아직 시작되지 않았다면(다른 페이지였거나 처음 진입) 목데이터로 채워넣습니다.
  // 이미 채워진 상태에서 단계 폼 <-> 선택 화면을 오갈 때는 다시 초기화하지 않아야 진행 중인 수정이 유지됩니다.
  useEffect(() => {
    if (id && editFundingId !== id) {
      loadForEdit(id, getMockEditData());
    }
  }, [id, editFundingId, loadForEdit]);

  const dirtySteps = new Set(STEPS.map((s) => s.step).filter((step) => isStepDirty(state, step)));
  const hasChanges = dirtySteps.size > 0;

  // 이 플로우는 개설자만 들어올 수 있으므로 상세 페이지로 돌아갈 때도 ?owner=1을 유지해야
  // 탭/수정하기 버튼이 있는 개설자 뷰가 계속 보입니다.
  const handleComplete = () => {
    navigate(
      `/funding/${id}?owner=1`,
      hasChanges ? { state: { toast: '선물 페이지가 수정 완료되었습니다', undo: true } } : undefined,
    );
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <div className="flex items-center gap-2 px-4 pt-5 pb-3">
        <button
          onClick={() => navigate(`/funding/${id}?owner=1`)}
          className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-sm font-semibold text-gray-700">선물 페이지 수정하기</h1>
      </div>

      <div className="flex-1 px-4 pb-6 flex flex-col overflow-hidden">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">수정하고 싶은 단계를 선택해 주세요</h2>
          <p className="text-xs text-gray-400 mt-1">해당 단계의 내용을 수정할 수 있어요</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {STEPS.map(({ step, label, desc }) => (
            <button
              key={step}
              onClick={() => navigate(`/funding/${id}/edit/${step}`)}
              className="w-full flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  {dirtySteps.has(step) && (
                    <span className="text-[10px] font-medium text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                      변경됨
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </button>
          ))}
        </div>

        <button
          onClick={handleComplete}
          className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl mt-4 hover:bg-gray-800 transition-colors"
        >
          수정 완료
        </button>
      </div>
    </div>
  );
}
