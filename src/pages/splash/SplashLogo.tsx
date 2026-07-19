interface Stroke {
  /** path의 d 속성. ellipse 획(o)은 대신 ellipse를 사용합니다 */
  d?: string
  ellipse?: { cx: number; cy: number; rx: number; ry: number }
  /** 획이 그려지기 시작하는 시점 (ms) */
  delay: number
  /** 획을 다 그리는 데 걸리는 시간 (ms) */
  duration: number
}

// 피그마 손글씨 로고 소스(node 1950:68015)의 stroke 벡터를 그대로 사용합니다.
// 좌표/획 순서는 원본 스플래시 영상의 필기 순서(T 가로획 → 세로획 → o → G → e → t)와 동일합니다.
const STROKES: Stroke[] = [
  { d: 'M389.998 1662.77L540.608 1662.77', delay: 0, duration: 150 }, // T 가로획
  { d: 'M465.306 1661.02L465.306 1855.34', delay: 100, duration: 350 }, // T 세로획
  { ellipse: { cx: 582.043, cy: 1773.83, rx: 59.2569, ry: 70.9757 }, delay: 450, duration: 500 }, // o
  {
    d: 'M867.207 1718.45C855.557 1687.25 828.707 1665.42 797.446 1665.42C755.499 1665.42 721.495 1704.73 721.495 1753.22C721.495 1801.71 748.042 1838.91 789.857 1842.22C811.31 1843.92 833.875 1839.22 852.754 1819.27C856.609 1815.19 862.828 1806.09 866.308 1797.98C870.65 1787.87 869.697 1776.27 869.697 1769.58M869.697 1857.09V1769.58H797.446',
    delay: 1200,
    duration: 800,
  }, // G
  {
    d: 'M895.425 1781.54H920.83M920.83 1781.54H938.056C963.615 1782.47 1017.18 1775.1 1026.96 1738.2C1029.55 1725.05 1025.07 1699.64 986.396 1703.2C963.986 1707.09 919.497 1728.2 920.83 1781.54ZM920.83 1781.54C921.201 1796.17 931.165 1826.44 968.06 1830.44C987.323 1833.03 1027.85 1828.22 1035.85 1788.21',
    delay: 2200,
    duration: 550,
  }, // e
  {
    d: 'M1052.63 1770.36H1091.79M1157.99 1770.36H1091.79M1091.79 1770.36C1092.36 1782.31 1099.96 1810.18 1110.89 1824.32C1121.07 1837.47 1133.63 1840.41 1140.73 1841.28C1165.78 1844.35 1188.78 1830.74 1198.43 1799.06C1198.43 1799.06 1202.44 1783.64 1202.44 1773.05M1091.79 1770.36C1081.43 1734.92 1070.58 1661.57 1110.07 1651.7C1122.96 1648.93 1146.09 1655.64 1135.46 1704.63C1130.56 1724.4 1114.96 1765.22 1091.79 1770.36Z',
    delay: 2800,
    duration: 650,
  }, // t
]

/** 스플래시 화면의 "To Get" 손글씨 드로잉 로고. 각 획이 실제 필기 순서대로 하나씩 그려집니다. */
export default function SplashLogo() {
  return (
    <svg viewBox="360 1619 873 269" className="w-[220px] text-black" fill="none" xmlns="http://www.w3.org/2000/svg">
      {STROKES.map((stroke, i) => {
        const style = {
          strokeDasharray: 1,
          strokeDashoffset: 1,
          animation: `splash-stroke-draw ${stroke.duration}ms ease-out ${stroke.delay}ms forwards`,
        }
        return stroke.ellipse ? (
          <ellipse
            key={i}
            cx={stroke.ellipse.cx}
            cy={stroke.ellipse.cy}
            rx={stroke.ellipse.rx}
            ry={stroke.ellipse.ry}
            pathLength={1}
            stroke="currentColor"
            strokeWidth={31.11}
            style={style}
          />
        ) : (
          <path
            key={i}
            d={stroke.d}
            pathLength={1}
            stroke="currentColor"
            strokeWidth={31.11}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={style}
          />
        )
      })}
    </svg>
  )
}
