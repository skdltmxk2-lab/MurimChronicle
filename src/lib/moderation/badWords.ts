// 욕설/비방 사전 필터.
// 우회 시도(공백·숫자·특수문자 끼워넣기)를 정규화 한 단계로 흡수한 뒤
// 사전 단어가 substring 으로 포함되는지 검사한다.
// AI 호출 없이 동작하며, false positive 가 보이면 BANNED 목록을 조정해 가는 방식.

const BANNED = [
  // 한국어 — 가장 흔한 변형 묶음
  "시발", "씨발", "씨바", "씨파", "시바", "샤발", "쒸발",
  "ㅅㅂ", "ㅅ발", "시ㅂ", "ㅆㅂ", "ㅆ발",
  "병신", "븅신", "ㅂㅅ", "ㅄ",
  "좆", "좃", "존나", "졸라", "ㅈㄴ", "조까", "좆같",
  "개새끼", "개색끼", "개새기", "씨발놈", "씨발년",
  "미친놈", "미친년", "ㅁㅊㄴ", "ㅁㅊㄻ",
  "보지", "자지", "꼬추",
  "지랄", "ㅈㄹ",
  "닥쳐", "꺼져", "뒤져", "뒈져",
  "쌍놈", "쌍년", "쌍욕", "썅", "썅놈",
  "엿같", "엿먹",
  "ㅗ",
  // 영어
  "fuck", "fck", "shit", "bitch", "asshole", "dick",
  "cunt", "faggot", "motherfucker", "bastard",
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    // 공백류 제거 (반각/전각/탭/줄바꿈)
    .replace(/[\s　]+/g, "")
    // 숫자 제거 ("시1발", "ㅅ2ㅂ" 같은 우회)
    .replace(/[0-9]+/g, "")
    // 흔한 구두점·기호 제거 ("씨@발", "ㅅ.ㅂ" 같은 우회)
    .replace(/[.,!?\-_@#$%^&*()[\]{}<>|\\/:;"'`~+=]/g, "");
}

const NORMALIZED_BANNED = BANNED.map((w) => normalize(w)).filter((w) => w.length > 0);

export type BadWordCheck = { ok: true } | { ok: false; matched: string };

export function checkBadWords(...parts: (string | null | undefined)[]): BadWordCheck {
  const joined = parts.filter(Boolean).join(" ");
  const norm = normalize(joined);
  if (!norm) return { ok: true };
  for (let i = 0; i < NORMALIZED_BANNED.length; i++) {
    if (norm.includes(NORMALIZED_BANNED[i])) {
      return { ok: false, matched: BANNED[i] };
    }
  }
  return { ok: true };
}
