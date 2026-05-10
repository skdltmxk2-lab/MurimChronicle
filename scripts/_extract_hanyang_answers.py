"""한양대 해설/정답 PDF 모두 분석 → {Q번호: 답} 매핑."""
import fitz, re, json, os

folder = r"C:/Users/yubin/Desktop/편입/편수/6_기출파일/한양대"
years = [
    ("h17", "2017년도_한양대(본교)_편입수학_해설및정답.pdf"),
    ("h18", "2018년도_한양대(본교)_편입수학_해설및정답.pdf"),
    ("h19", "2019년도_한양대(본교)_편입수학_해설및정답.pdf"),
    ("h20", "2020년도_한양대(본교)_편입수학_해설및정답.pdf"),
    ("h21", "2021년도_한양대_편입수학_해설및정답.pdf"),
    ("h22", "2022년도_한양대_편입수학_해설및정답.pdf"),
    ("h23", "2023년도_한양대_편입수학_해설및정답.pdf"),
    ("h24", "2024년도_한양대_편입수학_해설및정답.pdf"),
]
result = {}
for prefix, fname in years:
    p = os.path.join(folder, fname)
    if not os.path.exists(p):
        result[prefix] = {"error": "no file"}; continue
    doc = fitz.open(p)
    text = "".join(pg.get_text() for pg in doc)
    doc.close()
    # 문제 마커: 'N. [해설]' 또는 'N. ' (에서 N=number)
    qmarkers = []
    for m in re.finditer(r'(?:^|\n|\s)(\d+)\.\s*\[해설', text):
        qmarkers.append((int(m.group(1)), m.start()))
    seen = set()
    qmarkers = sorted(qmarkers, key=lambda x: x[1])
    qmarkers = [(q, p) for q, p in qmarkers if not (q in seen or seen.add(q))]
    # 답 패턴: [정답]<숫자> (subjective) 또는 [정답](N) (multiple choice)
    answers = []
    for m in re.finditer(r'\[정답\]\s*(\(?\d+\)?)', text):
        v = m.group(1).strip()
        # (N) → N (객관식 옵션 번호); 숫자만 → subjective 답
        is_mc = v.startswith("(") and v.endswith(")")
        val = v.strip("()")
        answers.append((val, is_mc, m.start()))
    qa = {}
    for ans, is_mc, pos in answers:
        matched = None
        for q, qpos in qmarkers:
            if qpos < pos: matched = q
            else: break
        if matched is not None:
            qa.setdefault(matched, []).append((ans, is_mc))
    final = {q: alist[-1] for q, alist in qa.items()}  # 마지막 답 (변경 시 마지막)
    result[prefix] = {"answers": {q: {"value": v, "mc": mc} for q, (v, mc) in final.items()}, "found_qs": sorted(q for q, _ in qmarkers)}

print(json.dumps(result, ensure_ascii=False, indent=2))
