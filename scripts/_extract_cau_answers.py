"""For each CAU year, build a {Q# -> answer} dict by anchoring [정답] markers
to the nearest preceding problem-number marker (e.g. "12. [해설").

Output is JSON-printable {year: {qnum: ans}} with only the LAST answer per Q
(handles [문제변경] re-answers). Missing Q numbers are reported.
"""
import fitz, re, json, os

folder = "C:/Users/yubin/Desktop/편입/편수/6_기출파일/중앙대"
years = [2018, 2020, 2021, 2022, 2023, 2024]
files = os.listdir(folder)

result = {}
for y in years:
    af = next((f for f in files if str(y) in f and "해설" in f and ("(수학과)" in f or y == 2024)), None)
    if not af:
        result[y] = {"_error": "no answer pdf"}
        continue
    doc = fitz.open(os.path.join(folder, af))
    text = ""
    for p in doc:
        text += p.get_text()
    doc.close()

    # Problem-number markers: "N. [해설" or sometimes "N. " followed by Korean
    qmarkers = []
    for m in re.finditer(r"(?:^|\n|\s)(\d+)\.\s*\[해설", text):
        qmarkers.append((int(m.group(1)), m.start()))
    # Sort and de-dup
    seen = set()
    qmarkers = sorted(qmarkers, key=lambda x: x[1])
    qmarkers = [(q, p) for q, p in qmarkers if not (q in seen or seen.add(q))]
    found_qs = sorted(q for q, _ in qmarkers)

    # All answers
    answers = [(int(m.group(1)), m.start()) for m in re.finditer(r"\[정답\]\(?(\d+)\)?", text)]

    # Map each answer to its preceding Q marker
    qa = {}
    for ans, pos in answers:
        matched = None
        for q, qpos in qmarkers:
            if qpos < pos:
                matched = q
            else:
                break
        qa.setdefault(matched, []).append(ans)

    # Use the LAST answer for each Q (handles 문제변경)
    final = {q: alist[-1] for q, alist in qa.items() if q is not None}
    missing = [q for q in range(1, 31) if q not in final]
    result[y] = {"answers": final, "missing": missing, "found_q_markers": found_qs}

print(json.dumps(result, ensure_ascii=False, indent=2))
