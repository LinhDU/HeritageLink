import glob, re

output_lines = []
for fname in sorted(glob.glob('*.html')):
    with open(fname, 'r', encoding='utf-8') as f:
        text = f.read()
    
    matches = re.findall(r'<[^>]*class="[^"]*(?:icon|flaticon|icofont)[^"]*"[^>]*>', text)
    emoji_matches = re.findall(r'[\U00010000-\U0010ffff]|[\u2600-\u27bf]|[\u2300-\u23ff]|[\u2b50]', text)
    
    output_lines.append(f"=== {fname} ===")
    output_lines.append(f"  Icon class tags: {len(matches)}")
    for m in matches:
        if 'logo-icon' not in m: # Ignore brand logo icon
            output_lines.append(f"    {m}")
    output_lines.append(f"  Emoji count: {len(emoji_matches)}")
    for em in sorted(set(emoji_matches)):
        output_lines.append(f"    Emoji: {em}")

with open('icons_report.txt', 'w', encoding='utf-8') as out:
    out.write('\n'.join(output_lines))

print("icons_report.txt written successfully.")
