/**
 * 서비스 정비 일정 (KST 기준)
 * - 정상 이용: ~8/28 자정 (= 8/29 00:00 전)
 * - 이용 제한(정비): 8/29 00:00 ~ 8/31 자정 (= 9/1 00:00 전)
 */
const MAINTENANCE_START = new Date("2026-08-29T00:00:00+09:00");
const MAINTENANCE_END = new Date("2026-09-01T00:00:00+09:00");
const STORAGE_KEY = "toget_service_notice_20260829_dismissed";

/** 지금이 정비 기간(8/29~8/31)인지. 이 기간엔 앱 전체를 정비 안내 화면으로 대체한다. */
export function isMaintenanceActive(): boolean {
  const now = Date.now();
  return now >= MAINTENANCE_START.getTime() && now < MAINTENANCE_END.getTime();
}

/** 정비 시작 전(정상 기간)이고 아직 확인하지 않았으면 홈 안내 팝업을 띄운다. */
export function shouldShowServiceNotice(): boolean {
  if (Date.now() >= MAINTENANCE_START.getTime()) return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== "true";
  } catch {
    return true;
  }
}

/** '확인했어요' 처리 — 같은 브라우저에서 팝업이 다시 뜨지 않도록 기록. */
export function dismissServiceNotice(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // 저장 실패(프라이빗 모드 등)해도 무시
  }
}
