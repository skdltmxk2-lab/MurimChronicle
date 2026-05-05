import type { MockExam } from "@/types/exam";

export const mockExams: MockExam[] = [
  {
    id: "calc-basic-01",
    title: "미분학 기본 점검 모의고사",
    description: "극한, 연속, 도함수의 기본기를 확인하는 6문항 CBT입니다.",
    mode: "selected",
    timeLimitSec: 25 * 60,
    tags: ["미분학", "기본", "극한", "도함수"],
    problems: [
      {
        id: "p-cb01-01",
        subject: "편입수학",
        unit: "미분학",
        concept: "기본 극한",
        difficulty: "easy",
        question: "$\\displaystyle \\lim_{x\\to 2}(3x^2-x)$의 값은?",
        options: [
          { id: "1", label: "1", text: "$8$" },
          { id: "2", label: "2", text: "$10$" },
          { id: "3", label: "3", text: "$12$" },
          { id: "4", label: "4", text: "$14$" }
        ],
        correctOptionId: "2",
        explanation:
          "다항함수는 모든 실수에서 연속이므로 $x=2$를 바로 대입합니다. $3\\cdot 2^2-2=10$입니다."
      },
      {
        id: "p-cb01-02",
        subject: "편입수학",
        unit: "미분학",
        concept: "연속 조건",
        difficulty: "medium",
        question:
          "$f(x)=\\begin{cases} ax+1 & (x<1) \\\\ x^2+2a & (x\\ge 1) \\end{cases}$가 $x=1$에서 연속일 때 $a$의 값은?",
        options: [
          { id: "1", label: "1", text: "$0$" },
          { id: "2", label: "2", text: "$1$" },
          { id: "3", label: "3", text: "$2$" },
          { id: "4", label: "4", text: "$3$" }
        ],
        correctOptionId: "1",
        explanation:
          "좌극한은 $a+1$, 함수값과 우극한은 $1+2a$입니다. 연속이려면 $a+1=1+2a$이므로 $a=0$입니다."
      },
      {
        id: "p-cb01-03",
        subject: "편입수학",
        unit: "미분학",
        concept: "미분계수",
        difficulty: "easy",
        question:
          "$f(x)=x^3-2x$일 때 $f'(1)$의 값은?",
        options: [
          { id: "1", label: "1", text: "$-1$" },
          { id: "2", label: "2", text: "$0$" },
          { id: "3", label: "3", text: "$1$" },
          { id: "4", label: "4", text: "$3$" }
        ],
        correctOptionId: "3",
        explanation:
          "$f'(x)=3x^2-2$이므로 $f'(1)=3-2=1$입니다."
      },
      {
        id: "p-cb01-04",
        subject: "편입수학",
        unit: "미분학",
        concept: "합성함수 미분",
        difficulty: "medium",
        question:
          "$y=\\sin(x^2)$일 때 $\\dfrac{dy}{dx}$는?",
        options: [
          { id: "1", label: "1", text: "$\\cos(x^2)$" },
          { id: "2", label: "2", text: "$2x\\cos(x^2)$" },
          { id: "3", label: "3", text: "$2x\\sin(x^2)$" },
          { id: "4", label: "4", text: "$-2x\\cos(x^2)$" }
        ],
        correctOptionId: "2",
        explanation:
          "겉함수 $\\sin u$를 미분하면 $\\cos u$, 속함수 $u=x^2$의 미분은 $2x$입니다. 따라서 $2x\\cos(x^2)$입니다."
      },
      {
        id: "p-cb01-05",
        subject: "편입수학",
        unit: "미분학",
        concept: "접선",
        difficulty: "medium",
        question:
          "곡선 $y=x^2+1$ 위의 점 $(1,2)$에서 접선의 기울기는?",
        options: [
          { id: "1", label: "1", text: "$1$" },
          { id: "2", label: "2", text: "$2$" },
          { id: "3", label: "3", text: "$3$" },
          { id: "4", label: "4", text: "$4$" }
        ],
        correctOptionId: "2",
        explanation:
          "$y'=2x$이고 $x=1$에서 $y'=2$입니다."
      },
      {
        id: "p-cb01-06",
        subject: "편입수학",
        unit: "미분학",
        concept: "로그미분",
        difficulty: "hard",
        question:
          "$y=x^x\\ (x>0)$일 때 $\\dfrac{dy}{dx}$는?",
        options: [
          { id: "1", label: "1", text: "$x^x$" },
          { id: "2", label: "2", text: "$x^x\\ln x$" },
          { id: "3", label: "3", text: "$x^x(\\ln x+1)$" },
          { id: "4", label: "4", text: "$x^{x-1}$" }
        ],
        correctOptionId: "3",
        explanation:
          "$\\ln y=x\\ln x$이므로 $y'/y=\\ln x+1$입니다. 따라서 $y'=x^x(\\ln x+1)$입니다."
      }
    ]
  },
  {
    id: "linear-basic-01",
    title: "선형대수 빠른 진단 테스트",
    description: "행렬, 행렬식, 고유값의 기초 감각을 점검하는 5문항 테스트입니다.",
    mode: "selected",
    timeLimitSec: 20 * 60,
    tags: ["선형대수", "행렬", "진단"],
    problems: [
      {
        id: "p-la01-01",
        subject: "편입수학",
        unit: "선형대수",
        concept: "행렬 곱",
        difficulty: "easy",
        question:
          "$A=\\begin{pmatrix}1&2\\\\0&1\\end{pmatrix}$, $B=\\begin{pmatrix}2&0\\\\1&3\\end{pmatrix}$일 때 $AB$의 $(1,1)$ 성분은?",
        options: [
          { id: "1", label: "1", text: "$2$" },
          { id: "2", label: "2", text: "$3$" },
          { id: "3", label: "3", text: "$4$" },
          { id: "4", label: "4", text: "$5$" }
        ],
        correctOptionId: "3",
        explanation:
          "$(1,1)$ 성분은 첫 행과 첫 열의 내적입니다. $1\\cdot2+2\\cdot1=4$입니다."
      },
      {
        id: "p-la01-02",
        subject: "편입수학",
        unit: "선형대수",
        concept: "행렬식",
        difficulty: "easy",
        question:
          "$\\det\\begin{pmatrix}3&1\\\\2&4\\end{pmatrix}$의 값은?",
        options: [
          { id: "1", label: "1", text: "$8$" },
          { id: "2", label: "2", text: "$10$" },
          { id: "3", label: "3", text: "$12$" },
          { id: "4", label: "4", text: "$14$" }
        ],
        correctOptionId: "2",
        explanation:
          "$2\\times2$ 행렬식은 $ad-bc$입니다. $3\\cdot4-1\\cdot2=10$입니다."
      },
      {
        id: "p-la01-03",
        subject: "편입수학",
        unit: "선형대수",
        concept: "역행렬",
        difficulty: "medium",
        question:
          "$2\\times2$ 행렬 $A$에 대해 $\\det A=0$이면 항상 참인 것은?",
        options: [
          { id: "1", label: "1", text: "$A$는 역행렬을 가진다." },
          { id: "2", label: "2", text: "$A$는 대각행렬이다." },
          { id: "3", label: "3", text: "$A$는 역행렬을 가지지 않는다." },
          { id: "4", label: "4", text: "$A^2=I$이다." }
        ],
        correctOptionId: "3",
        explanation:
          "정사각행렬은 행렬식이 $0$이 아닐 때에만 역행렬을 가집니다."
      },
      {
        id: "p-la01-04",
        subject: "편입수학",
        unit: "선형대수",
        concept: "고유값",
        difficulty: "medium",
        question:
          "대각행렬 $D=\\begin{pmatrix}2&0\\\\0&5\\end{pmatrix}$의 고유값은?",
        options: [
          { id: "1", label: "1", text: "$2,5$" },
          { id: "2", label: "2", text: "$0,7$" },
          { id: "3", label: "3", text: "$1,10$" },
          { id: "4", label: "4", text: "$-2,-5$" }
        ],
        correctOptionId: "1",
        explanation:
          "대각행렬의 고유값은 대각성분입니다. 따라서 $2$와 $5$입니다."
      },
      {
        id: "p-la01-05",
        subject: "편입수학",
        unit: "선형대수",
        concept: "선형독립",
        difficulty: "hard",
        question:
          "$\\mathbb{R}^2$에서 세 벡터가 주어졌을 때 항상 참인 설명은?",
        options: [
          { id: "1", label: "1", text: "항상 선형독립이다." },
          { id: "2", label: "2", text: "항상 선형종속이다." },
          { id: "3", label: "3", text: "항상 영벡터를 포함한다." },
          { id: "4", label: "4", text: "항상 서로 직교한다." }
        ],
        correctOptionId: "2",
        explanation:
          "$\\mathbb{R}^2$의 차원은 $2$이므로 벡터가 $3$개이면 반드시 선형종속입니다."
      }
    ]
  }
];

export function getMockExam(examId: string) {
  return mockExams.find((exam) => exam.id === examId) ?? null;
}
