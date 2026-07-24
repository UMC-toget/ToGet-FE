export type ReviewWriteType = 'gift' | 'news' | 'message'

interface ReviewWriteTypeConfig {
  key: ReviewWriteType
  /** 상단 헤더 타이틀 */
  headerTitle: string
  /** 안내 문구 제목 */
  guideTitle: string
  /** 안내 문구 설명 */
  guideDescription: string
  /** 제목 입력 라벨 */
  titleLabel: string
  /** 제목 입력 placeholder */
  titlePlaceholder: string
  /** 내용 입력 라벨 */
  contentLabel: string
  /** 내용 입력 placeholder */
  contentPlaceholder: string
  /** 편지지 미리보기에 from. 표기를 노출할지 여부 (마음 전하기는 노출 안 함) */
  showFrom: boolean
  /** 작성 완료 후 이동 경로 (이미지 등록·캐릭터 선택·완료 화면은 별도 이슈라 임시 경로) */
  completePath: string
}

/**
 * J파트 작성물 3종 유형 상수 (피그마 "초기 디자인" 페이지 기준)
 * - gift: J01) 후기: 작성 (#1930:13637)
 * - news: J03) 전달완료 : 소식남기기 (#1930:13512)
 * - message: J02) 마음전하기: 마음전하기 작성 (#1930:14051)
 */
export const REVIEW_WRITE_TYPES: Record<ReviewWriteType, ReviewWriteTypeConfig> = {
  gift: {
    key: 'gift',
    headerTitle: '후기 남기기',
    guideTitle: '선물 후기 남기기',
    guideDescription: '투겟을 통해 선물을 받고, 선물을 전달한 후기를 남겨보세요.',
    titleLabel: '받는 사람',
    titlePlaceholder: '받는사람을 입력해 주세요',
    contentLabel: '후기 내용',
    contentPlaceholder: '후기 내용을 입력해 주세요',
    showFrom: true,
    completePath: '/gift/review/complete/gift',
  },
  news: {
    key: 'news',
    headerTitle: '전달완료 소식남기기',
    guideTitle: '전달완료 소식남기기',
    guideDescription: '함께 준비한 선물에 대한, 전달 완료 소식을 보내보세요.',
    titleLabel: '후기 제목',
    titlePlaceholder: '후기 제목을 입력해 주세요',
    contentLabel: '후기 내용',
    contentPlaceholder: '후기 내용을 입력해 주세요',
    showFrom: true,
    completePath: '/gift/review/complete/news',
  },
  message: {
    key: 'message',
    headerTitle: '마음 전하기',
    guideTitle: '선물과 함께 마음전하기',
    guideDescription: '친구들과 함께 준비한 과정과 마음을 선물을 받을 친구에게 전달하세요.',
    titleLabel: '마음전하기 제목',
    titlePlaceholder: '후기 제목을 입력해 주세요',
    contentLabel: '마음전하기 내용',
    contentPlaceholder: '후기 내용을 입력해 주세요',
    showFrom: false,
    completePath: '/gift/review/complete/message',
  },
}

/** 제목 글자수 제한 */
export const REVIEW_TITLE_MAX_LENGTH = 20
/** 내용 글자수 제한 */
export const REVIEW_CONTENT_MAX_LENGTH = 60

interface ReviewCompleteTypeConfig {
  key: ReviewWriteType
  /** 완료 문구 제목 */
  completeTitle: string
  /** 완료 문구 설명 */
  completeDescription: string
  /** 링크 박스 라벨 */
  linkLabel: string
  /** 공유하기 버튼 라벨 */
  shareLabel: string
  /** 미리보기 버튼 라벨 */
  previewLabel: string
}

/**
 * J파트 작성물 3종 완료 화면 문구 (피그마 "초기 디자인" 페이지 기준)
 * - gift: 후기: 완료 (#754:7522)
 * - news: J03-1) 전달완료 : 초대장 만들기 (#1933:103464)
 * - message: J02-1) 마음전하기:초대장 링크 (#1933:103650)
 */
export const REVIEW_COMPLETE_TYPES: Record<ReviewWriteType, ReviewCompleteTypeConfig> = {
  gift: {
    key: 'gift',
    completeTitle: '선물 후기가 만들어졌어요!',
    completeDescription: '함께해 준 사람들에게 선물 도착 소식을 전해보세요.',
    linkLabel: '후기 링크',
    shareLabel: '후기 공유',
    previewLabel: '후기 미리보기',
  },
  news: {
    key: 'news',
    completeTitle: '전달 소식 전하기가 완료되었어요!',
    completeDescription: '함께해 준 친구들에게 선물 도착 소식을 전해보세요.',
    // 피그마 원본 링크 박스 라벨이 message와 동일하게 "초대장"으로 되어 있어 그대로 따름
    linkLabel: '초대장 링크',
    shareLabel: '초대장 공유',
    previewLabel: '초대장 미리보기',
  },
  message: {
    key: 'message',
    completeTitle: '마음전하기 초대장이 완료되었어요!',
    completeDescription: '선물과 함께 모두가 모은 마음을 함께 전달하세요.',
    linkLabel: '초대장 링크',
    shareLabel: '초대장 공유',
    previewLabel: '초대장 미리보기',
  },
}
