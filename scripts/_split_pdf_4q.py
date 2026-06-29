"""Split each PDF page into 4 overlapped quadrants and save as PNG."""
import sys
import os
import fitz  # pymupdf

def expand_region(region, width, height, overlap_x, overlap_y):
    x0, y0, x1, y1 = region
    return (
        max(0, x0 - overlap_x),
        max(0, y0 - overlap_y),
        min(width, x1 + overlap_x),
        min(height, y1 + overlap_y),
    )

def split_pdf(pdf_path, out_dir, prefix, dpi=300, overlap_ratio=0.04):
    doc = fitz.open(pdf_path)
    os.makedirs(out_dir, exist_ok=True)
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    for page_idx, page in enumerate(doc):
        pix = page.get_pixmap(matrix=mat, alpha=False)
        w, h = pix.width, pix.height
        mw, mh = w // 2, h // 2
        overlap_x = round(w * overlap_ratio)
        overlap_y = round(h * overlap_ratio)
        regions = {
            "TL": (0, 0, mw, mh),
            "TR": (mw, 0, w, mh),
            "BL": (0, mh, mw, h),
            "BR": (mw, mh, w, h),
        }
        for name, (x0, y0, x1, y1) in regions.items():
            x0, y0, x1, y1 = expand_region((x0, y0, x1, y1), w, h, overlap_x, overlap_y)
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
    overlap_ratio = float(sys.argv[4]) if len(sys.argv) > 4 else 0.04
    split_pdf(pdf_path, out_dir, prefix, overlap_ratio=overlap_ratio)
