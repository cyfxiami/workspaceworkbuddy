from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


def lerp(start: int, end: int, t: float) -> int:
    return int(start + (end - start) * t)


def build_icon(size: int = 1024) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    # Soft shadow for desktop-app icon depth.
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    inset = int(size * 0.1)
    radius = int(size * 0.22)
    shadow_draw.rounded_rectangle(
        (inset, inset, size - inset, size - inset),
        radius=radius,
        fill=(15, 23, 42, 52),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=int(size * 0.03)))
    canvas.alpha_composite(shadow)

    # Rounded square app plate.
    plate = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    plate_draw = ImageDraw.Draw(plate)
    for y in range(size):
        t = y / (size - 1)
        color = (
            lerp(255, 250, t),
            lerp(255, 246, t),
            lerp(255, 236, t),
            255,
        )
        plate_draw.line((0, y, size, y), fill=color)

    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(
        (inset, inset, size - inset, size - inset),
        radius=radius,
        fill=255,
    )
    canvas.alpha_composite(Image.composite(plate, Image.new("RGBA", (size, size)), mask))

    # Gold border.
    border_draw = ImageDraw.Draw(canvas)
    border_draw.rounded_rectangle(
        (inset, inset, size - inset, size - inset),
        radius=radius,
        outline=(201, 169, 110, 120),
        width=max(2, int(size * 0.007)),
    )

    # Three rounded bars.
    chart_left = int(size * 0.30)
    chart_bottom = int(size * 0.70)
    bar_width = int(size * 0.10)
    gap = int(size * 0.08)
    bar_radius = int(size * 0.03)
    bar_specs = [
        (chart_left, int(size * 0.52), (201, 169, 110, 255)),
        (chart_left + bar_width + gap, int(size * 0.42), (155, 127, 212, 255)),
        (chart_left + (bar_width + gap) * 2, int(size * 0.34), (245, 166, 35, 255)),
    ]

    for x, y, fill in bar_specs:
        border_draw.rounded_rectangle(
            (x, y, x + bar_width, chart_bottom),
            radius=bar_radius,
            fill=fill,
        )

    # Base line.
    border_draw.line(
        (
            chart_left - int(size * 0.02),
            chart_bottom + int(size * 0.03),
            chart_left + (bar_width + gap) * 2 + bar_width + int(size * 0.02),
            chart_bottom + int(size * 0.03),
        ),
        fill=(201, 169, 110, 95),
        width=max(2, int(size * 0.006)),
        joint="curve",
    )

    return canvas


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    out_dir = root / "images" / "app-icons"
    out_dir.mkdir(parents=True, exist_ok=True)

    base = build_icon(1024)
    base.save(out_dir / "workbuddy-app-icon-1024.png")

    for icon_size in (512, 256, 128):
        base.resize((icon_size, icon_size), Image.Resampling.LANCZOS).save(
            out_dir / f"workbuddy-app-icon-{icon_size}.png"
        )

    base.save(
        out_dir / "workbuddy-app-icon.ico",
        format="ICO",
        sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )


if __name__ == "__main__":
    main()
