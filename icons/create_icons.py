#!/usr/bin/env python3
"""
Generate PNG icons for PWRFlow Notate Chrome extension
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Installing Pillow...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'pillow'])
    from PIL import Image, ImageDraw, ImageFont

def create_icon(size):
    """Create an icon of the specified size"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw gradient background (approximated with solid color)
    radius = int(size * 0.2)
    draw.rounded_rectangle(
        [(0, 0), (size, size)],
        radius=radius,
        fill=(102, 126, 234, 255)  # #667eea
    )

    # Draw pencil emoji or text
    if size >= 48:
        # For larger icons, draw a simple pencil representation
        scale = size / 128

        # Paper rectangle
        paper_x = int(25 * scale)
        paper_y = int(20 * scale)
        paper_w = int(60 * scale)
        paper_h = int(80 * scale)
        draw.rectangle(
            [(paper_x, paper_y), (paper_x + paper_w, paper_y + paper_h)],
            fill=(255, 255, 255, 255)
        )

        # Lines on paper
        for i in range(4):
            y = int((35 + i * 15) * scale)
            draw.line(
                [(int(35 * scale), y), (int(75 * scale), y)],
                fill=(102, 126, 234, 255),
                width=max(1, int(2 * scale))
            )

    # Add emoji text for all sizes
    try:
        # Try to use a font that supports emoji
        font_size = int(size * 0.5)
        font = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", font_size)
        except:
            # Fallback to default
            font = ImageFont.load_default()

    # Draw pencil emoji
    emoji = "📝"

    # Get text size for centering
    bbox = draw.textbbox((0, 0), emoji, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = (size - text_width) // 2
    y = (size - text_height) // 2

    draw.text((x, y), emoji, font=font, embedded_color=True)

    return img

def main():
    """Generate all icon sizes"""
    sizes = [16, 32, 48, 128]

    for size in sizes:
        print(f"Generating {size}x{size} icon...")
        icon = create_icon(size)
        icon.save(f'icon{size}.png', 'PNG')
        print(f"✓ Saved icon{size}.png")

    print("\n✓ All icons generated successfully!")

if __name__ == '__main__':
    main()
