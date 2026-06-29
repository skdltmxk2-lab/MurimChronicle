"""한양대 기출 PDF들을 4분할 이미지로 저장 (단답형 추출용)."""
import fitz, os

folder = r"C:/Users/yubin/Desktop/편입/편수/6_기출파일/한양대"
outdir = r"C:/Users/yubin/???? CBT/scripts/_tmp_pdf_imgs"
os.makedirs(outdir, exist_ok=True)

# (prefix, 파일명패턴)
years = [
    ("h17", "2017년도_한양대(본교)_편입수학_기출문제.pdf"),
    ("h18", "2018년도_한양대(본교)_편입수학_기출문제.pdf"),
    ("h19", "2019년도_한양대(본교)_편입수학_기출문제.pdf"),
    ("h20", "2020년도_한양대(본교)_편입수학_기출문제.pdf"),
    ("h21", "2021년도_한양대_편입수학_기출문제.pdf"),
    ("h22", "2022년도_한양대_편입수학_기출문제.pdf"),
    ("h23", "2023년도_한양대_편입수학_기출문제.pdf"),
    ("h24", "2024년도_한양대_편입수학_기출문제.pdf"),
    ("e19", "2019년도_한양대(에리카)_편입수학_기출문제.pdf"),
    ("e20", "2020년도_한양대(에리카)_편입수학_기출문제 (1).pdf"),
]

dpi = 200
for prefix, fname in years:
    path = os.path.join(folder, fname)
    if not os.path.exists(path):
        print(f"NOT FOUND: {fname}")
        continue
    doc = fitz.open(path)
    for i, page in enumerate(doc, start=1):
        mat = fitz.Matrix(dpi/72, dpi/72)
        pix = page.get_pixmap(matrix=mat)
        # 4분할
        w, h = pix.width, pix.height
        for tag, (x0, y0, x1, y1) in [
            ("TL", (0, 0, w//2, h//2)),
            ("TR", (w//2, 0, w, h//2)),
            ("BL", (0, h//2, w//2, h)),
            ("BR", (w//2, h//2, w, h)),
        ]:
            clip = page.get_pixmap(matrix=mat, clip=fitz.Rect(x0/dpi*72, y0/dpi*72, x1/dpi*72, y1/dpi*72))
            out = os.path.join(outdir, f"{prefix}q_p{i}_{tag}.png")
            clip.save(out)
    n = len(doc)
    doc.close()
    print(f"{prefix}: {fname} → 페이지 {n}개 분할")
print("완료")
