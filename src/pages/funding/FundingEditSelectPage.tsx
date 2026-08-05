import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFundingCreateStore, isStepDirty } from '../../store/fundingCreateStore';
import { getInvitationCard, getMyGiftDashboard } from '../../api/fundings';
import { BANK_NAME_LABELS } from '../../api/userAccounts';
import { fetchInvitationBackgrounds } from '../../api/metaApi';

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
  const { editFundingId, loadForEdit, commitAsFunding } = state;
  const [isLoading, setIsLoading] = useState(editFundingId !== id);
  const [loadError, setLoadError] = useState('');

  // 수정 세션을 처음 시작할 때 서버의 실제 펀딩/초대장 데이터를 폼 스토어에 채웁니다.
  // 단계 폼에서 돌아온 경우에는 사용자가 수정 중인 값을 유지하기 위해 다시 조회하지 않습니다.
  useEffect(() => {
    if (!id || editFundingId === id) {
      setIsLoading(false);
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setLoadError('');

    Promise.all([
      getMyGiftDashboard(id),
      getInvitationCard(id),
      fetchInvitationBackgrounds(),
    ])
      .then(([dashboard, invitation, backgrounds]) => {
        if (!isActive) return;
        const accountId = dashboard.userAccount ? String(dashboard.userAccount.userAccountId) : null;
        const background = backgrounds.find((item) => item.id === invitation.backgroundId);

        loadForEdit(id, {
          title: dashboard.title,
          anniversaryDate: dashboard.anniversaryDate,
          preparationStartDate: dashboard.startDate,
          preparationEndDate: dashboard.endDate,
          greeting: dashboard.introduction,
          thumbnailImage: dashboard.thumbnailImageUrl,
          wishlist: dashboard.gifts.map((gift) => ({
            id: String(gift.fundingGiftId),
            name: gift.giftName,
            price: gift.giftPrice,
            link: gift.giftPurchaseUrl ?? undefined,
            imageUrl: gift.giftImageUrl ?? undefined,
          })),
          showProgress: dashboard.visibility.showProgress,
          showAmount: dashboard.visibility.showAmount,
          showParticipantCount: dashboard.visibility.showParticipantCount,
          showParticipantNames: dashboard.visibility.showParticipantNames,
          showMessages: dashboard.visibility.showMessages,
          accounts: dashboard.userAccount ? [{
            id: accountId!,
            bankName: BANK_NAME_LABELS[dashboard.userAccount.bankName],
            accountNumber: dashboard.userAccount.account,
            accountHolder: dashboard.userAccount.accountOwner,
          }] : [],
          selectedAccountId: accountId,
          inviteTitle: invitation.title,
          inviteContent: invitation.content,
          inviteBackgroundId: invitation.backgroundId,
          inviteColor: background?.hexCode ?? '#FCE4F0',
          inviteCharacter: invitation.characterId,
        });
      })
      .catch((error) => {
        if (!isActive) return;
        console.error(error);
        setLoadError('선물 페이지 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id, editFundingId, loadForEdit]);

  const dirtySteps = new Set(STEPS.map((s) => s.step).filter((step) => isStepDirty(state, step)));
  const hasChanges = dirtySteps.size > 0;

  // 이 플로우는 개설자만 들어올 수 있으므로 상세 페이지로 돌아갈 때도 ?owner=1을 유지해야
  // 탭/수정하기 버튼이 있는 개설자 뷰가 계속 보입니다.
  const handleComplete = () => {
    if (id && hasChanges) commitAsFunding(id);
    navigate(
      `/funding/${id}?owner=1`,
      hasChanges ? { state: { toast: '선물 페이지가 수정 완료되었습니다', undo: true } } : undefined,
    );
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <div className="relative flex h-16 shrink-0 items-center justify-center border-b border-gray-100 px-6">
        <button
          onClick={() => navigate(`/funding/${id}?owner=1`)}
          className="absolute left-6 p-1 text-black transition-colors hover:text-gray-600"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-base font-semibold text-black">선물 페이지 수정하기</h1>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden px-6 pb-6 pt-7">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">수정하고 싶은 단계를 선택해 주세요</h2>
          <p className="text-xs text-gray-400 mt-1">해당 단계의 내용을 수정할 수 있어요</p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto">
          {isLoading && <p className="py-8 text-center text-sm text-gray-400">선물 페이지 정보를 불러오는 중이에요</p>}
          {loadError && <p className="py-8 text-center text-sm text-red-500">{loadError}</p>}
          {!isLoading && !loadError && (
          <>
          {STEPS.map(({ step, label, desc }) => (
            <button
              key={step}
              onClick={() => navigate(`/funding/${id}/edit/${step}`)}
              className="flex min-h-[88px] w-full items-center justify-between rounded-2xl border border-gray-200 px-4 py-4 text-left transition-colors hover:bg-gray-50"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  {dirtySteps.has(step) && (
                    <span className="rounded bg-pink-100/70 px-1.5 py-0.5 text-[10px] font-medium text-pink-500">
                      변경됨
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <ChevronRight size={24} strokeWidth={2} className="shrink-0 text-black" />
            </button>
          ))}
          </>
          )}
        </div>

        <button
          onClick={handleComplete}
          disabled={isLoading || Boolean(loadError)}
          className="mb-[50px] mt-5 w-full rounded-xl bg-gray-900 py-4 font-semibold text-white transition-colors hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
        >
          수정 완료
        </button>
      </div>
    </div>
  );
}
