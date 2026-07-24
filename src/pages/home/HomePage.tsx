import { useState } from "react";
import BottomNav from "../../components/common/BottomNav";
import Toast from "../../components/common/Toast";
import HomeBanner from "./HomeBanner";
import GiftBrowseSection from "./GiftBrowseSection";
import MyFundingsSection from "./MyFundingsSection";
import WishCreateSheet from "../gift-create/WishCreateSheet";
import togetLogo from "../../assets/toget-logo.svg";
import GiftCreateSheet from "../gift-create/GiftCreateSheet";
import { useAuth } from "../../hooks/useAuth";
import { useMyFundings } from "./useMyFundings";
import type { MyFundingSummary } from "../../types/funding";

const TOAST_DURATION_MS = 2500;

/** 홈 페이지 (B01: 비로그인 / B02: 로그인 — 진행 중인 내 선물 없음/1개/여러 개 상태를 모두 다룸) */
export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const myFundings = useMyFundings();
  const [wishSheetOpen, setWishSheetOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleShareInvite = async (funding: MyFundingSummary) => {
    // TODO: 초대장 링크는 BE 연동 후 실제 응답 값으로 교체
    const inviteUrl = `${window.location.origin}/funding/${funding.id}/invitation`;
    try {
      if (navigator.share) {
        await navigator.share({ title: funding.title, url: inviteUrl });
        return;
      }
      await navigator.clipboard.writeText(inviteUrl);
      setToastMessage("초대장 링크가 복사되었어요");
      setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
    } catch {
      // 사용자가 공유 시트를 취소한 경우 등 - 조용히 무시
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-32">
      <header className="flex h-[50px] shrink-0 items-center px-[18px]">
        <img src={togetLogo} alt="To Get" className="h-6" />
      </header>

      <div className="mt-6 flex flex-col gap-9 px-[18px]">
        <HomeBanner isLoggedIn={isLoggedIn} onCreateClick={() => setCreateSheetOpen(true)} />
        <div className="flex flex-col gap-8">
          {isLoggedIn && (
            <MyFundingsSection fundings={myFundings} onShareInvite={handleShareInvite} />
          )}
          <GiftBrowseSection />
        </div>
      </div>

      <BottomNav active="home" onFabClick={() => setWishSheetOpen(true)} />
      <WishCreateSheet
        open={wishSheetOpen}
        onClose={() => setWishSheetOpen(false)}
      />
      <GiftCreateSheet
        open={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
      />
      <Toast open={toastMessage !== null} message={toastMessage ?? ""} />
    </div>
  );
}
