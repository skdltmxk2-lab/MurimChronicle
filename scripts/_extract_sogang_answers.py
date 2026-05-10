"""For each Sogang year, build a {Q# -> answer} dict by anchoring [정답] markers
to the nearest preceding problem-number marker.
"""
import fitz, re, json, os

folder = "C:/Users/yubin/Desktop/편입/편수/6_기출파일/서강"
years = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]

result = {}
for y in years:
    af = f"{y}년도_서강대_편입수학_해설및정답.pdf"
    path = os.path.join(folder, af)
    if not os.path.exists(path):
        result[y] = {"_error": "no answer pdf"}
        continue
    doc = fitz.open(path)
    text = ""
    for p in doc:
        text += p.get_text()
    doc.close()

    qmarkers = []
    for m in re.finditer(r"(?:^|\n|\s)(\d+)\.\s*\[해설", text):
        qmarkers.append((int(m.group(1)), m.start()))
    seen = set()
    qmarkers = sorted(qmarkers, key=lambda x: x[1])
    qmarkers = [(q, p) for q, p in qmarkers if not (q in seen or seen.add(q))]
    found_qs = sorted(q for q, _ in qmarkers)

    answers = [(int(m.group(1)), m.start()) for m in re.finditer(r"\[정답\]\(?(\d+)\)?", text)]

    qa = {}
    for ans, pos in answers:
        matched = None
        for q, qpos in qmarkers:
            if qpos < pos:
                matched = q
            else:
                break
        qa.setdefault(matched, []).append(ans)

    final = {q: alist[-1] for q, alist in qa.items() if q is not None}
    max_q = max(final.keys()) if final else 0
    missing = [q for q in range(1, max_q + 1) if q not in final]
    result[y] = {"answers": final, "missing": missing, "max_q": max_q, "found_q_markers": found_qs}

print(json.dumps(result, ensure_ascii=False, indent=2))
