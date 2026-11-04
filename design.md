# Design: 루트편입 CBT

관리자가 선택한 Hallmark 디자인을 사이트 전체에서 공유한다. 라이트·다크는 각 사용자가 유지한다.

## Registered systems
- Coral (`coral`, 기본 추천): 따뜻한 면지, 넓은 2열 구성, 눌린 카드형 컨트롤. General Sans 400/500/600, Geist Mono 측정값, 한글 Pretendard.
- Console (`console`): 그래파이트 작업 면, 얇은 공유 구획, 큰 선두 도구와 촘촘한 기록. Host Grotesk 400/500, Atkinson Hyperlegible Mono 측정값, 한글 Pretendard.
- Terrazzo (`terrazzo`): 종이와 굵은 잉크 테두리, 각진 컨트롤과 offset. Syne 700, Onest 400/500, JetBrains Mono 측정값, 한글 Pretendard.
- 실제 카탈로그에서 파생한 세 시스템 모두 라이트·다크를 제공하며 글꼴·재질·모서리·간격·배치가 함께 바뀐다.
- 장식용 카드별 색 분류와 컬러 상단선은 사용하지 않는다. 상태·선택·포커스는 각 시스템의 역할색을 따른다.

## Source of truth
- `app/tokens.css`: Terrazzo 기본 토큰과 기존 수식·인쇄용 legacy 값.
- `app/design-presets.css`: `html[data-design]`별 Coral·Console 토큰과 화면 구획, 각 `.dark` 파생.
- 역할: paper/plate/elevated, ink/ink-2/muted, rule/rule-strong/control-line, primary/on-primary, accent/accent-2, positive/negative.
- Coral의 밝은 accent는 큰 상태 표식용이다. 작은 글자는 `--color-accent-2`를 쓴다.
- 색·글꼴 값은 토큰에서 가져온다. 숫자는 tabular figures, Mono는 수량·시간·코드에 한정한다.

## Selection and preview
- `/admin/appearance`에서 관리자만 변경한다. 서버 설정은 `app_settings.site_design`, 허용 ID는 위 세 개뿐이다.
- 선택은 자동 저장하지 않는다. 미리보기는 현재 브라우저의 React 상태이며, 명시적인 전체 적용만 서버에 저장한다.
- 미리보기는 페이지 이동에도 유지된다. 상단 안내에서 종료할 수 있고 로그아웃하면 종료한다.
- 기본값은 Coral. 조회가 일시 실패해도 기본 화면을 제공하며, 저장 실패는 성공으로 표시하지 않는다.
- 기존 `cbt:theme`와 `.dark`를 유지한다. 밝기 모드와 사이트 디자인은 독립적이다.

## Coverage and content
- 랜딩·학습·응시·영어·요금제·검색·결과·관리 화면과 body 포털을 공통 역할에 연결한다.
- 화면의 코칭 문제지·답안지 미리보기도 같은 디자인을 따른다.
- 실제 인쇄·PDF는 흰 종이 형식을 유지한다. 수식 글꼴·내용·폭·넘침 처리·풀이 로직을 보존한다.
- 전자공학 회로·측정 시각화와 필기 색상은 데이터 표현이므로 별도 시스템을 유지한다.
- 기존 문구·가격·수량·권한·링크·핸들러를 보존하며 비교 캡처에는 명시한 예시 자료만 사용한다.

## Controls and motion
- 주 행동 하나를 primary, 보조 행동을 outline/quiet로 표시한다. 모든 입력 경계·작은 글자의 실제 대비를 확인한다.
- 포커스는 즉시 보인다. 작은 화면은 16px 여백과 44px 터치 영역이 기본이며 넓은 표는 표 내부에서 스크롤한다.
- 동작 변화는 짧게 끝내고 reduced-motion에서는 즉시 끝낸다.

## Exports
- 기본 CSS: `app/terrazzo-{shell,landing,study,exam,admin,admin-home}.css`.
- 공통 누락 보정: `app/design-legacy.css`; 선택 UI: `app/design-picker.css`.
- 글꼴: `app/fonts.css`, `app/design-fonts.css`, `public/fonts/`, `public/fonts/designs/`. General Sans는 공식 Fontshare CDN을 사용한다.
- 제품 캡처: `public/hallmark/{id}-study-{light,dark}.png`; 비교 캡처: `public/hallmark/previews/{id}-{light,dark}.png`.
