import { useLayoutEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import ConfirmModal from '../components/common/ConfirmModal';
import StepIndicator from '../components/create/StepIndicator';
import Step1BasicInfo from '../components/create/Step1BasicInfo';
import Step2Wishlist from '../components/create/Step2Wishlist';
import Step3Visibility from '../components/create/Step3Visibility';
import Step4Account from '../components/create/Step4Account';
import Step5Invite from '../components/create/Step5Invite';
import StepComplete from '../components/create/StepComplete';
import { useFundingCreateStore } from '../store/fundingCreateStore';
import { createFunding } from '../api/fundings';
import { BANK_NAME_LABELS, createUserAccount, getUserAccounts, type BankName } from '../api/userAccounts';
import { useAuth } from '../hooks/useAuth';
import { useMyProfile } from '../hooks/useMyProfile';
import { uploadImage } from '../utils/uploadImage';
import Toast from '../components/common/Toast';
import { getMyFundings } from '../api/users';

const TOTAL_STEPS = 5;

const BANK_NAME_ALIASES: Partial<Record<string, BankName>> = {
  국민은행: 'KB',
  우체국예금: 'POST_OFFICE',
  대구은행: 'IM_BANK',
};

function resolveBankCode(displayName: string): BankName | undefined {
  return BANK_NAME_ALIASES[displayName] ??
    (Object.entries(BANK_NAME_LABELS) as Array<[BankName, string]>).find(
      ([, label]) => label === displayName,
    )?.[0];
}

function extractFundingId(result: unknown): number | null {
  const rawId = typeof result === 'number' || typeof result === 'string'
    ? result
    : result && typeof result === 'object'
      ? ('fundingId' in result ? result.fundingId : 'id' in result ? result.id : null)
      : null;
  const fundingId = Number(rawId);
  return Number.isInteger(fundingId) && fundingId > 0 ? fundingId : null;
}

export default function FundingCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const wasLoggedInOnEntry = useRef(isLoggedIn);
  const { data: profile } = useMyProfile();
  const commitAsFunding = useFundingCreateStore((s) => s.commitAsFunding);
  const fundingForm = useFundingCreateStore();
  const didInitialize = useRef(false);
  const [step, setStep] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdFundingId, setCreatedFundingId] = useState<number | null>(null);
  const isComplete = step > TOTAL_STEPS;

  // 편집 화면에서 사용하던 Zustand 값이 새 만들기 화면으로 새어 들어오지 않도록 초기화합니다.
  // 명시적으로 "이어서 만들기"를 선택한 경우에만 임시저장 복원용 상태를 유지합니다.
  useLayoutEffect(() => {
    if (didInitialize.current) return;
    didInitialize.current = true;
    if (!(location.state as { continueDraft?: boolean } | null)?.continueDraft) {
      fundingForm.reset();
    }
  }, [fundingForm, location.state]);

  const handleBack = () => {
    if (step === 1) {
      setShowSaveModal(true);
    } else {
      setStep((s) => s - 1);
    }
  };

  // "나가기"는 어느 단계에서든 항상 노출되는 버튼 (뒤로가기와 별개)
  const handleExit = () => setShowSaveModal(true);

  const handleNext = () => setStep((s) => s + 1);

  const handleCreateFunding = async () => {
    if (isCreating) return;
    const selectedAccount = fundingForm.accounts.find((account) => account.id === fundingForm.selectedAccountId);
    if (!profile || !selectedAccount || !fundingForm.inviteBackgroundId) {
      setCreateError('프로필, 계좌 또는 초대장 정보를 다시 확인해 주세요.');
      return;
    }

    const bankName = resolveBankCode(selectedAccount.bankName);
    if (!bankName) {
      setCreateError('선택한 은행 정보를 확인해 주세요.');
      return;
    }

    setIsCreating(true);
    setCreateError('');
    try {
      const targetAmount = fundingForm.wishlist.reduce((sum, gift) => sum + gift.price, 0);
      const existingFundings = await getMyFundings({ page: 0, size: 100 });
      const recentMatchingFunding = [...existingFundings.fundings]
        .filter((funding) => {
          const createdAt = new Date(funding.createdAt).getTime();
          const wasCreatedRecently = Number.isFinite(createdAt) && Date.now() - createdAt < 10 * 60 * 1000;
          return wasCreatedRecently &&
            funding.fundingType === 'MY_GIFT' &&
            funding.title === fundingForm.title &&
            funding.endDate === fundingForm.preparationEndDate &&
            funding.targetAmount === targetAmount;
        })
        .sort((a, b) => b.fundingId - a.fundingId)[0];

      // 직전 시도에서 POST는 성공했지만 응답에 ID가 없었던 경우, 같은 펀딩을 중복 생성하지 않고
      // 목록에서 확인한 실제 ID로 완료 화면을 복구합니다.
      if (recentMatchingFunding) {
        commitAsFunding(String(recentMatchingFunding.fundingId));
        setCreatedFundingId(recentMatchingFunding.fundingId);
        setStep(TOTAL_STEPS + 1);
        return;
      }

      const thumbnailImageUrl = fundingForm.thumbnailImage instanceof File
        ? await uploadImage('fundings/thumbnails', fundingForm.thumbnailImage)
        : fundingForm.thumbnailImage;

      const gifts = await Promise.all(fundingForm.wishlist.map(async (gift) => ({
        giftName: gift.name,
        giftPrice: gift.price,
        giftPurchaseUrl: gift.link ?? null,
        giftImageUrl: gift.imageFile
          ? await uploadImage('fundings/gifts', gift.imageFile)
          : gift.imageUrl ?? null,
      })));

      const normalizedAccount = selectedAccount.accountNumber.replace(/\D/g, '');
      const registeredAccounts = await getUserAccounts();
      const registeredAccount = registeredAccounts.find((account) =>
        account.bankName === bankName &&
        account.account === normalizedAccount &&
        account.accountOwner === selectedAccount.accountHolder,
      );
      const userAccountId = registeredAccount?.userAccountId ?? (await createUserAccount({
        bankName,
        accountOwner: selectedAccount.accountHolder,
        account: normalizedAccount,
      })).userAccountId;

      const result = await createFunding({
        fundingType: 'MY_GIFT',
        title: fundingForm.title,
        recipientName: profile.nickname,
        anniversaryDate: fundingForm.anniversaryDate,
        startDate: fundingForm.preparationStartDate,
        endDate: fundingForm.preparationEndDate,
        introduction: fundingForm.greeting,
        thumbnailImageUrl,
        targetAmount,
        userAccountId,
        invitation: {
          characterId: fundingForm.inviteCharacter,
          backgroundId: fundingForm.inviteBackgroundId,
          title: fundingForm.inviteTitle,
          content: fundingForm.inviteContent,
        },
        visibility: {
          isProgressVisible: fundingForm.showProgress,
          isParticipantCountVisible: fundingForm.showParticipantCount,
          isParticipantNameVisible: fundingForm.showParticipantNames,
          isMessageVisible: fundingForm.showMessages,
          isCollectedAmountVisible: fundingForm.showAmount,
        },
        gifts,
      });

      let fundingId = extractFundingId(result);
      if (fundingId == null) {
        // 현재 개발 서버가 성공 응답에 fundingId를 누락하는 경우가 있어, POST를 재시도해 중복
        // 생성하지 않고 방금 생성된 내 펀딩을 목록에서 찾아 이어갑니다.
        const myFundings = await getMyFundings({ page: 0, size: 100 });
        const justCreated = [...myFundings.fundings]
          .filter((funding) => funding.fundingType === 'MY_GIFT' && funding.title === fundingForm.title)
          .sort((a, b) => {
            const createdAtDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return createdAtDiff || b.fundingId - a.fundingId;
          })[0];
        fundingId = justCreated?.fundingId ?? null;
      }
      if (fundingId == null) {
        throw new Error('펀딩 생성은 완료됐지만 생성된 페이지를 찾지 못했어요. 홈의 내 펀딩 목록에서 확인해 주세요.');
      }

      commitAsFunding(String(fundingId));
      setCreatedFundingId(fundingId);
      setStep(TOTAL_STEPS + 1);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : '선물 페이지 생성에 실패했어요.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleViewFunding = () => {
    if (createdFundingId != null) navigate(`/funding/${createdFundingId}`);
  };

  // 처음부터 비로그인으로 들어온 경우에만 로그인 화면으로 보냅니다. 작성 중 세션이 만료된 경우에는
  // 현재 폼을 지우지 않고 API 오류를 보여줘서 사용자가 입력 내용을 잃지 않도록 합니다.
  if (!wasLoggedInOnEntry.current) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      {!isComplete && (
        <>
          <Header
            title="내 선물 페이지 만들기"
            onBack={handleBack}
            right={
              <button type="button" onClick={handleExit} className="text-b2-m text-black">
                나가기
              </button>
            }
          />

          <div className="px-4 pt-5 pb-2">
            <StepIndicator currentStep={step} />
          </div>
        </>
      )}

      {/* 컨텐츠 */}
      <div className="flex-1 px-4 pb-6 flex flex-col overflow-hidden">
        {step === 1 && <Step1BasicInfo onNext={handleNext} />}
        {step === 2 && <Step2Wishlist onNext={handleNext} />}
        {step === 3 && <Step3Visibility onNext={handleNext} />}
        {step === 4 && <Step4Account onNext={handleNext} />}
        {step === 5 && <Step5Invite onNext={handleCreateFunding} submitLabel={isCreating ? '생성 중...' : '저장'} disabled={isCreating} />}
        {isComplete && createdFundingId != null && (
          <StepComplete fundingId={createdFundingId} onViewFunding={handleViewFunding} onGoHome={handleGoHome} />
        )}
      </div>

      <Toast open={Boolean(createError)} message={createError} standalone />

      {/* 임시저장 모달 - 페이지 레벨로 옮겨서 어느 단계에서든 "나가기"로 띄울 수 있음 */}
      <ConfirmModal
        open={showSaveModal}
        title="작성 중인 선물 페이지를 저장할까요?"
        description={'지금 나가면 현재까지 입력한 내용이 저장되고,\n다음에 다시 이어서 작성할 수 있어요'}
        cancelText="계속 작성하기"
        confirmText="저장하고 나가기"
        onCancel={() => setShowSaveModal(false)}
        onConfirm={() => {
          setShowSaveModal(false);
          handleGoHome();
        }}
      />
    </div>
  );
}
