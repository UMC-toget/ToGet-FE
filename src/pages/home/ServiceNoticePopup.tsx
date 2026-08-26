import alertIcon from "../../assets/icon-alert-pink.svg";
import { dismissServiceNotice } from "./serviceNotice";

interface ServiceNoticePopupProps {
  open: boolean;
  /** '확인했어요' 클릭 시 호출 (다시 안 뜨게 저장은 컴포넌트가 처리) */
  onConfirm: () => void;
}

/**
 * 서비스 정비 기간 안내 팝업 (피그마 '공지' 6528:55326).
 * 8/29~8/31 이용 제한을 홈에서 사전 공지한다. 확인하면 다시 뜨지 않고,
 * 정비 종료 후 HomePage 연결과 함께 제거 예정인 임시 컴포넌트.
 */
export default function ServiceNoticePopup({ open, onConfirm }: ServiceNoticePopupProps) {
  if (!open) return null;

  const handleConfirm = () => {
    dismissServiceNotice();
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-[18px]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      <div className="relative flex w-[320px] flex-col items-center gap-5 rounded-[20px] bg-white px-6 py-7">
        <div className="flex w-full flex-col items-center gap-[5px]">
          <div className="flex flex-col items-center gap-5">
            <img src={alertIcon} alt="" aria-hidden className="size-12" />
            <p className="text-h3-sb text-black">서비스 이용 안내</p>
          </div>
          <div className="flex flex-col items-center gap-5">
            <p className="text-center text-b2-r leading-normal text-gray-600">
              더 안정적인 서비스 제공을 위해
              <br />
              투겟을 잠시 정비할 예정이에요
            </p>
            <div className="flex flex-col items-center gap-4">
              <div className="w-[272px] bg-background px-5 py-[13px]">
                <dl className="flex flex-col gap-2 text-b2-m">
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-600">정상 이용:</dt>
                    <dd className="text-gray-900">8/28(금) 자정까지</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-600">이용 제한:</dt>
                    <dd className="text-gray-900">8/29(토)~8/31(월)</dd>
                  </div>
                </dl>
              </div>
              <p className="py-[3px] text-center text-b2-m text-gray-900">이용에 참고 부탁드려요!</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex h-[42px] w-[272px] items-center justify-center rounded-lg bg-gray-900 text-b2-m font-semibold text-white"
        >
          확인했어요
        </button>
      </div>
    </div>
  );
}
