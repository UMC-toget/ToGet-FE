import { useState } from 'react';

interface DateSheetSingleProps {
  mode: 'single';
  initialDate?: string;
  onClose: () => void;
  onConfirm: (date: string) => void;
}
interface DateSheetRangeProps {
  mode: 'range';
  initialStart?: string;
  initialEnd?: string;
  onClose: () => void;
  onConfirm: (start: string, end: string) => void;
}
type DateSheetProps = DateSheetSingleProps | DateSheetRangeProps;

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const pad = (n: number) => String(n).padStart(2, '0');
const toKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parseKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
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
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [single, setSingle] = useState<string | undefined>(
    props.mode === 'single' ? props.initialDate : undefined
  );
  const [rangeStart, setRangeStart] = useState<string | undefined>(
    props.mode === 'range' ? props.initialStart : undefined
  );
  const [rangeEnd, setRangeEnd] = useState<string | undefined>(
    props.mode === 'range' ? props.initialEnd : undefined
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
    if (props.mode === 'single') {
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

  const isSelected = (day: number) => {
    const key = toKey(viewYear, viewMonth, day);
    if (props.mode === 'single') return key === single;
    return key === rangeStart || key === rangeEnd;
  };
  const isInRange = (day: number) => {
    if (props.mode !== 'range' || !rangeStart || !rangeEnd) return false;
    const key = toKey(viewYear, viewMonth, day);
    return key > rangeStart && key < rangeEnd;
  };

  const canConfirm = props.mode === 'single' ? Boolean(single) : Boolean(rangeStart && rangeEnd);

  const handleConfirm = () => {
    if (props.mode === 'single' && single) {
      props.onConfirm(single);
    } else if (props.mode === 'range' && rangeStart && rangeEnd) {
      props.onConfirm(rangeStart, rangeEnd);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={props.onClose}>
      <div
        className="bg-white w-full max-w-sm mx-auto rounded-t-2xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-700 mb-3">
          {props.mode === 'single' ? '선물 필요 날짜' : '선물 준비 기간'}
        </p>

        <div className="flex items-center justify-between mb-3">
          <button onClick={goPrevMonth} aria-label="이전 달" className="text-gray-400 px-2 text-lg">
            ‹
          </button>
          <p className="text-sm font-semibold text-gray-800">
            {viewYear}년 {pad(viewMonth + 1)}월
          </p>
          <button onClick={goNextMonth} aria-label="다음 달" className="text-gray-400 px-2 text-lg">
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-[11px] text-gray-400 mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 mb-3">
          {cells.map((day, idx) => (
            <div key={idx} className="flex items-center justify-center h-9">
              {day && (
                <button
                  onClick={() => handlePick(day)}
                  className={`w-8 h-8 rounded-full text-xs flex items-center justify-center transition-colors
                    ${
                      isSelected(day)
                        ? 'bg-pink-400 text-white font-semibold'
                        : isInRange(day)
                        ? 'bg-pink-50 text-gray-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {day}
                </button>
              )}
            </div>
          ))}
        </div>

        {props.mode === 'range' && (
          <div className="border-t border-gray-100 pt-3 mb-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">시작일</span>
              <span className="text-gray-700">{rangeStart ? formatDisplay(rangeStart) : '-'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">마감일</span>
              <span className="text-gray-700">{rangeEnd ? formatDisplay(rangeEnd) : '-'}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {props.mode === 'single' ? '날짜 저장' : '기간 저장'}
        </button>
      </div>
    </div>
  );
}