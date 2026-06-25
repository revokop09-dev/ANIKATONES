import os

for root, dirs, files in os.walk('.'):
    # Node.js ke kachre aur hidden files ko bypass karo
    if 'node_modules' in root or '.next' in root or '.git' in root:
        continue
    for file in files:
        # Web dev wali saari files pakdo
        if file.endswith(('.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.mjs', '.env', '.html')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Sudeep Boss ke naye naam replace karo
                content = content.replace('YORSA TUNES', 'ANIKATONES')
                content = content.replace('Yorsa', 'Anikatones')
                content = content.replace('Yukiitune', 'ANIKATONES')
                content = content.replace('HKMUSIC', 'HELL_CODER')
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
            except Exception:
                pass

print("✅ OPERATION SUCCESS: Har jagah ab sirf ANIKATONES ka raaj hai! 🌸")
