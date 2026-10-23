"""Render the CV PDF's pages to PNGs for the CV viewer (public/cv/page-N.png).

Run after replacing the PDF: python scripts/cv-pages.py  (needs: pip install pymupdf)
"""
from pathlib import Path

import pymupdf

cv = Path(__file__).resolve().parent.parent / "public" / "cv"
doc = pymupdf.open(cv / "Habib-Ahmed-Wasi-CV.pdf")
for i, page in enumerate(doc, start=1):
    # 2.5x a 595 pt A4 page is ~1490 px wide: sharp at the viewer's width on a 2x screen.
    page.get_pixmap(matrix=pymupdf.Matrix(2.5, 2.5)).save(cv / f"page-{i}.png")
    print(f"page-{i}.png")
