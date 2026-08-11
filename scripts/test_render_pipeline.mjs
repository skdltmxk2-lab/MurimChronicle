// Regression tests for the question rendering pipeline.
//
// scripts/lib/render_pipeline.mjs mirrors src/components/math/KaTeXRenderer.tsx.
// These cases pin the behaviour that has regressed before: choice labels such as
// (A)/(B) inside a formula must never be mistaken for <보기> statements, while a
// real 보기 list crammed onto one line must be broken into one statement per line.

import { normalizeContent, splitRenderBlocks, inspectRender } from "./lib/render_pipeline.mjs";

let failures = 0;

function check(name, condition, detail) {
  if (condition) {
    console.log(`  ok   ${name}`);
    return;
  }
  failures += 1;
  console.log(`  FAIL ${name}`);
  if (detail !== undefined) console.log(`       ${typeof detail === "string" ? detail : JSON.stringify(detail)}`);
}

function blocks(content) {
  return splitRenderBlocks(normalizeContent(content));
}

console.log("Formula labels are not 보기 statements");
{
  const content =
    "실 정사각행렬 $A,B$에 대하여 $\\det(ABA)=9,\\ \\det(BAB)=-3$일 때, $\\det(A)+\\det(B)$의 값은?";
  const result = blocks(content);
  const report = inspectRender(content);
  check("stays a single normal block", result.length === 1 && result[0].type === "normal", result);
  check("keeps the source text intact", normalizeContent(content) === content, normalizeContent(content));
  check("prints no literal $", !/(?<!\\)\$/.test(report.literalText), report.literalText);
  check("compiles every formula", report.mathErrors.length === 0, report.mathErrors);
}

console.log("Repeated references are not statement lists");
{
  const content = "다음 조건 (i),(ii)를 만족할 때, 급수 $\\sum a_n$ 중 발산하는 것은?";
  check("no break inserted", normalizeContent(content) === content, normalizeContent(content));
}

console.log("A one-line 보기 list is split per statement");
{
  const content =
    "임의의 정사각행렬 $A$와 $B$에 대하여 <보기>에서 옳은 것을 모두 고르면? " +
    "가. $\\det(A)=\\det(A^T)$이다. 나. $\\det(AB)=0$이면 $\\det(A)=0$이다. 다. $\\det(A^2)=1$이면 $\\det(A)=1$이다.";
  const normalized = normalizeContent(content);
  const lines = normalized.split("\n");
  check("one line per statement", lines.length === 4, lines);
  check("첫 줄은 발문", lines[0].includes("모두 고르면?"), lines[0]);
  check("가/나/다 각각 줄머리", ["가.", "나.", "다."].every((m, i) => lines[i + 1].startsWith(m)), lines);
  const result = blocks(content);
  check("보기 박스로 묶임", result.some((block) => block.type === "view"), result.map((b) => b.type));
}

console.log("Latin and circled labels split the same way");
{
  const content =
    "다음 급수 중 수렴하는 것을 모두 고르면? (a) $\\sum_{n=1}^{\\infty}\\dfrac{\\ln n}{n}$\\quad " +
    "(b) $\\sum_{n=1}^{\\infty}\\dfrac{1}{n^2}$\\quad (c) $\\sum_{n=1}^{\\infty}\\tan\\dfrac{1}{n}$";
  const normalized = normalizeContent(content);
  check("no literal \\quad left", !normalized.includes("\\quad"), normalized);
  check("three statement lines", normalized.split("\n").length === 4, normalized.split("\n"));
}

console.log("Long inline formulas are promoted to display blocks");
{
  const long = `$${"x".repeat(200)}$`;
  const report = inspectRender(long);
  check("segment recognised as math", report.mathSegments.length === 1, report.mathSegments.length);
  check("length exceeds the inline threshold", report.mathSegments[0].text.length > 160);
}

console.log("Escaped dollars stay literal");
{
  const content = "가격은 \\$5 이다.";
  const report = inspectRender(content);
  check("no math segment produced", report.mathSegments.length === 0, report.mathSegments);
}

console.log(failures === 0 ? "\nAll render pipeline tests passed." : `\n${failures} render pipeline test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
