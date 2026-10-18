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
    letter_spacing=1.12
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
    total_angle = total_arc_len / radius
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

def generate_master_seal(font_name='brygada', font_size=150):
    src_path = 'temp_extracted/HeritageLink_con-dau_4000px.png'
    img = Image.open(src_path).convert('RGBA')
    
    # 1. Clean the text track (from r=1465 to r=1748)
    # Using a mask for clean circular band
    mask = Image.new('L', (4000, 4000), 0)
    m_draw = ImageDraw.Draw(mask)
    # Outer bound of text track: r=1748
    m_draw.ellipse((2000 - 1748, 2000 - 1748, 2000 + 1748, 2000 + 1748), fill=255)
    # Inner bound of text track: r=1465
    m_draw.ellipse((2000 - 1465, 2000 - 1465, 2000 + 1465, 2000 + 1465), fill=0)
    
    # Fill green background
    green_bg = Image.new('RGBA', (4000, 4000), (29, 59, 53, 255))
    img.paste(green_bg, (0, 0), mask)
    
    # Redraw crisp inner and outer gold rings
    draw = ImageDraw.Draw(img)
    # Inner gold ring: r=1455, thickness 20
    draw.ellipse((2000 - 1455, 2000 - 1455, 2000 + 1455, 2000 + 1455), outline=(217, 164, 65, 255), width=20)
    # Outer gold ring: r=1762, thickness 24
    draw.ellipse((2000 - 1762, 2000 - 1762, 2000 + 1762, 2000 + 1762), outline=(217, 164, 65, 255), width=24)
    
    # 2. Render Curved Text
    font_path = f'fonts_cache/{font_name}.ttf'
    font = ImageFont.truetype(font_path, font_size)
    
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
        
    out_path = f'fonts_cache/master_seal_{font_name}.png'
    img.save(out_path, format='PNG')
    print(f'Saved {out_path}')
    
    # Also save a 1000px preview
    preview = img.resize((1000, 1000), Image.Resampling.LANCZOS)
    preview.save(f'fonts_cache/preview_{font_name}.png')
    print(f'Saved preview_{font_name}.png')

generate_master_seal('brygada', 148)
