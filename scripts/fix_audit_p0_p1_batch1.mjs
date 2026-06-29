// Applies the first safe batch of DB audit fixes.
// Usage: node scripts/fix_audit_p0_p1_batch1.mjs
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import katex from "katex";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const envText = readFileSync(resolve(root, ".env.local"), "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase credentials in .env.local");

const supabase = createClient(supabaseUrl, supabaseKey);

const option = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

const updates = [
  {
    id: "q-white-final-a-r02-29",
    patch: {
      question: `$n$ 차 정사각행렬 $A$ 에 대하여 다음 <보기> 중 옳은 것의 개수는?

(ㄱ) 행렬 $A^{T}A$ 의 임의의 고유벡터들은 $\\mathbb{R}^{n}$ 의 모든 원소들을 일차결합으로 표현할 수 있다.
(ㄴ) 행렬 $A+A^{T}$ 의 모든 고유값은 실수이다.
(ㄷ) 직교행렬 $A$ 의 고유치는 $1$ 또는 $-1$ 이다.
(ㄹ) $A$ 가 가역행렬이면 $AX=O$ 의 해는 자명한 해뿐이다.
(ㅁ) 대칭행렬 $A$ 의 행공간 및 열공간의 모든 원소는 영공간에 일차종속이다.`,
      options: [
        option("1", "1 개"),
        option("2", "2 개"),
        option("3", "3 개"),
        option("4", "4 개"),
        option("5", "5 개"),
      ],
      correct_option_id: "3",
      explanation: `29) (ㄱ) 행렬 $A^{T} A$ 는 대칭행렬이므로 직교대각화가 가능하다.

즉, $\\mathbb{R}^{n}$ 에서 일차독립인 고유벡터가 $n$ 개 존재하므로 모든 벡터들을 일차결합으로 표현할 수 있다. (참)
(ㄴ) 행렬 $A+A^{T}$ 은 대칭행렬이므로 모든 고유값은 실수이다. (참)
(ㄷ) 직교행렬 $A$ 의 고유치는 $1$ 또는 $-1$ 이거나 켤레복소수로 나타날 수 있다. (거짓)
(ㄹ) $A$ 가 가역행렬이면 $AX=O \\Leftrightarrow X=A^{-1}O=O$ 이므로 자명한 해만 갖는다. (참)
(ㅁ) 대칭행렬이면 $A$ 의 행공간과 열공간은 같다.

또한 $A$ 의 행공간과 $A$ 의 영공간은 직교여공간이다.
따라서 행공간 및 열공간의 모든 원소가 영공간에 일차종속인 것은 아니다. (거짓)

정답: (3)`,
    },
  },
  {
    id: "q-white-final-a-r07-6",
    patch: {
      question: `실수 전체에서 정의된 함수 $y(x)$ 가 다음 값을 만족한다.

$a=1$ 일 때 $y(1)=1,\\ y'(1)=4$,
$a=2$ 일 때 $y(2)=3,\\ y'(2)=-2$.

이 함수의 일차 근사함수를 이용하여 $y(1.2)+y(2.1)$ 의 근삿값을 구하면?`,
    },
  },
  {
    id: "q-2021-sogang-11",
    patch: {
      explanation: `$e^{-x}-1+x=\\dfrac{x^2}{2}-\\dfrac{x^3}{6}+\\dfrac{x^4}{24}-\\dfrac{x^5}{120}+\\cdots$.
$\\dfrac{2(e^{-x}-1+x)}{x^2}=1-\\dfrac{x}{3}+\\dfrac{x^2}{12}-\\dfrac{x^3}{60}+\\cdots$.
$f'''(0)=3!\\cdot[x^3\\text{의 계수}]=6\\cdot\\!\\left(-\\dfrac{1}{60}\\right)=-\\dfrac{1}{10}$.`,
    },
  },
  {
    id: "q-2023-gachon-b-18",
    patch: {
      question: `함수 $f(x)=(\\operatorname{arccot} x)^x$에 대해 $\\dfrac{f'(\\sqrt{3})}{f(\\sqrt{3})}$의 값은?`,
      explanation: `**1단계 - 로그미분.** $\\ln f=x\\ln(\\operatorname{arccot} x)$. 양변 미분:

$\\dfrac{f'}{f}=\\ln(\\operatorname{arccot} x)+x\\cdot\\dfrac{(\\operatorname{arccot} x)'}{\\operatorname{arccot} x}$.

$(\\operatorname{arccot} x)'=-\\dfrac{1}{1+x^2}$.

$\\dfrac{f'}{f}=\\ln(\\operatorname{arccot} x)-\\dfrac{x}{(1+x^2)\\operatorname{arccot} x}$.

**2단계 - $x=\\sqrt 3$ 대입.** $\\operatorname{arccot}\\sqrt 3=\\dfrac{\\pi}{6}$ 이고 $1+x^2=4$이다.

$\\dfrac{f'(\\sqrt 3)}{f(\\sqrt 3)}=\\ln\\dfrac{\\pi}{6}-\\dfrac{\\sqrt 3}{4\\cdot\\pi/6}=\\ln\\dfrac{\\pi}{6}-\\dfrac{3\\sqrt 3}{2\\pi}$.`,
    },
  },
  {
    id: "q-2023-inha-16",
    patch: {
      explanation: `$\\dfrac{dy}{dx}=y^2\\sin x$ 이므로 $\\dfrac{dy}{y^2}=\\sin x\\,dx$.
적분하면 $-\\dfrac{1}{y}=-\\cos x+C$.
초기조건 $y(0)=-1$을 대입하면 $1=-1+C$ 이므로 $C=2$이다.
따라서 $-\\dfrac{1}{y}=-\\cos x+2$, 즉 $y=\\dfrac{1}{\\cos x-2}$.
$y(\\pi)=\\dfrac{1}{-1-2}=-\\dfrac{1}{3}$.

정답: (2)`,
    },
  },
  {
    id: "q-ryu-self-warmup-r11-03",
    patch: {
      question: `3. $|x| \\leq 1$ 의 구간에서 $f(x)=\\int_{0}^{x} s\\ln\\left(1+s^{2}\\right)\\,ds$ 의 매클로린 급수(Maclaurin series)를 다음과 같이 구하였다.

$$f(x)=\\int_{0}^{x} s\\ln\\left(1+s^{2}\\right)\\,ds=a_{0}+a_{1}x+a_{2}x^{2}+a_{3}x^{3}+a_{4}x^{4}+a_{5}x^{5}+\\cdots$$

$a_{0}+a_{1}+a_{2}+a_{3}+a_{4}+a_{5}$ 의 값은 얼마인가?`,
    },
  },
  {
    id: "q-2023-inha-14",
    patch: {
      explanation: `교차 편미분 일치 조건을 사용한다.
$f_{xy}=a\\cos y+6xz$, $f_{yx}=2\\cos y+2bxz$ 이므로 $a=2,\\ b=3$이다.
또 $f_{xz}=6xy+e^{xz}+xze^{xz}$ 이고 $f_{zx}=6xy+c(e^{xz}+xze^{xz})$ 이므로 $c=1$이다.
따라서 $a+b+c=2+3+1=6$.

정답: (4)`,
    },
  },
  {
    id: "q-2025-kw-01",
    patch: {
      options: [
        option("1", "$0$개"),
        option("2", "$1$개"),
        option("3", "$2$개"),
        option("4", "$3$개"),
        option("5", "$4$개"),
      ],
      correct_option_id: "2",
    },
  },
];

function countDollars(text) {
  return (String(text ?? "").match(/(?<!\\)\$/g) ?? []).length;
}

function splitMath(content) {
  const segments = [];
  const text = String(content ?? "");
  const pattern = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ math: false, text: text.slice(lastIndex, match.index), display: false });
    }
    const token = match[0];
    const display = token.startsWith("$$");
    segments.push({
      math: true,
      display,
      text: display ? token.slice(2, -2) : token.slice(1, -1),
    });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ math: false, text: text.slice(lastIndex), display: false });
  }
  return segments;
}

function validateLatex(id, patch) {
  const fields = [
    ["question", patch.question],
    ["explanation", patch.explanation],
    ...(Array.isArray(patch.options) ? patch.options.map((opt) => [`option:${opt.id}`, opt.text]) : []),
  ];
  for (const [field, value] of fields) {
    if (value == null) continue;
    if (countDollars(value) % 2 !== 0) {
      throw new Error(`${id} ${field}: odd dollar delimiter count`);
    }
    for (const segment of splitMath(value)) {
      if (!segment.math || !segment.text.trim()) continue;
      katex.renderToString(segment.text, {
        displayMode: segment.display,
        throwOnError: true,
        strict: false,
      });
    }
  }
}

for (const update of updates) {
  validateLatex(update.id, update.patch);
}

const ids = updates.map((update) => update.id);
const { data: before, error: fetchError } = await supabase
  .from("questions")
  .select("id")
  .in("id", ids);
if (fetchError) throw fetchError;

const found = new Set(before.map((row) => row.id));
const missing = ids.filter((id) => !found.has(id));
if (missing.length) throw new Error(`Missing question rows: ${missing.join(", ")}`);

for (const update of updates) {
  const patch = { ...update.patch, updated_at: new Date().toISOString() };
  const { error } = await supabase.from("questions").update(patch).eq("id", update.id);
  if (error) throw new Error(`${update.id}: ${error.message}`);
  console.log(`updated ${update.id}`);
}

console.log(`Applied ${updates.length} question fixes.`);
