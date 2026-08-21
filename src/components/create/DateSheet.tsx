import { useState } from "react";
import { RotateCw, ChevronLeft, ChevronRight } from "lucide-react";

interface DateSheetSingleProps {
  mode: "single";
  initialDate?: string;
  onClose: () => void;
  onConfirm: (date: string) => void;
}
interface DateSheetRangeProps {
  mode: "range";
  initialStart?: string;
  initialEnd?: string;
  onClose: () => void;
  onConfirm: (start: string, end: string) => void;
}
type DateSheetProps = DateSheetSingleProps | DateSheetRangeProps;

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (y: number, m: number, d: number) =>
  `${y}-${pad(m + 1)}-${pad(d)}`;
const parseKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return { y, m: m - 1, d };
};

/** 'YYYY-MM-DD' → '2026년 07월 05일' */
export function formatDisplay(key: string): string {
  const { y, m, d } = parseKey(key);
  return `${y}년 ${pad(m + 1)}월 ${pad(d)}일`;
}

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function DateSheet(props: DateSheetProps) {
  const today = new Date();
  const initialViewDate =
    props.mode === "single" ? props.initialDate : props.initialStart;
  const initialView = initialViewDate ? parseKey(initialViewDate) : undefined;
  const [viewYear, setViewYear] = useState(
    initialView?.y ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    initialView?.m ?? today.getMonth(),
  );

  const [single, setSingle] = useState<string | undefined>(
    props.mode === "single" ? props.initialDate : undefined,
  );
  const [rangeStart, setRangeStart] = useState<string | undefined>(
    props.mode === "range" ? props.initialStart : undefined,
  );
  const [rangeEnd, setRangeEnd] = useState<string | undefined>(
    props.mode === "range" ? props.initialEnd : undefined,
  );

  const cells = buildMonthGrid(viewYear, viewMonth);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handlePick = (day: number) => {
    const key = toKey(viewYear, viewMonth, day);
    if (props.mode === "single") {
      setSingle(key);
      return;
    }
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(key);
      setRangeEnd(undefined);
    } else if (key < rangeStart) {
      setRangeStart(key);
    } else {
      setRangeEnd(key);
    }
  };

  const handleReset = () => {
    if (props.mode === "single") {
      setSingle(undefined);
    } else {
      setRangeStart(undefined);
      setRangeEnd(undefined);
    }
  };

  const isSelected = (day: number) => {
    const key = toKey(viewYear, viewMonth, day);
    if (props.mode === "single") return key === single;
    return key === rangeStart || key === rangeEnd;
  };
  const todayKey = toKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const isToday = (day: number) => toKey(viewYear, viewMonth, day) === todayKey;
  const isPast = (day: number) => toKey(viewYear, viewMonth, day) < todayKey;
  const isRangeStart = (day: number) =>
    props.mode === "range" && toKey(viewYear, viewMonth, day) === rangeStart;
  const isRangeEnd = (day: number) =>
    props.mode === "range" && toKey(viewYear, viewMonth, day) === rangeEnd;
  const isInRange = (day: number) => {
    if (props.mode !== "range" || !rangeStart || !rangeEnd) return false;
    const key = toKey(viewYear, viewMonth, day);
    return key > rangeStart && key < rangeEnd;
  };

  const canConfirm =
    props.mode === "single" ? Boolean(single) : Boolean(rangeStart && rangeEnd);
  const canReset =
    props.mode === "single" ? Boolean(single) : Boolean(rangeStart || rangeEnd);

  const handleConfirm = () => {
    if (props.mode === "single" && single) {
      props.onConfirm(single);
    } else if (props.mode === "range" && rangeStart && rangeEnd) {
      props.onConfirm(rangeStart, rangeEnd);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end z-50"
      onClick={props.onClose}
    >
      <div
        className="bg-white w-full max-w-sm mx-auto rounded-t-2xl px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+24px)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
        <p className="text-lg font-semibold text-black mb-3">
          {props.mode === "single" ? "기념일 날짜" : "선물 준비 기간"}
        </p>

        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-medium text-black">
            {viewYear}년 {pad(viewMonth + 1)}월
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="이전 달"
              className="flex size-5 items-center justify-center text-black"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={goNextMonth}
              aria-label="다음 달"
              className="flex size-5 items-center justify-center text-black"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-[10px] text-black mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
        <div className="flex flex-col gap-y-1 mb-3">
          {Array.from({ length: cells.length / 7 }, (_, weekIdx) =>
            cells.slice(weekIdx * 7, weekIdx * 7 + 7),
          ).map((week, weekIdx) => {
            // 피그마 시안 기준: 핑크 바는 둥근 캡 없는 사각형이고, 시작/마감 칸의 "중앙"에서 끊겨
            // 원형 버튼의 뒤쪽 절반과 자연스럽게 겹치도록 만든다 (칸 가장자리에 캡을 씌우지 않음)
            const startColIdx = week.findIndex((day) => day && isRangeStart(day));
            const endColIdx = week.findIndex((day) => day && isRangeEnd(day));
            const hasBar = week.some(
              (day) => day && (isRangeStart(day) || isRangeEnd(day) || isInRange(day)),
            );
            const leftPct = startColIdx >= 0 ? (startColIdx + 0.5) * (100 / 7) : 0;
            const rightPct = endColIdx >= 0 ? 100 - (endColIdx + 0.5) * (100 / 7) : 0;

            return (
              <div key={weekIdx} className="relative grid grid-cols-7">
                {hasBar && (
                  <div
                    className="absolute top-0 h-10 bg-pink-100"
                    style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
                  />
                )}
                {week.map((day, colIdx) => {
                  if (!day) return <div key={colIdx} className="h-11" />;

                  const start = isRangeStart(day);
                  const end = isRangeEnd(day);
                  const inRange = isInRange(day);

                  return (
                    <div key={colIdx} className="relative flex items-center justify-center h-10">
                      {isToday(day) && !isSelected(day) && (
                        <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-pink-500" />
                      )}
                      <button
                        type="button"
                        onClick={() => handlePick(day)}
                        disabled={isPast(day)}
                        className={`relative rounded-full text-xs flex items-center justify-center transition-colors
                          ${
                            isPast(day)
                              ? "text-gray-300 cursor-not-allowed"
                              : isSelected(day)
                                ? "w-10 h-10 bg-pink-500 text-white font-semibold flex-col leading-tight"
                                : inRange
                                  ? "w-8 h-8 text-gray-600"
                                  : "w-8 h-8 text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        <span>{pad(day)}</span>
                        {isSelected(day) && (
                          <span className="text-[9px] font-medium leading-none mt-0.5">
                            {start ? "시작" : end ? "마감" : "선택"}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {props.mode === "single" && (
          <div className="-mx-4 mb-4 flex items-center justify-between bg-background px-4 py-4 text-sm">
            <span className="text-gray-700">날짜</span>
            <span className="font-medium text-black">
              {single ? formatDisplay(single) : ""}
            </span>
          </div>
        )}

        {props.mode === "range" && (
          <div className="-mx-4 mb-4 flex flex-col gap-3 bg-background px-4 py-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">시작일</span>
              <span className="font-medium text-black">
                {rangeStart ? formatDisplay(rangeStart) : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">마감일</span>
              <span className="font-medium text-black">
                {rangeEnd ? formatDisplay(rangeEnd) : ""}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={handleReset}
            disabled={!canReset}
            aria-label="초기화"
            className="size-[52px] shrink-0 rounded-xl border border-black text-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCw size={20} />
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 h-[52px] rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {props.mode === "single" ? "날짜 저장" : "기간 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
