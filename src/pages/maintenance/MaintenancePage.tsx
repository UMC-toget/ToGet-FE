import maintenanceCat from "../../assets/maintenance-cat.svg";

/**
 * 서비스 정비 안내 풀스크린 (피그마 '공지' 6528:14190).
 * 정비 기간(8/29~8/31) 동안 App에서 라우트 대신 이 화면을 렌더해 앱 전체를 대체한다.
 * 정비 종료 후 제거 예정인 임시 화면.
 */
export default function MaintenancePage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <div className="flex flex-col gap-2 pl-6 pr-3 pt-[56px]">
        <h1 className="text-h3-sb text-black">지금은 서비스 점검 중이에요</h1>
        <p className="text-b2-r leading-normal text-gray-600">
          더 안정적인 서비스 제공을 위해
          <br />
          8월 29일(토)부터 8월 31일(월)까지 서비스 이용이 제한됩니다.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <img src={maintenanceCat} alt="" className="relative z-10 w-[177px]" />
        <div className="-mt-2 bg-background px-6 py-4">
          <dl className="flex w-[232px] flex-col gap-2 text-b2-m">
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
      </div>
    </div>
  );
}
