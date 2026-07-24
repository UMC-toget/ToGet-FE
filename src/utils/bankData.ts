export interface Bank {
  name: string;
  emoji: string;
  romanized: string;
}

export const BANKS: Bank[] = [
  { name: '신한은행', emoji: '🔵', romanized: 'shinhan' },
  { name: '국민은행', emoji: '🟡', romanized: 'kookmin kb' },
  { name: '우리은행', emoji: '🔵', romanized: 'woori' },
  { name: '하나은행', emoji: '🟢', romanized: 'hana' },
  { name: 'NH농협은행', emoji: '🟢', romanized: 'nonghyup nh' },
  { name: 'IBK기업은행', emoji: '🔵', romanized: 'ibk gieop' },
  { name: '카카오뱅크', emoji: '🟡', romanized: 'kakao' },
  { name: '토스뱅크', emoji: '🔵', romanized: 'toss' },
  { name: '케이뱅크', emoji: '🟣', romanized: 'kbank k bank' },
  { name: '새마을금고', emoji: '🟢', romanized: 'saemaul' },
  { name: '신협', emoji: '🟡', romanized: 'shinhyup' },
  { name: '우체국예금', emoji: '🔴', romanized: 'post office' },
  { name: '부산은행', emoji: '🔵', romanized: 'busan' },
  { name: '대구은행', emoji: '🔵', romanized: 'daegu' },
  { name: '경남은행', emoji: '🔵', romanized: 'gyeongnam' },
  { name: '광주은행', emoji: '🟢', romanized: 'gwangju' },
  { name: '전북은행', emoji: '🟢', romanized: 'jeonbuk' },
  { name: 'SC제일은행', emoji: '🟣', romanized: 'sc jeil standard chartered' },
  { name: '씨티은행', emoji: '🔵', romanized: 'citi' },
];

const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

export function getChosung(str: string): string {
  let result = '';
  for (const char of str) {
    const code = char.charCodeAt(0) - 0xac00;
    if (code >= 0 && code <= 11171) {
      result += CHOSUNG_LIST[Math.floor(code / 588)];
    } else {
      result += char;
    }
  }
  return result;
}

const isChosungOnly = (str: string) => /^[ㄱ-ㅎ\s]+$/.test(str);

/** 검색어와 은행명이 일치하는 부분이 있으면 [시작 인덱스, 길이] 반환, 없으면 null */
export function matchRange(bankName: string, query: string): [number, number] | null {
  if (!query) return null;
  const idx = bankName.indexOf(query);
  if (idx !== -1) return [idx, query.length];
  return null;
}

export function searchBanks(query: string): Bank[] {
  const q = query.trim();
  if (!q) return BANKS;
  const lowerQ = q.toLowerCase();
  const chosungQuery = isChosungOnly(q);

  return BANKS.filter((bank) => {
    if (bank.name.includes(q)) return true;
    if (chosungQuery && getChosung(bank.name).includes(q)) return true;
    if (bank.romanized.includes(lowerQ)) return true;
    return false;
  });
}