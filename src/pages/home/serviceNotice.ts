/** 정상 이용 마감(8/28 자정) = 8/29 00:00 KST. 이 시점 이후로는 팝업을 띄우지 않는다. */
const NOTICE_DEADLINE = new Date("2026-08-29T00:00:00+09:00");
const STORAGE_KEY = "toget_service_notice_20260829_dismissed";

/** 정비 기간 안내 팝업을 지금 띄워야 하는지 판단. 마감 이후이거나 이미 확인했으면 false. */
export function shouldShowServiceNotice(): boolean {
  if (Date.now() >= NOTICE_DEADLINE.getTime()) return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== "true";
  } catch {
    return true;
  }
}

/** '확인했어요' 처리 — 같은 브라우저에서 다시 뜨지 않도록 기록. */
export function dismissServiceNotice(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // 저장 실패(프라이빗 모드 등)해도 무시
  }
}
