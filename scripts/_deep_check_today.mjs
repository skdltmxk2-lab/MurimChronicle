import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const txt = readFileSync(resolve(here, "_today_skku_dump.txt"), "utf8");

// Detect naked LaTeX command words inside math (no preceding backslash).
// Heuristic: look for these tokens NOT preceded by backslash or letter and immediately followed by '{' or '_' or whitespace.
const cmds = ["frac","dfrac","sqrt","int","sum","prod","cdot","partial","nabla","infty","displaystyle","begin","end","left","right","det","dim","operatorname","mathbb","mathbf","mathrm","iint","iiint","oint","rho","theta","phi","alpha","beta","gamma","delta","lambda","sigma","omega","pi"];

let issues = 0;
const lines = txt.split("\n");
for (let i=0;i<lines.length;i++){
  const l = lines[i];
  for (const c of cmds) {
    // pattern: char that is not backslash and not letter, followed by command word, followed by {, _, ^, or non-letter
    // Use lookbehind not supported uniformly, do manual scan
    let idx = 0;
    while ((idx = l.indexOf(c, idx)) !== -1) {
      const prev = idx===0 ? "" : l[idx-1];
      const next = l[idx+c.length] || "";
      const isPrevBackslash = prev === String.fromCharCode(0x5c);
      const isPrevLetter = /[a-zA-Z]/.test(prev);
      const isNextBoundary = !/[a-zA-Z]/.test(next);
      if (!isPrevBackslash && !isPrevLetter && isNextBoundary && (next === "{" || next === "_" || next === "^" || next === " " || next === "(" || next === "")) {
        // false positives common: words like 'phi', 'pi' might appear in Korean/English text. Restrict to inside $...$
        // Quick heuristic: is this within a $...$ region?
        const before = l.slice(0, idx);
        const dollarsBefore = (before.match(/\$/g)||[]).length;
        const insideMath = (dollarsBefore % 2) === 1;
        if (insideMath) {
          console.log(`Line ${i+1} | naked '${c}' | ${l.slice(Math.max(0,idx-20), idx+c.length+20)}`);
          issues++;
        }
      }
      idx += c.length;
    }
  }
}
console.log(`Naked command suspicions: ${issues}`);
