import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useFundingCreateStore, isStepDirty } from '../../store/fundingCreateStore';
import Step1BasicInfo from '../../components/create/Step1BasicInfo';
import Step2Wishlist from '../../components/create/Step2Wishlist';
import Step3Visibility from '../../components/create/Step3Visibility';
import Step4Account from '../../components/create/Step4Account';
import Step5Invite from '../../components/create/Step5Invite';

const STEP_TITLES: Record<string, string> = {
  '1': '1단계 : 기본 정보',
  '2': '2단계 : 받고 싶은 선물',
  '3': '3단계 : 공개 범위',
  '4': '4단계 : 계좌 정보',
  '5': '5단계 : 초대장',
};

/**
 * D 섹션: 내 선물 페이지 수정하기 - 개별 단계 수정 폼 (/funding/:id/edit/:step)
 * 만들기 플로우의 Step1~5 컴포넌트를 그대로 재사용하되, "다음" 대신 "수정 저장"으로 라벨을 바꾸고
 * 원본과 달라진 게 없으면 저장 버튼을 비활성화합니다. 저장하면 선택 화면으로 돌아갑니다.
 */
export default function FundingEditStepPage() {
  const { id, step } = useParams();
  const navigate = useNavigate();
  const state = useFundingCreateStore();
  const dirty = step ? isStepDirty(state, Number(step)) : false;

  const handleDone = () => navigate(`/funding/${id}/edit`);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <div className="flex items-center gap-2 px-4 pt-5 pb-3">
        <button
          onClick={handleDone}
          className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-sm font-semibold text-gray-700">{STEP_TITLES[step ?? ''] ?? '수정하기'}</h1>
      </div>

      <div className="flex-1 px-4 pb-6 flex flex-col overflow-hidden">
        {step === '1' && <Step1BasicInfo onNext={handleDone} submitLabel="수정 저장" disabled={!dirty} />}
        {step === '2' && <Step2Wishlist onNext={handleDone} submitLabel="수정 저장" disabled={!dirty} />}
        {step === '3' && <Step3Visibility onNext={handleDone} submitLabel="수정 저장" disabled={!dirty} />}
        {step === '4' && <Step4Account onNext={handleDone} submitLabel="수정 저장" disabled={!dirty} />}
        {step === '5' && <Step5Invite onNext={handleDone} submitLabel="수정 저장" disabled={!dirty} />}
      </div>
    </div>
  );
}
