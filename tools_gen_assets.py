# -*- coding: utf-8 -*-
"""
从客户端原始 myapp/images/icon.ico 生成官网资源：

- assets/img/favicon.ico        多尺寸 ICO（16/32/48/64/128/256），全部 LANCZOS 重采样
- assets/img/apple-touch-icon.png  180×180，原图等比放大
- assets/img/logo.png           透明背景，原图 256×256（供导航栏 / 页脚品牌位用）
- assets/img/og-image.png       1200×630 社交分享图，logo 用原图

不再用 PIL 自行绘制 logo —— 那是错的，会丢掉原品牌图形。
"""
import os
from PIL import Image, ImageDraw, ImageFilter

BASE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(BASE, "assets", "img")
SRC = os.path.normpath(os.path.join(BASE, "..", "myapp", "images", "icon.ico"))
os.makedirs(IMG, exist_ok=True)

FONT_REG = r"C:\Windows\Fonts\msyh.ttc"
FONT_BOLD = r"C:\Windows\Fonts\msyhbd.ttc"

BLUE = (64, 158, 255)
BLUE_D = (42, 111, 212)
ORANGE = (255, 152, 0)
DARK = (11, 14, 20)
TEXT = (232, 237, 246)
TEXT2 = (150, 164, 186)


def font(path, size):
    from PIL import ImageFont
    return ImageFont.truetype(path, size)


def load_src_logo():
    """读取客户端原 icon.ico（128×128 RGBA），并升采样到 256 以便后续缩放更清晰"""
    im = Image.open(SRC).convert("RGBA")
    if im.size != (256, 256):
        im = im.resize((256, 256), Image.LANCZOS)
    return im


def make_favicon():
    """多尺寸 ICO（16/32/48/64/128/256）"""
    src = load_src_logo()
    sizes = [16, 32, 48, 64, 128, 256]
    out = os.path.join(IMG, "favicon.ico")
    src.save(out, format="ICO", sizes=[(s, s) for s in sizes])
    print("favicon.ico ->", out, os.path.getsize(out), "bytes")


def make_apple_icon():
    """180×180，保留原图内容（不做圆角 —— iOS 会自动遮罩）"""
    src = load_src_logo()
    out = os.path.join(IMG, "apple-touch-icon.png")
    src.resize((180, 180), Image.LANCZOS).save(out, "PNG", optimize=True)
    print("apple-touch-icon.png ->", out, os.path.getsize(out), "bytes")


def make_logo_png():
    """导航栏 / 页脚品牌位用的 PNG（256 透明）"""
    src = load_src_logo()
    out = os.path.join(IMG, "logo.png")
    src.save(out, "PNG", optimize=True)
    print("logo.png ->", out, os.path.getsize(out), "bytes")


def make_favicon_png():
    """现代浏览器优先用 SVG/PNG favicon，这里提供一份 64×64 PNG"""
    src = load_src_logo()
    out = os.path.join(IMG, "favicon.png")
    src.resize((64, 64), Image.LANCZOS).save(out, "PNG", optimize=True)
    print("favicon.png ->", out, os.path.getsize(out), "bytes")


def glow(canvas, box, color, blur):
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse(box, fill=color)
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(layer)


def make_og():
    W, H = 1200, 630
    img = Image.new("RGBA", (W, H), DARK + (255,))

    # 背景光晕
    glow(img, (-220, -300, 620, 340), BLUE + (90,), 130)
    glow(img, (820, -140, 1420, 460), ORANGE + (55,), 130)
    glow(img, (420, 380, 1080, 900), BLUE_D + (45,), 150)

    d = ImageDraw.Draw(img)

    # 细网格
    for x in range(0, W, 60):
        d.line([(x, 0), (x, H)], fill=(255, 255, 255, 6), width=1)
    for y in range(0, H, 60):
        d.line([(0, y), (W, y)], fill=(255, 255, 255, 6), width=1)

    # Logo —— 直接贴客户端原图
    logo = load_src_logo().resize((168, 168), Image.LANCZOS)
    img.alpha_composite(logo, (88, 92))

    f_big = font(FONT_BOLD, 66)
    f_sub = font(FONT_REG, 34)
    f_small = font(FONT_REG, 25)
    f_tag = font(FONT_REG, 22)

    d.text((88, 286), "魔琴 MagicalPiano", font=f_big, fill=TEXT + (255,))
    d.text((88, 372), "把 MIDI，变成游戏里的琴键", font=f_sub, fill=BLUE + (255,))

    chips = ["17 种游戏按键模式", "云端曲库", "悬浮小窗", "12 调号转调", "Win + Android 双端"]
    x = 88
    y = 432
    for c in chips:
        tw = d.textlength(c, font=f_small)
        bw = int(tw) + 30
        d.rounded_rectangle([x, y, x + bw, y + 46], radius=23,
                            fill=(255, 255, 255, 14), outline=(255, 255, 255, 28), width=1)
        d.text((x + 15, y + 8), c, font=f_small, fill=TEXT2 + (255,))
        x += bw + 12

    d.text((88, 528), "Windows 10+  ·  Android  ·  v3.1.11  ·  简 / 繁 / 英 三语",
           font=f_tag, fill=(120, 134, 156, 255))
    d.line([(88, 510), (W - 88, 510)], fill=(255, 255, 255, 22), width=1)

    out = os.path.join(IMG, "og-image.png")
    img.convert("RGB").save(out, "PNG", optimize=True)
    print("og-image.png ->", out, os.path.getsize(out), "bytes")


if __name__ == "__main__":
    print("源文件:", SRC, "存在:", os.path.exists(SRC))
    make_logo_png()
    make_favicon_png()
    make_favicon()
    make_apple_icon()
    make_og()