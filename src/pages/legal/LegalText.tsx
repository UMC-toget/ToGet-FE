interface LegalTextProps {
  paragraphs: string[]
}

/** 약관/방침 본문 렌더러. '제N조'로 시작하는 문단은 소제목처럼 굵게 표시합니다. */
export default function LegalText({ paragraphs }: LegalTextProps) {
  return (
    <div className="flex flex-col gap-4 px-[18px] py-6">
      {paragraphs.map((paragraph, index) => {
        const isHeading = /^제\d+조/.test(paragraph)
        return (
          <p
            key={index}
            className={
              isHeading
                ? 'whitespace-pre-line text-b1-m font-semibold text-black'
                : 'whitespace-pre-line text-b2-r leading-normal text-gray-700'
            }
          >
            {paragraph}
          </p>
        )
      })}
    </div>
  )
}
