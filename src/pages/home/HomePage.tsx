import { useState } from "react";
import BottomNav from "../../components/common/BottomNav";
import Toast from "../../components/common/Toast";
import HomeBanner from "./HomeBanner";
import GiftBrowseSection from "./GiftBrowseSection";
import HomeFooter from "./HomeFooter";
import MyFundingsSection from "./MyFundingsSection";
import togetLogo from "../../assets/toget-logo.svg";
import GiftCreateSheet from "../gift-create/GiftCreateSheet";
import { useAuth } from "../../hooks/useAuth";
import { useMyFundings } from "./useMyFundings";
import type { MyFundingSummary } from "../../types/funding";
import { trackEvent } from "../../lib/analytics";

const TOAST_DURATION_MS = 2000;

/** 홈 페이지 (B01: 비로그인 / B02: 로그인 — 진행 중인 내 선물 없음/1개/여러 개 상태를 모두 다룸) */
export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const myFundings = useMyFundings();
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleShareInvite = async (funding: MyFundingSummary) => {
    const invitePath = funding.fundingType === 'TOGETHER_GIFT'
      ? `/group/${funding.id}`
      : `/funding/${funding.id}/invitation`;
    const inviteUrl = `${window.location.origin}${invitePath}`;
    const fundingTypeParam = funding.fundingType === 'TOGETHER_GIFT' ? 'together' : 'my';
    try {
      if (navigator.share) {
        await navigator.share({ title: funding.title, url: inviteUrl });
        trackEvent('invitation_share', { method: 'share', funding_type: fundingTypeParam });
        return;
      }
      await navigator.clipboard.writeText(inviteUrl);
      trackEvent('invitation_share', { method: 'copy', funding_type: fundingTypeParam });
      setToastMessage("초대장 링크가 복사되었어요");
      setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
    } catch {
      // 사용자가 공유 시트를 취소한 경우 등 - 조용히 무시
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <header className="sticky top-0 z-20 flex h-[50px] shrink-0 items-center bg-white px-[18px]">
        {/* 로고는 이미지라 실제 텍스트가 없어 구글 OAuth 브랜딩 심사가 "홈페이지 앱 이름 불일치"로
            잘못 판단했습니다. 시각 디자인은 유지하고 스크린리더/크롤러가 읽을 수 있는 실제 텍스트를 추가합니다. */}
        <h1>
          <img src={togetLogo} alt="" className="h-6" />
          <span className="sr-only">To Get</span>
        </h1>
      </header>

      {/* 로그인이어도 진행 중인 선물이 없으면 MyFundingsSection이 렌더링되지 않아 배너 바로
          뒤에 GiftBrowseSection이 오는 비로그인과 동일한 레이아웃이 되므로, gap도 그 경우엔
          비로그인과 같은 값을 써야 시각적으로 맞습니다. */}
      <div className={`mt-6 flex flex-col px-[18px] ${isLoggedIn && myFundings.length > 0 ? 'gap-10' : 'gap-4'}`}>
        <HomeBanner isLoggedIn={isLoggedIn} onCreateClick={() => setCreateSheetOpen(true)} />
        <div className="flex flex-col gap-3">
          {isLoggedIn && (
            <MyFundingsSection fundings={myFundings} onShareInvite={handleShareInvite} />
          )}
          <GiftBrowseSection />
        </div>
      </div>

      <HomeFooter />

      <BottomNav active="home" />
      <GiftCreateSheet
        open={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
      />
      <Toast open={toastMessage !== null} message={toastMessage ?? ""} />
    </div>
  );
}
