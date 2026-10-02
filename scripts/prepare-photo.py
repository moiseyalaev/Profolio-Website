#!/usr/bin/env python3
"""Export a photo for the site: 1600px and 640px JPEGs with all metadata (including GPS) removed.

Usage: prepare-photo.py <original> <slug>   ->  imgs/album/<slug>-1600.jpg and <slug>-640.jpg
Requires Pillow.
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps

src, slug = sys.argv[1], sys.argv[2]
out = Path(__file__).resolve().parent.parent / "imgs" / "album"
out.mkdir(parents=True, exist_ok=True)
img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
for size, quality in ((1600, 82), (640, 78)):
    copy = img.copy()
    copy.thumbnail((size, size), Image.LANCZOS)
    clean = Image.new("RGB", copy.size)  # fresh image, so no EXIF is carried over
    clean.paste(copy)
    clean.save(out / f"{slug}-{size}.jpg", "JPEG", quality=quality, optimize=True, progressive=True)
    print(out / f"{slug}-{size}.jpg", clean.size)
