# Convert vng-demo PNGs to WebP. Run: python convert-images.py
# Requires: pip install pillow

from PIL import Image
from pathlib import Path

BASE = Path("images/vng-demo")

targets = [
    ("stills/kf1-the-gate-at-dawn.png", 90, False),
    ("stills/kf2-the-wanderer-enters.png", 90, False),
    ("stills/kf3-path-of-guardians.png", 90, False),
    ("stills/kf4-the-kneeling-moment.png", 90, False),
    ("stills/kf5-after-the-recognition.png", 92, False),  # hero bg + KF5
    ("final/ad-mockup-final.png", 92, False),              # showcase shot
    ("workflow/weave-canvas-full.png", None, True),        # text-heavy = lossless
]

for rel_path, quality, lossless in targets:
    src = BASE / rel_path
    dst = src.with_suffix(".webp")
    if not src.exists():
        print(f"SKIP — not found: {src}")
        continue
    img = Image.open(src)
    if img.mode == "RGBA":
        bg = Image.new("RGB", img.size, (0, 0, 0))
        bg.paste(img, mask=img.split()[-1])
        img = bg
    if lossless:
        img.save(dst, "WEBP", lossless=True, method=6)
    else:
        img.save(dst, "WEBP", quality=quality, method=6)
    src_mb = src.stat().st_size / 1024 / 1024
    dst_mb = dst.stat().st_size / 1024 / 1024
    pct = (1 - dst_mb/src_mb) * 100
    print(f"OK  {rel_path}  {src_mb:.1f}MB -> {dst_mb:.1f}MB  ({pct:.0f}% smaller)")

print("\nDone. Verify .webp files visually before deleting .png.")