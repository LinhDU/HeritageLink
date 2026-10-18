import math, os
from PIL import Image, ImageDraw, ImageFont

def draw_star(draw, cx, cy, r_outer, r_inner, fill):
    points = [
        (cx, cy - r_outer),
        (cx + r_inner, cy),
        (cx, cy + r_outer),
        (cx - r_inner, cy)
    ]
    draw.polygon(points, fill=fill)

def render_curved_text(
    base_img,
    text,
    font,
    center,
    radius,
    center_angle_deg,
    color=(217, 164, 65, 255),
    is_top=True,
    letter_spacing=1.14
):
    cx, cy = center
    dummy_img = Image.new('RGBA', (100, 100))
    dummy_draw = ImageDraw.Draw(dummy_img)
    
    char_widths = []
    for ch in text:
        bbox = dummy_draw.textbbox((0, 0), ch, font=font)
        w = (bbox[2] - bbox[0]) * letter_spacing
        char_widths.append(max(w, font.size * 0.38 * letter_spacing if ch == ' ' else w))
        
    total_arc_len = sum(char_widths)
    current_arc = -total_arc_len / 2.0
    
    for i, ch in enumerate(text):
        cw = char_widths[i]
        mid_arc = current_arc + cw / 2.0
        current_arc += cw
        
        if is_top:
            theta = math.radians(center_angle_deg) + (mid_arc / radius)
            rot_deg = -math.degrees(theta)
        else:
            theta = math.radians(center_angle_deg) - (mid_arc / radius)
            rot_deg = -math.degrees(theta) + 180
            
        char_x = cx + radius * math.sin(theta)
        char_y = cy - radius * math.cos(theta)
        
        bbox = dummy_draw.textbbox((0, 0), ch, font=font)
        bw = max(1, bbox[2] - bbox[0] + 60)
        bh = max(1, bbox[3] - bbox[1] + 60)
        
        char_img = Image.new('RGBA', (int(bw * 2), int(bh * 2)), (0, 0, 0, 0))
        c_draw = ImageDraw.Draw(char_img)
        ox = bw - (bbox[2] - bbox[0]) / 2.0 - bbox[0]
        oy = bh - (bbox[3] - bbox[1]) / 2.0 - bbox[1]
        c_draw.text((ox, oy), ch, font=font, fill=color)
        
        rotated = char_img.rotate(rot_deg, resample=Image.Resampling.BICUBIC, expand=True)
        rw, rh = rotated.size
        
        base_img.alpha_composite(rotated, (int(char_x - rw / 2), int(char_y - rh / 2)))

def build_seal_master():
    print("Building Master Circular Seal (4000x4000)...")
    src_path = 'temp_extracted/HeritageLink_con-dau_4000px.png'
    img = Image.open(src_path).convert('RGBA')
    
    # 1. Clean the text track (from r=1465 to r=1748)
    mask = Image.new('L', (4000, 4000), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.ellipse((2000 - 1748, 2000 - 1748, 2000 + 1748, 2000 + 1748), fill=255)
    m_draw.ellipse((2000 - 1465, 2000 - 1465, 2000 + 1465, 2000 + 1465), fill=0)
    
    green_bg = Image.new('RGBA', (4000, 4000), (29, 59, 53, 255))
    img.paste(green_bg, (0, 0), mask)
    
    # Redraw crisp inner and outer gold rings
    draw = ImageDraw.Draw(img)
    draw.ellipse((2000 - 1455, 2000 - 1455, 2000 + 1455, 2000 + 1455), outline=(217, 164, 65, 255), width=20)
    draw.ellipse((2000 - 1762, 2000 - 1762, 2000 + 1762, 2000 + 1762), outline=(217, 164, 65, 255), width=24)
    
    # 2. Render Curved Text in traditional font Brygada 1918
    font = ImageFont.truetype('fonts_cache/brygada.ttf', 148)
    r_text = 1607
    
    # Top arc
    render_curved_text(
        img,
        "LƯU GIỮ HỒN CỐT DI SẢN",
        font,
        center=(2000, 2000),
        radius=r_text,
        center_angle_deg=0,
        color=(217, 164, 65, 255),
        is_top=True,
        letter_spacing=1.14
    )
    
    # Bottom arc
    render_curved_text(
        img,
        "KẾT NỐI NHỊP SỐNG NGÀN NĂM",
        font,
        center=(2000, 2000),
        radius=r_text,
        center_angle_deg=180,
        color=(217, 164, 65, 255),
        is_top=False,
        letter_spacing=1.14
    )
    
    # 3. Side Stars (2 on each side)
    for angle_deg in [78, 102, 258, 282]:
        theta = math.radians(angle_deg)
        sx = 2000 + r_text * math.sin(theta)
        sy = 2000 - r_text * math.cos(theta)
        draw_star(draw, sx, sy, r_outer=52, r_inner=20, fill=(217, 164, 65, 255))
        
    # Save master 4000px
    seal_4000_path = 'temp_extracted/HeritageLink_con-dau_4000px.png'
    img.save(seal_4000_path, format='PNG')
    print("Saved updated", seal_4000_path)
    
    # Save icon versions
    icon_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512.save('images/logo-icon.png', format='PNG')
    print("Saved images/logo-icon.png (512x512)")
    
    icon_256 = img.resize((256, 256), Image.Resampling.LANCZOS)
    icon_256.save('favicon.png', format='PNG')
    print("Saved favicon.png (256x256)")
    
    return img

def build_horizontal_master(slogan="LƯU GIỮ HỒN CỐT DI SẢN  •  KẾT NỐI NHỊP SỐNG NGÀN NĂM"):
    print("Building Master Horizontal Logos (5428x1520)...")
    for is_dark in [False, True]:
        src_file = 'temp_extracted/HeritageLink_logo-ngang_cho-nen-toi.png' if is_dark else 'temp_extracted/HeritageLink_logo-ngang.png'
        img = Image.open(src_file).convert('RGBA')
        
        # Clear old slogan below y=1000
        empty_block = Image.new('RGBA', (5428 - 1450, 1400 - 1000), (0, 0, 0, 0))
        img.paste(empty_block, (1450, 1000))
        
        # Render new slogan
        font = ImageFont.truetype('fonts_cache/brygada.ttf', 105)
        gold_color = (217, 164, 65, 255)
        
        hl_left = 1680
        hl_right = 5330
        hl_width = hl_right - hl_left
        target_width = hl_width
        
        dummy = Image.new('RGBA', (100, 100))
        dd = ImageDraw.Draw(dummy)
        base_chars_w = sum((dd.textbbox((0, 0), ch, font=font)[2] - dd.textbbox((0, 0), ch, font=font)[0]) for ch in slogan)
        total_spaces = len(slogan) - 1
        extra_per_char = (target_width - base_chars_w) / max(1, total_spaces)
        extra_per_char = max(10, min(extra_per_char, 60))
        
        cur_x = 0
        char_positions = []
        for ch in slogan:
            bw = dd.textbbox((0, 0), ch, font=font)
            w = bw[2] - bw[0]
            char_positions.append((ch, cur_x, bw[0]))
            cur_x += w + extra_per_char
        total_w = cur_x - extra_per_char
        
        start_x = hl_left + (hl_width - total_w) / 2
        baseline_y = 1070
        
        draw = ImageDraw.Draw(img)
        for ch, x_offset, x_bearing in char_positions:
            draw.text((start_x + x_offset - x_bearing, baseline_y), ch, font=font, fill=gold_color)
            
        # Save master horizontal
        img.save(src_file, format='PNG')
        print("Saved master horizontal:", src_file)
        
        # Save web versions
        if not is_dark:
            web_logo = img.resize((1024, int(1024 * 1520 / 5428)), Image.Resampling.LANCZOS)
            web_logo.save('images/logo.png', format='PNG')
            web_logo.save('images/logo-transparent.png', format='PNG')
            print("Saved images/logo.png & logo-transparent.png")
        else:
            web_dark = img.resize((1024, int(1024 * 1520 / 5428)), Image.Resampling.LANCZOS)
            web_dark.save('images/logo-white.png', format='PNG')
            print("Saved images/logo-white.png")

if __name__ == '__main__':
    build_seal_master()
    build_horizontal_master()
    print("ALL BRAND ASSETS SUCCESSFULLY GENERATED!")
