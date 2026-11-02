// Regression tests for the question rendering pipeline.
//
// scripts/lib/render_pipeline.mjs mirrors src/components/math/KaTeXRenderer.tsx.
// These cases pin the behaviour that has regressed before: choice labels such as
// (A)/(B) inside a formula must never be mistaken for <보기> statements, while a
// real 보기 list crammed onto one line must be broken into one statement per line.

import { normalizeContent, splitRenderBlocks, inspectRender } from "./lib/render_pipeline.mjs";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as viewBlocks from "../src/lib/math/viewBlocks.mjs";

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

console.log("View boxes preserve headings, conditions and trailing questions");
const viewCases = [
  {
    name: "blank line after heading does not create an empty box",
    content: "<보기>\n\n(가) 첫째 진술이다.\n(나) 둘째 진술이다.",
    count: 1, title: true
  },
  {
    name: "blank lines between statements stay in one box",
    content: "보기에서 옳은 것은?\nㄱ. 첫째 진술이다.\n\nㄴ. 둘째 진술이다.\n이때 $x$의 값은?",
    count: 1, title: true, tail: "이때 $x$의 값은?"
  },
  {
    name: "circled Korean labels are recognised",
    content: "㉠ 첫째 진술이다.\n㉡ 둘째 진술이다.",
    count: 1, title: false
  },
  {
    name: "math-delimited heading is recognised",
    content: "$\\langle$보기$\\rangle$\nㄱ. 첫째 진술이다.\nㄴ. 둘째 진술이다.",
    count: 1, title: true
  },
  {
    name: "a heading inside one math segment is recognised",
    content: "$\\langle 보기\\rangle$\nㄱ. 첫째 진술이다.\nㄴ. 둘째 진술이다.",
    count: 1, title: true
  },
  {
    name: "ordinary conditions have no invented 보기 title",
    content: "다음 조건을 만족한다.\n(가) 첫째 조건이다.\n(나) 둘째 조건이다.",
    count: 1, title: false
  },
  {
    name: "inline fill-in labels stay ordinary prose",
    content: "행렬의 고윳값은 (가)개이고 고유벡터는 (나)개이다.",
    count: 0
  },
  {
    name: "bare statements can form an untitled box",
    content: "ㄱ. 첫째 진술이다.\nㄴ. 둘째 진술이다.",
    count: 1, title: false
  },
  {
    name: "a separate conclusion is outside the box",
    content: "(가) 첫째 진술이다.\n(나) 둘째 진술이다.\n따라서 (가), (나)가 옳다.",
    count: 1, title: false, tail: "따라서 (가), (나)가 옳다."
  },
  {
    name: "an explicit same-line question is outside the box",
    content: "<보기>\n(가) 첫째 진술이다.\n(나) 둘째 진술이다. 이때 $x$의 값은?",
    count: 1, title: true, tail: "이때 $x$의 값은?"
  },
  {
    name: "a dangling heading creates no empty box",
    content: "<보기>\n\n",
    count: 0
  },
  {
    name: "a formula immediately after its label is preserved",
    content: "보기에서 옳은 것은?\nㄱ.$x=1$이다.\nㄴ.$x^2=1$이다.",
    count: 1, title: true
  }
];
for (const test of viewCases) {
  const result = blocks(test.content);
  const views = result.filter(block => block.type === "view");
  check(test.name, views.length === test.count, result);
  check(`${test.name}: no empty box`, views.every(block => block.text.trim()), result);
  if (test.title !== undefined) check(`${test.name}: heading`, views.every(block => block.showTitle === test.title), result);
  if (test.tail) check(`${test.name}: tail preserved outside`, result.some(block => block.type === "normal" && block.text.includes(test.tail)), result);
}
{
  const content = "ㄱ. 첫째 선지 내용이다.\nㄴ. 둘째 선지 내용이다.";
  const result = inspectRender(content, { viewBoxes: false });
  check("option context disables all boxes", result.blocks.length === 1 && result.blocks[0].type === "normal", result.blocks);
  check("option context preserves its text", result.normalized === content, result.normalized);
}

console.log("React renderer uses the same box parser as the offline audit");
{
  const require = createRequire(import.meta.url);
  const source = readFileSync(new URL("../src/components/math/KaTeXRenderer.tsx", import.meta.url), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
  }).outputText;
  const module = { exports: {} };
  const localRequire = id => id === "@/lib/math/viewBlocks.mjs" ? viewBlocks : require(id);
  new Function("require", "module", "exports", output)(localRequire, module, module.exports);
  const Component = module.exports.KaTeXRenderer;
  for (const test of viewCases) {
    const html = renderToStaticMarkup(React.createElement(Component, { content: test.content }));
    check(`React: ${test.name}`, (html.match(/data-view-box="true"/g) || []).length === test.count, html);
  }
  const html = renderToStaticMarkup(React.createElement(Component, { content: viewCases[0].content, viewBoxes: false }));
  check("React: option context disables boxes", !html.includes("data-view-box"), html);
  const mathHtml = renderToStaticMarkup(React.createElement(Component, { content: "$\\dfrac{1}{2}$" }));
  check("React: formulas produce real KaTeX HTML", mathHtml.includes('class="katex"'), mathHtml);
  const displayHtml = renderToStaticMarkup(React.createElement(Component, { content: "$$T(1,0,0)=(2,1),T(2,1,0)=(2,1),T(1,-1,-1)=(5,2)$$" }));
  check("React: short display source also scrolls in narrow columns", displayHtml.includes("overflow-x-auto"), displayHtml);
}

console.log(failures === 0 ? "\nAll render pipeline tests passed." : `\n${failures} render pipeline test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
