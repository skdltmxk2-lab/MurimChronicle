"""한양대 해설/정답 PDF의 단답형 정답 페이지 부분만 4분할로 저장."""
import fitz, os

folder = r"C:/Users/yubin/Desktop/편입/편수/6_기출파일/한양대"
outdir = r"C:/Users/yubin/???? CBT/scripts/_tmp_pdf_imgs"
os.makedirs(outdir, exist_ok=True)

years = [
    ("h17", "2017년도_한양대(본교)_편입수학_해설및정답.pdf"),
    ("h18", "2018년도_한양대(본교)_편입수학_해설및정답.pdf"),
    ("h19", "2019년도_한양대(본교)_편입수학_해설및정답.pdf"),
    ("h20", "2020년도_한양대(본교)_편입수학_해설및정답.pdf"),
    ("h21", "2021년도_한양대_편입수학_해설및정답.pdf"),
    ("h22", "2022년도_한양대_편입수학_해설및정답.pdf"),
    ("h23", "2023년도_한양대_편입수학_해설및정답.pdf"),
    ("h24", "2024년도_한양대_편입수학_해설및정답.pdf"),
    ("e19", "2019년도_한양대(에리카)_편입수학_해설및정답.pdf"),
    ("e20", "2020년도_한양대(에리카)_편입수학_해설및정답 (1).pdf"),
]

dpi = 200
for prefix, fname in years:
    path = os.path.join(folder, fname)
    if not os.path.exists(path):
        print(f"NOT FOUND: {fname}")
        continue
    doc = fitz.open(path)
    n = len(doc)
    # 마지막 3페이지만 (정답표 + 단답형 해설 위주)
    start = max(0, n - 3)
    for i in range(start, n):
        page = doc[i]
        mat = fitz.Matrix(dpi/72, dpi/72)
        for tag, (x0, y0, x1, y1) in [("TL", (0,0,0.5,0.5)), ("TR", (0.5,0,1.0,0.5)), ("BL", (0,0.5,0.5,1.0)), ("BR", (0.5,0.5,1.0,1.0))]:
            r = page.rect
            clip = page.get_pixmap(matrix=mat, clip=fitz.Rect(r.x0+r.width*x0, r.y0+r.height*y0, r.x0+r.width*x1, r.y0+r.height*y1))
            out = os.path.join(outdir, f"{prefix}a_p{i+1}_{tag}.png")
            clip.save(out)
    doc.close()
    print(f"{prefix}: {fname} → 마지막 {n-start}페이지 분할 (전체 {n}페이지)")
print("완료")
