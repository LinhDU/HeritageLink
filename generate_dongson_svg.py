import math

def generate_dongson_drum_svg(color="#C8A051", size=600):
    """
    Generates a high-precision authentic Dong Son Bronze Drum face with:
    - 14-point central sun star
    - Triangle sawtooth bands (văn răng cưa)
    - Concentric circles with dots (văn chấm dải)
    - Procession of 8 Chim Lạc birds flying counter-clockwise
    - Outer geometric meander and feather friezes
    """
    cx, cy = size / 2, size / 2
    r_max = size * 0.48
    
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">',
        f'<g fill="none" stroke="{color}" stroke-linecap="round" stroke-linejoin="round">'
    ]
    
    # Outer bounding rings
    svg.append(f'<circle cx="{cx}" cy="{cy}" r="{r_max}" stroke-width="2.5" />')
    svg.append(f'<circle cx="{cx}" cy="{cy}" r="{r_max - 5}" stroke-width="1.2" stroke-dasharray="2,3" />')
    svg.append(f'<circle cx="{cx}" cy="{cy}" r="{r_max - 12}" stroke-width="1.5" />')
    
    # Outer Band 1: Sawtooth / Triangles (văn răng cưa)
    r_outer_saw = r_max - 12
    r_inner_saw = r_max - 24
    num_saw = 48
    saw_d = []
    for i in range(num_saw):
        a1 = i * (2 * math.pi / num_saw)
        a2 = (i + 0.5) * (2 * math.pi / num_saw)
        a3 = (i + 1) * (2 * math.pi / num_saw)
        x1, y1 = cx + r_inner_saw * math.cos(a1), cy + r_inner_saw * math.sin(a1)
        x2, y2 = cx + r_outer_saw * math.cos(a2), cy + r_outer_saw * math.sin(a2)
        x3, y3 = cx + r_inner_saw * math.cos(a3), cy + r_inner_saw * math.sin(a3)
        saw_d.append(f'M {x1:.2f},{y1:.2f} L {x2:.2f},{y2:.2f} L {x3:.2f},{y3:.2f}')
    svg.append(f'<path d="{" ".join(saw_d)}" stroke-width="1" />')
    svg.append(f'<circle cx="{cx}" cy="{cy}" r="{r_inner_saw}" stroke-width="1.5" />')
    
    # Outer Band 2: Tangent Circles with Center Dot (Văn vòng tròn có tiếp tuyến)
    r_circ_band = r_max - 32
    svg.append(f'<circle cx="{cx}" cy="{cy}" r="{r_max - 40}" stroke-width="1.2" />')
    num_tangent = 36
    circ_r = 3.5
    for i in range(num_tangent):
        ang = i * (2 * math.pi / num_tangent)
        c_x = cx + r_circ_band * math.cos(ang)
        c_y = cy + r_circ_band * math.sin(ang)
        svg.append(f'<circle cx="{c_x:.2f}" cy="{c_y:.2f}" r="{circ_r}" stroke-width="0.8" />')
        svg.append(f'<circle cx="{c_x:.2f}" cy="{c_y:.2f}" r="0.8" fill="{color}" />')
    
    # Separator ring
    r_bird_outer = r_max - 44
    r_bird_inner = r_max - 96
    svg.append(f'<circle cx="{cx}" cy="{cy}" r="{r_bird_outer}" stroke-width="1.8" />')
    svg.append(f'<circle cx="{cx}" cy="{cy}" r="{r_bird_inner}" stroke-width="1.8" />')
    
    # MAIN BAND: 8 Flying Chim Lạc (Đàn chim Lạc sải cánh bay)
    # The birds fly counter-clockwise along the circular band
    num_birds = 8
    r_bird_mid = (r_bird_outer + r_bird_inner) / 2
    for b in range(num_birds):
        base_deg = b * (360 / num_birds)
        
        # Local bird path defined in local coords (center at 0,0, facing left/counter-clockwise):
        # Head/Beak to left, long crest backwards, body arc, long sweeping tail feathers
        bird_svg_parts = [
            # Head, long beak, eye
            'M -32,-2 C -24,-6 -14,-7 -4,-5',  # Upper beak and head
            'M -32,-2 C -20,-1 -10,0 2,4',     # Lower beak and throat
            'M -12,-5 C -8,-14 6,-18 22,-14',  # Long crest / mào chim Lạc
            'M -10,-4 C -4,-11 8,-14 24,-11',  # Second crest line
            'M -15,-4 A 1.2 1.2 0 1 1 -15,-3.9', # Eye dot
            # Body & Upper Wing
            'M -4,-5 C 6,-3 14,2 20,6',        # Body top
            'M 2,4 C 8,8 14,9 24,8',           # Belly
            'M 4,-4 C 10,-20 20,-26 38,-28',   # Wing leading edge (swept wing)
            'M 38,-28 C 30,-18 26,-10 24,4',   # Wing trailing edge
            'M 12,-12 C 18,-20 26,-23 34,-24', # Wing feather line 1
            'M 16,-8 C 22,-15 28,-18 32,-19',  # Wing feather line 2
            # Long stylized tail feathers (đuôi chim Lạc dài xòe)
            'M 20,6 C 32,8 44,12 56,15',       # Main upper tail feather
            'M 24,8 C 34,13 46,18 54,23',      # Middle tail feather
            'M 22,7 C 30,11 40,15 50,19',      # Center tail line
            # Trailing legs / chân chim
            'M 12,8 C 16,14 19,19 22,23',
            'M 15,8 C 19,13 22,17 25,21'
        ]
        
        path_combined = " ".join(bird_svg_parts)
        # Position each bird along the circle, rotated tangentially
        svg.append(f'<g transform="rotate({base_deg} {cx} {cy}) translate({cx} {cy - r_bird_mid}) scale(0.68)">')
        svg.append(f'<path d="{path_combined}" stroke="{color}" stroke-width="1.3" fill="none" />')
        svg.append('</g>')
    
    # Inner Band 3: Tangent Circles / Sawtooth
    r_inner_band1 = r_bird_inner - 8
    svg.append(f'<circle cx="{cx}" cy="{cy}" r="{r_inner_band1}" stroke-width="1.2" stroke-dasharray="3,3" />')
    r_inner_band2 = r_bird_inner - 18
    svg.append(f'<circle cx="{cx}" cy="{cy}" r="{r_inner_band2}" stroke-width="1.5" />')
    
    # Inner Sawtooth band
    num_inner_saw = 32
    inner_saw_d = []
    for i in range(num_inner_saw):
        a1 = i * (2 * math.pi / num_inner_saw)
        a2 = (i + 0.5) * (2 * math.pi / num_inner_saw)
        a3 = (i + 1) * (2 * math.pi / num_inner_saw)
        x1, y1 = cx + r_inner_band2 * math.cos(a1), cy + r_inner_band2 * math.sin(a1)
        x2, y2 = cx + (r_inner_band2 - 8) * math.cos(a2), cy + (r_inner_band2 - 8) * math.sin(a2)
        x3, y3 = cx + r_inner_band2 * math.cos(a3), cy + r_inner_band2 * math.sin(a3)
        inner_saw_d.append(f'M {x1:.2f},{y1:.2f} L {x2:.2f},{y2:.2f} L {x3:.2f},{y3:.2f}')
    svg.append(f'<path d="{" ".join(inner_saw_d)}" stroke-width="1" />')
    
    r_sun_band = r_inner_band2 - 14
    svg.append(f'<circle cx="{cx}" cy="{cy}" r="{r_sun_band}" stroke-width="1.5" />')
    
    # Central 14-Point Sun Star (Ngôi sao mặt trời 14 cánh)
    num_rays = 14
    r_ray_tip = r_sun_band
    r_ray_base = r_sun_band * 0.35
    sun_poly = []
    for i in range(num_rays):
        # Ray tip
        a_tip = i * (2 * math.pi / num_rays)
        xt, yt = cx + r_ray_tip * math.cos(a_tip), cy + r_ray_tip * math.sin(a_tip)
        # Valley between rays
        a_val = (i + 0.5) * (2 * math.pi / num_rays)
        xv, yv = cx + r_ray_base * math.cos(a_val), cy + r_ray_base * math.sin(a_val)
        sun_poly.append(f'{xt:.2f},{yt:.2f}')
        sun_poly.append(f'{xv:.2f},{yv:.2f}')
    
    # Fill sun star with subtle antique gold
    svg.append(f'<polygon points="{" ".join(sun_poly)}" fill="{color}" fill-opacity="0.22" stroke="{color}" stroke-width="1.4" />')
    
    # Central center core circle
    svg.append(f'<circle cx="{cx}" cy="{cy}" r="{r_ray_base * 0.6}" fill="{color}" fill-opacity="0.3" stroke="{color}" stroke-width="1.2" />')
    svg.append(f'<circle cx="{cx}" cy="{cy}" r="{r_ray_base * 0.25}" fill="{color}" stroke="none" />')
    
    # Decorative feathers between sun rays
    for i in range(num_rays):
        a_val = (i + 0.5) * (2 * math.pi / num_rays)
        a_tip1 = i * (2 * math.pi / num_rays)
        a_tip2 = (i + 1) * (2 * math.pi / num_rays)
        x_val, y_val = cx + r_ray_base * math.cos(a_val), cy + r_ray_base * math.sin(a_val)
        x_mid, y_mid = cx + (r_ray_tip * 0.82) * math.cos(a_val), cy + (r_ray_tip * 0.82) * math.sin(a_val)
        svg.append(f'<line x1="{x_val:.2f}" y1="{y_val:.2f}" x2="{x_mid:.2f}" y2="{y_mid:.2f}" stroke="{color}" stroke-width="0.8" />')
    
    svg.append('</g>')
    svg.append('</svg>')
    return '\n'.join(svg)

def generate_flying_chim_lac_svg(color="#C8A051", width=240, height=120):
    """
    Generates a single standalone horizontal Chim Lạc in majestic flight.
    """
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120" width="{width}" height="{height}">',
        f'<g fill="none" stroke="{color}" stroke-linecap="round" stroke-linejoin="round" transform="translate(15, 20)">',
        # Head & Bill
        '<path d="M 10,40 C 22,34 38,32 52,36" stroke-width="2" />',
        '<path d="M 10,40 C 28,42 44,45 60,50" stroke-width="1.5" />',
        '<circle cx="36" cy="36" r="2.2" fill="' + color + '" />',
        # Plumed crest (Mào chim Lạc đặc trưng)
        '<path d="M 40,34 C 48,18 70,12 96,16" stroke-width="2" />',
        '<path d="M 44,35 C 52,22 72,17 94,21" stroke-width="1.4" />',
        '<path d="M 48,36 C 58,26 76,23 92,26" stroke-width="1" />',
        # Body & Wings
        '<path d="M 52,36 C 70,39 88,48 100,56" stroke-width="2" />',
        '<path d="M 60,50 C 72,56 86,58 104,56" stroke-width="1.6" />',
        # Sweeping wing aloft (Cánh sải dài vút)
        '<path d="M 65,37 C 78,12 98,2 128,0" stroke-width="2.2" />',
        '<path d="M 128,0 C 114,14 106,28 104,50" stroke-width="1.8" />',
        '<path d="M 80,24 C 92,12 108,8 122,7" stroke-width="1.3" />',
        '<path d="M 88,28 C 98,18 112,15 120,15" stroke-width="1" />',
        '<path d="M 94,34 C 102,26 114,23 118,22" stroke-width="0.9" />',
        # Second lower wing
        '<path d="M 80,48 C 96,44 116,42 138,44" stroke-width="1.5" />',
        '<path d="M 138,44 C 126,52 118,58 112,65" stroke-width="1.3" />',
        # Graceful trailing tail feathers (Đuôi chim Lạc xòe dài)
        '<path d="M 100,56 C 124,60 156,66 186,72" stroke-width="2.2" />',
        '<path d="M 104,56 C 128,66 158,76 182,86" stroke-width="1.8" />',
        '<path d="M 102,57 C 122,64 150,71 176,78" stroke-width="1.3" />',
        '<path d="M 104,59 C 120,68 144,77 168,85" stroke-width="1" />',
        # Trailing claws
        '<path d="M 86,56 C 94,66 102,74 108,82" stroke-width="1.6" />',
        '<path d="M 92,57 C 100,67 106,75 112,83" stroke-width="1.4" />',
        '</g>',
        '</svg>'
    ]
    return '\n'.join(svg)

def generate_chim_lac_frieze_svg(color="#C8A051", width=800, height=50):
    """
    Generates a seamless horizontal border frieze with stylized flying Chim Lạc and Dong Son geometric bands.
    """
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
        f'<g fill="none" stroke="{color}" stroke-linecap="round" stroke-linejoin="round">',
        # Top and bottom hairline boundary rules
        f'<line x1="0" y1="4" x2="{width}" y2="4" stroke-width="1.2" />',
        f'<line x1="0" y1="7" x2="{width}" y2="7" stroke-width="0.8" stroke-dasharray="3,3" />',
        f'<line x1="0" y1="{height - 7}" x2="{width}" y2="{height - 7}" stroke-width="0.8" stroke-dasharray="3,3" />',
        f'<line x1="0" y1="{height - 4}" x2="{width}" y2="{height - 4}" stroke-width="1.2" />'
    ]
    
    # Repeat birds across width
    step = 200
    num = int(width / step) + 1
    for k in range(num):
        ox = k * step
        bird = [
            f'<g transform="translate({ox + 20}, {height/2 - 10}) scale(0.38)">',
            '<path d="M 10,40 C 22,34 38,32 52,36" stroke-width="2" />',
            '<path d="M 10,40 C 28,42 44,45 60,50" stroke-width="1.5" />',
            '<circle cx="36" cy="36" r="2.2" fill="' + color + '" />',
            '<path d="M 40,34 C 48,18 70,12 96,16" stroke-width="2" />',
            '<path d="M 52,36 C 70,39 88,48 100,56" stroke-width="2" />',
            '<path d="M 65,37 C 78,12 98,2 128,0" stroke-width="2.2" />',
            '<path d="M 128,0 C 114,14 106,28 104,50" stroke-width="1.8" />',
            '<path d="M 100,56 C 124,60 156,66 186,72" stroke-width="2.2" />',
            '<path d="M 104,56 C 128,66 158,76 182,86" stroke-width="1.8" />',
            '</g>'
        ]
        svg.append('\n'.join(bird))
        
        # Intermediary Dong Son meander / sun motif
        sx = ox + 140
        sy = height / 2
        svg.append(f'<circle cx="{sx}" cy="{sy}" r="5" stroke-width="1" />')
        svg.append(f'<circle cx="{sx}" cy="{sy}" r="1.5" fill="{color}" />')
        svg.append(f'<line x1="{sx - 12}" y1="{sy}" x2="{sx - 7}" y2="{sy}" stroke-width="1" />')
        svg.append(f'<line x1="{sx + 7}" y1="{sy}" x2="{sx + 12}" y2="{sy}" stroke-width="1" />')
        
    svg.append('</g>')
    svg.append('</svg>')
    return '\n'.join(svg)

if __name__ == '__main__':
    # 1. Gold Drum Watermark (for Dark Green backgrounds like Hero and Movement)
    drum_gold = generate_dongson_drum_svg("#DFB847", 700)
    with open("images/dongson-drum-gold.svg", "w", encoding="utf-8") as f:
        f.write(drum_gold)
        
    # 2. Bronze / Dark Ink Drum Watermark (for Light Do Paper backgrounds like Body and Categories)
    drum_bronze = generate_dongson_drum_svg("#B38A38", 700)
    with open("images/dongson-drum-bronze.svg", "w", encoding="utf-8") as f:
        f.write(drum_bronze)
        
    # 3. Flying Chim Lạc standalone
    chim_lac = generate_flying_chim_lac_svg("#DFB847", 260, 130)
    with open("images/chim-lac-gold.svg", "w", encoding="utf-8") as f:
        f.write(chim_lac)

    chim_lac_bronze = generate_flying_chim_lac_svg("#B38A38", 260, 130)
    with open("images/chim-lac-bronze.svg", "w", encoding="utf-8") as f:
        f.write(chim_lac_bronze)
        
    # 4. Frieze border band
    frieze = generate_chim_lac_frieze_svg("#C8A051", 800, 40)
    with open("images/chim-lac-frieze.svg", "w", encoding="utf-8") as f:
        f.write(frieze)
        
    print("Dong Son Bronze Drum & Chim Lac SVG assets created successfully!")
