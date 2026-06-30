import os
import re

target = r'<a href="auth\.html" class="nav-profile-link hover:opacity-80 transition-opacity duration-300"[^>]*>\s*<span class="material-symbols-outlined">person</span>\s*</a>'

count = 0
for file in os.listdir('.'):
    if file.endswith('.html'):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content, num_subs = re.subn(target, '', content)
        if num_subs > 0:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Fixed: {file}")

print(f"Total files fixed: {count}")
