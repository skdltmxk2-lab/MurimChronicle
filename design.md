# Design: 루트편입 CBT

Hallmark의 여러 화면이 공유하는 시스템이다. 새로운 화면도 이 기준을 읽고, 변경은 명시적으로 기록한다.

## System
- Genre: modern-minimal.
- 첫 페이지: Feature Stack, Settled hero. 학습·응시 화면은 app screen.
- Theme: Terrazzo, 라이트 off-white와 다크 black 계열의 같은 시스템.
- Axes: light / geometric-sans / warm. Rust는 선택·상태·포커스에 한정한다.
- Signature: 실제 수학 문제지와 학습 화면. 가짜 제품 UI나 임의의 성과 수치를 만들지 않는다.

## Tokens
`app/tokens.css`가 유일한 값의 기준이다. 아래는 역할별 핵심 값이다.
```css
:root {
  --color-paper: oklch(96% 0.009 82); --color-plate: oklch(99.5% 0.003 82);
  --color-paper-2: oklch(92% 0.012 82); --color-paper-3: oklch(87.5% 0.014 80);
  --color-ink: oklch(16% 0.006 60); --color-muted: oklch(46% 0.01 60);
  --color-accent: oklch(53% 0.15 38); --color-focus: oklch(50% 0.16 38);
  --font-display: "Syne", "Pretendard Variable", sans-serif;
  --font-body: "Onest", "Pretendard Variable", sans-serif;
  --font-outlier: "JetBrains Mono", ui-monospace, monospace;
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --rule-bar: 2px;
  --shadow-card: 8px 8px 0 var(--color-paper-3);
}
```
간격·글자 크기·레이어·완급·시간도 같은 파일의 토큰을 쓴다. 수식은 기존 KaTeX 경로를 유지한다.

## Modes
- 라이트: 따뜻한 종이, 밝은 specimen 표면, 잉크색 2px 경계와 번짐 없는 offset.
- 다크: `.dark`와 기존 `cbt:theme` 선택을 사용한다. paper L14%, plate L21%, elevated L26%.
- 다크 글자는 ink L95%, muted L74%; rust는 L75%로 조정한다. 색상 계열은 유지한다.
- 다크에서는 offset을 없애고 밝기 단계와 inset 경계로 표면을 구분한다.
- 입력 경계는 `--color-control-line`; 일반 구분선·강한 경계·포커스를 서로 대체하지 않는다.

## Controls and motion
- Primary: ink 채움과 paper 글자. Secondary: 투명한 바탕과 잉크색 윤곽. 모두 각진 형태다.
- 주요 행동은 44px 이상의 터치 영역과 즉시 보이는 focus-visible을 제공한다.
- 숫자·시간·수량은 tabular figures; Mono는 코드와 측정값에만 쓴다.
- 화면은 정적이다. 상태 피드백만 짧게 바꾸고 reduced-motion에서는 즉시 끝낸다.

## Exports
- 값: `app/tokens.css`; 자체 호스팅 글꼴: `app/fonts.css`, `public/fonts/`.
- 기본 규칙·연결: `app/base.css`, `app/globals.css`; 화면: `app/terrazzo-{shell,landing,study,exam}.css`.
- 실제 제품 캡처: `public/hallmark/study-{light,dark}.png`. 인쇄·수식의 legacy 토큰은 별도로 보존한다.
