import argparse
from pathlib import Path

from PIL import Image, ImageOps


def fit_frame(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    image = ImageOps.exif_transpose(image).convert("RGBA")
    image.thumbnail(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (255, 255, 255, 255))
    x = (size[0] - image.width) // 2
    y = (size[1] - image.height) // 2
    canvas.alpha_composite(image, (x, y))
    return canvas.convert("P", palette=Image.Palette.ADAPTIVE)


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a preview GIF from pose images.")
    parser.add_argument("--frames", nargs="+", required=True, help="Input frame image paths.")
    parser.add_argument("--out", required=True, help="Output GIF path.")
    parser.add_argument("--duration", type=int, default=220, help="Frame duration in milliseconds.")
    parser.add_argument("--width", type=int, default=960, help="Output width.")
    parser.add_argument("--height", type=int, default=540, help="Output height.")
    parser.add_argument("--loop", type=int, default=0, help="GIF loop count. 0 means infinite.")
    args = parser.parse_args()

    frame_paths = [Path(frame) for frame in args.frames]
    missing = [str(path) for path in frame_paths if not path.exists()]
    if missing:
        raise FileNotFoundError("Missing frame files: " + ", ".join(missing))

    size = (args.width, args.height)
    frames = [fit_frame(Image.open(path), size) for path in frame_paths]
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=args.duration,
        loop=args.loop,
        optimize=True,
    )
    print(f"Saved GIF: {out_path}")


if __name__ == "__main__":
    main()

