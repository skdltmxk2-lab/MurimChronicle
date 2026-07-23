import assert from "node:assert/strict";
import {
  getStandaloneQuestionIssue,
  isPublishableQuestion,
  isStandaloneQuestion,
} from "../src/lib/questions/standaloneCore.mjs";

const rejected = [
  {
    name: "numbered passage reference",
    input: { question: "지문 48의 변환에서 상수의 값을 구하시오." },
    code: "external_question_reference",
  },
  {
    name: "numbered setting reference",
    input: { question: "위 문제(45번 설정)의 행렬식을 구하시오." },
    code: "external_question_reference",
  },
  {
    name: "compact numbered setting reference",
    input: { question: "위(48번 설정)에서 얻은 함수의 적분값은?" },
    code: "external_question_reference",
  },
  {
    name: "presented matrix reference",
    input: { question: "제시문의 행렬 $P$에 대하여 $\\det P$의 값은?" },
    code: "external_question_reference",
  },
  {
    name: "reference hidden in explanation",
    input: {
      question: "행렬 $A$의 특성다항식을 $f(x)$라 할 때 $f(2)$의 값은?",
      explanation: "제시문 ㉡을 인수분해하면 답을 얻는다.",
    },
    code: "external_question_reference",
  },
  {
    name: "undefined projection space",
    input: {
      question:
        "벡터 $u=(4,2,1,1,1)$의 $W$ 위로의 정사영을 $P_W(u)$라 할 때 그 크기는?",
    },
    code: "undefined_projection_space",
  },
  {
    name: "instruction without a stem",
    input: { question: "값을 구하시오." },
    code: "missing_question_body",
  },
  {
    name: "leading dangling context",
    input: { question: "위의 조건을 만족하는 행렬의 행렬식을 구하시오." },
    code: "stem_starts_mid_sentence",
  },
];

for (const test of rejected) {
  assert.equal(
    getStandaloneQuestionIssue(test.input)?.code,
    test.code,
    `${test.name} should be rejected`,
  );
}

const accepted = [
  {
    name: "inline projection definition",
    input: {
      question:
        "벡터 $v=(1,0)$가 생성하는 부분공간을 $W$라 하자. $u=(2,3)$의 $W$ 위로의 정사영을 구하시오.",
      explanation: "$W=\\operatorname{span}\\{v\\}$를 사용한다.",
    },
  },
  {
    name: "self-contained reference to current situation",
    input: {
      question:
        "온도가 $T(t)=20+80e^{-t}$인 물체가 있다. 위 문제 상황에서 $T(1)$을 구하시오.",
    },
  },
  {
    name: "inline presented context",
    input: {
      question:
        "<제시문> 행렬 $A=\\begin{pmatrix}1&0\\\\0&2\\end{pmatrix}$이다. 제시문의 행렬 $A$의 행렬식을 구하시오.",
    },
  },
  {
    name: "ordinary defined matrix",
    input: {
      question:
        "행렬 $A=\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}$에 대하여 $\\det A$를 구하시오.",
    },
  },
];

for (const test of accepted) {
  assert.equal(isStandaloneQuestion(test.input), true, `${test.name} should be accepted`);
}

assert.equal(
  isPublishableQuestion({ question: "정상 문제", qualityStatus: "pending" }),
  false,
  "pending questions must not be published",
);
assert.equal(
  isPublishableQuestion({ question: "정상 문제", qualityStatus: "quarantined" }),
  false,
  "quarantined questions must not be published",
);
assert.equal(
  isPublishableQuestion({ question: "정상 문제", qualityStatus: "approved" }),
  true,
  "approved standalone questions should be published",
);

console.log(`standalone validator: ${rejected.length + accepted.length + 3} cases passed`);
