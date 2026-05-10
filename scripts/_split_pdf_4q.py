"""Split each page of a PDF into 4 quadrants and save as PNG."""
import sys
import os
import fitz  # pymupdf

def split_pdf(pdf_path, out_dir, prefix, dpi=300):
    doc = fitz.open(pdf_path)
    os.makedirs(out_dir, exist_ok=True)
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    for page_idx, page in enumerate(doc):
        pix = page.get_pixmap(matrix=mat, alpha=False)
        w, h = pix.width, pix.height
        mw, mh = w // 2, h // 2
        regions = {
            "TL": (0, 0, mw, mh),
            "TR": (mw, 0, w, mh),
            "BL": (0, mh, mw, h),
            "BR": (mw, mh, w, h),
        }
        for name, (x0, y0, x1, y1) in regions.items():
            clip = fitz.Rect(x0, y0, x1, y1)
            sub = page.get_pixmap(matrix=mat, clip=page.rect.intersect(
                fitz.Rect(x0/zoom, y0/zoom, x1/zoom, y1/zoom)
            ), alpha=False)
            out = os.path.join(out_dir, f"{prefix}_p{page_idx+1}_{name}.png")
            sub.save(out)
    doc.close()
    print(f"Done: {pdf_path} -> {out_dir} ({prefix})")

if __name__ == "__main__":
    pdf_path = sys.argv[1]
    out_dir = sys.argv[2]
    prefix = sys.argv[3]
    split_pdf(pdf_path, out_dir, prefix)
