from __future__ import annotations

import argparse
import csv
from collections import deque
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


@dataclass
class CutoutStats:
    source: Path
    output: Path
    width: int
    height: int
    bbox: tuple[int, int, int, int] | None
    transparent_pixels: int
    edge_foreground_pixels: int


def is_bg_pixel(
    rgb: tuple[int, int, int],
    *,
    min_brightness: int,
    max_delta: int,
) -> bool:
    r, g, b = rgb
    return min(r, g, b) >= min_brightness and max(r, g, b) - min(r, g, b) <= max_delta


def exterior_background_mask(
    image: Image.Image,
    *,
    min_brightness: int,
    max_delta: int,
) -> Image.Image:
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    mask = Image.new("L", rgb.size, 0)
    mask_pixels = mask.load()
    queue: deque[tuple[int, int]] = deque()

    def add(x: int, y: int) -> None:
        if mask_pixels[x, y]:
            return
        if not is_bg_pixel(pixels[x, y], min_brightness=min_brightness, max_delta=max_delta):
            return
        mask_pixels[x, y] = 255
        queue.append((x, y))

    for x in range(width):
        add(x, 0)
        add(x, height - 1)
    for y in range(height):
        add(0, y)
        add(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if x > 0:
            add(x - 1, y)
        if x + 1 < width:
            add(x + 1, y)
        if y > 0:
            add(x, y - 1)
        if y + 1 < height:
            add(x, y + 1)

    return mask


def apply_cutout(
    image: Image.Image,
    *,
    min_brightness: int,
    max_delta: int,
    fringe: int,
    feather: float,
    keep_shadow: bool,
) -> Image.Image:
    rgba = ImageOps.exif_transpose(image).convert("RGBA")
    bg_mask = exterior_background_mask(
        rgba,
        min_brightness=min_brightness,
        max_delta=max_delta,
    )

    if not keep_shadow:
        remove_mask = bg_mask
    else:
        # Preserve darker contact shadows by only removing the confident exterior
        # background. The optional fringe still cleans pale anti-aliased edges.
        remove_mask = bg_mask

    if fringe > 0:
        remove_mask = remove_mask.filter(ImageFilter.MaxFilter(fringe * 2 + 1))
    if feather > 0:
        remove_mask = remove_mask.filter(ImageFilter.GaussianBlur(feather))

    alpha = rgba.getchannel("A")
    # Subtract removal mask from alpha.
    remove = remove_mask.load()
    alpha_pixels = alpha.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            alpha_pixels[x, y] = max(0, alpha_pixels[x, y] - remove[x, y])

    rgba.putalpha(alpha)
    return rgba


def trim_to_bbox(image: Image.Image, padding: int) -> Image.Image:
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        return image
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    return image.crop((left, top, right, bottom))


def checker(size: tuple[int, int], cell: int = 16) -> Image.Image:
    width, height = size
    image = Image.new("RGB", size, "white")
    draw = ImageDraw.Draw(image)
    for y in range(0, height, cell):
        for x in range(0, width, cell):
            if (x // cell + y // cell) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=(210, 210, 210))
    return image


def font(size: int) -> ImageFont.ImageFont:
    for path in (
        Path("C:/Windows/Fonts/YuGothR.ttc"),
        Path("C:/Windows/Fonts/YuGothM.ttc"),
    ):
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def make_preview_sheet(stats: list[CutoutStats], preview_path: Path, thumb_w: int = 300, thumb_h: int = 420) -> None:
    if not stats:
        return
    cols = 4
    rows = (len(stats) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * thumb_w, rows * thumb_h), "white")
    draw = ImageDraw.Draw(sheet)
    label_font = font(12)

    for index, item in enumerate(stats):
        with Image.open(item.output) as source:
            cutout = source.convert("RGBA")
        cutout.thumbnail((thumb_w - 20, thumb_h - 74), Image.Resampling.LANCZOS)
        bg = checker((thumb_w - 20, thumb_h - 74), 14).convert("RGBA")
        bg.alpha_composite(cutout, ((bg.width - cutout.width) // 2, (bg.height - cutout.height) // 2))

        base_x = (index % cols) * thumb_w
        base_y = (index // cols) * thumb_h
        sheet.paste(bg.convert("RGB"), (base_x + 10, base_y + 10))
        draw.text((base_x + 10, base_y + thumb_h - 60), item.source.name, fill=(0, 0, 0), font=label_font)
        draw.text(
            (base_x + 10, base_y + thumb_h - 40),
            f"bbox={item.bbox} edge={item.edge_foreground_pixels}",
            fill=(80, 80, 80),
            font=label_font,
        )

    preview_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(preview_path, quality=92)


def edge_foreground_count(alpha: Image.Image) -> int:
    if alpha.mode != "L":
        alpha = alpha.convert("L")
    count = 0
    for x in range(alpha.width):
        if alpha.getpixel((x, 0)):
            count += 1
        if alpha.getpixel((x, alpha.height - 1)):
            count += 1
    for y in range(alpha.height):
        if alpha.getpixel((0, y)):
            count += 1
        if alpha.getpixel((alpha.width - 1, y)):
            count += 1
    return count


def output_name(source: Path, suffix: str) -> str:
    return f"{source.stem}{suffix}.png"


def write_csv(stats: list[CutoutStats], csv_path: Path) -> None:
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "source",
                "output",
                "width",
                "height",
                "bbox",
                "transparent_pixels",
                "edge_foreground_pixels",
            ]
        )
        for item in stats:
            writer.writerow(
                [
                    str(item.source),
                    str(item.output),
                    item.width,
                    item.height,
                    item.bbox,
                    item.transparent_pixels,
                    item.edge_foreground_pixels,
                ]
            )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Remove a plain white/light-gray exterior background from character images."
    )
    parser.add_argument("--inputs", nargs="+", required=True, help="Input image paths or glob patterns.")
    parser.add_argument("--out-dir", required=True, type=Path, help="Directory for transparent PNG outputs.")
    parser.add_argument("--suffix", default="_cutout", help="Suffix added to each output filename.")
    parser.add_argument("--min-brightness", default=198, type=int, help="Minimum RGB channel value treated as background.")
    parser.add_argument("--max-delta", default=28, type=int, help="Maximum RGB channel spread treated as low-saturation background.")
    parser.add_argument("--fringe", default=0, type=int, help="Expand removed background by this many pixels.")
    parser.add_argument("--feather", default=0.0, type=float, help="Feather removed edge alpha by this blur radius.")
    parser.add_argument("--trim", action="store_true", help="Crop output to alpha bounding box.")
    parser.add_argument("--padding", default=24, type=int, help="Padding used with --trim.")
    parser.add_argument("--keep-shadow", action="store_true", help="Preserve non-background contact shadows when possible.")
    parser.add_argument("--preview", type=Path, help="Optional contact sheet preview path.")
    parser.add_argument("--csv", type=Path, help="Optional CSV report path.")
    args = parser.parse_args()

    sources: list[Path] = []
    for raw in args.inputs:
        matches = sorted(Path().glob(raw))
        if matches:
            sources.extend(path for path in matches if path.is_file())
        else:
            path = Path(raw)
            if path.is_file():
                sources.append(path)

    # Preserve order while dropping duplicates.
    seen: set[Path] = set()
    unique_sources: list[Path] = []
    for source in sources:
        resolved = source.resolve()
        if resolved in seen:
            continue
        seen.add(resolved)
        unique_sources.append(source)

    if not unique_sources:
        raise FileNotFoundError("No input images matched.")

    args.out_dir.mkdir(parents=True, exist_ok=True)
    stats: list[CutoutStats] = []

    for source in unique_sources:
        with Image.open(source) as image:
            cutout = apply_cutout(
                image,
                min_brightness=args.min_brightness,
                max_delta=args.max_delta,
                fringe=args.fringe,
                feather=args.feather,
                keep_shadow=args.keep_shadow,
            )
        if args.trim:
            cutout = trim_to_bbox(cutout, args.padding)

        output = args.out_dir / output_name(source, args.suffix)
        cutout.save(output, optimize=True)

        alpha = cutout.getchannel("A")
        hist = alpha.histogram()
        item = CutoutStats(
            source=source,
            output=output,
            width=cutout.width,
            height=cutout.height,
            bbox=alpha.getbbox(),
            transparent_pixels=hist[0],
            edge_foreground_pixels=edge_foreground_count(alpha),
        )
        stats.append(item)
        print(
            f"{source} -> {output} "
            f"size={item.width}x{item.height} bbox={item.bbox} edge={item.edge_foreground_pixels}"
        )

    if args.preview:
        make_preview_sheet(stats, args.preview)
        print(f"preview: {args.preview}")

    if args.csv:
        write_csv(stats, args.csv)
        print(f"csv: {args.csv}")


if __name__ == "__main__":
    main()

