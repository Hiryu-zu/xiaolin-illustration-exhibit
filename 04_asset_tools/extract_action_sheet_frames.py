import argparse
from pathlib import Path

from PIL import Image, ImageDraw


def parse_indices(value: str, panel_count: int) -> list[int]:
    indices = [int(item.strip()) for item in value.split(",") if item.strip()]
    if not indices:
        raise ValueError("At least one panel number is required.")
    invalid = [index for index in indices if index < 1 or index > panel_count]
    if invalid:
        raise ValueError(f"Panel numbers out of range: {invalid}")
    return indices


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract numbered frames from an evenly divided action sheet."
    )
    parser.add_argument("--input", required=True, help="Input action sheet image.")
    parser.add_argument("--out-dir", required=True, help="Directory for extracted PNGs.")
    parser.add_argument("--panels", required=True, help="Comma-separated panel numbers, e.g. 2,3,4,8.")
    parser.add_argument("--cols", type=int, default=4, help="Number of sheet columns.")
    parser.add_argument("--rows", type=int, default=2, help="Number of sheet rows.")
    parser.add_argument("--inset", type=int, default=2, help="Pixels removed from each panel edge.")
    parser.add_argument(
        "--erase-number",
        action="store_true",
        help="Paint the upper-left number area white after extraction.",
    )
    parser.add_argument("--number-width", type=int, default=70)
    parser.add_argument("--number-height", type=int, default=55)
    args = parser.parse_args()

    input_path = Path(args.input)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    with Image.open(input_path) as source:
        source = source.convert("RGB")
        panel_count = args.cols * args.rows
        indices = parse_indices(args.panels, panel_count)

        for index in indices:
            zero_based = index - 1
            col = zero_based % args.cols
            row = zero_based // args.cols
            left = round(col * source.width / args.cols) + args.inset
            top = round(row * source.height / args.rows) + args.inset
            right = round((col + 1) * source.width / args.cols) - args.inset
            bottom = round((row + 1) * source.height / args.rows) - args.inset
            frame = source.crop((left, top, right, bottom))

            if args.erase_number:
                draw = ImageDraw.Draw(frame)
                draw.rectangle(
                    (0, 0, args.number_width, args.number_height),
                    fill=(255, 255, 255),
                )

            frame.save(out_dir / f"frame_{index:02d}.png")


if __name__ == "__main__":
    main()
