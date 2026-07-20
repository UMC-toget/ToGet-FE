/**
 * `.animate-shake` 애니메이션(index.css)을 처음부터 다시 재생합니다.
 * 이미 재생 중이어도(연속 입력 시도 등) 매번 새로 흔들리도록 클래스를 지웠다가 강제 리플로우 후 다시 붙입니다.
 */
export function replayShake(el: HTMLElement | null) {
  if (!el) return
  el.classList.remove('animate-shake')
  void el.offsetWidth
  el.classList.add('animate-shake')
}
