/** #RRGGBB 형식의 hex 컬러 문자열 */
type HexColor = string

function hexToRgb(hex: HexColor): [number, number, number] {
  const clean = hex.replace('#', '')
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)]
}

function rgbToHex([r, g, b]: [number, number, number]): HexColor {
  const clamp = (n: number) => Math.min(255, Math.max(0, Math.round(n)))
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * base 색을 background 위에 opacity(0~1)로 얹었을 때 실제로 눈에 보이는 합성 색을 계산합니다.
 * (알파 합성: result = background * (1 - opacity) + base * opacity)
 */
export function blendColor(base: HexColor, opacity: number, background: HexColor = '#FFFFFF'): HexColor {
  const [br, bg, bb] = hexToRgb(base)
  const [wr, wg, wb] = hexToRgb(background)
  return rgbToHex([
    wr * (1 - opacity) + br * opacity,
    wg * (1 - opacity) + bg * opacity,
    wb * (1 - opacity) + bb * opacity,
  ])
}

/**
 * background 위에 opacity(0~1)로 합성되어 이미 만들어진 결과색(blended)에서 원래의 진한 base 색을 역산합니다.
 * blendColor의 역함수입니다. 예: unblendColor('#FFB8D2', 0.5) -> '#FF71A5'
 */
export function unblendColor(blended: HexColor, opacity: number, background: HexColor = '#FFFFFF'): HexColor {
  const [rr, rg, rb] = hexToRgb(blended)
  const [wr, wg, wb] = hexToRgb(background)
  return rgbToHex([
    (rr - wr * (1 - opacity)) / opacity,
    (rg - wg * (1 - opacity)) / opacity,
    (rb - wb * (1 - opacity)) / opacity,
  ])
}
