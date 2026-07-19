import os
import glob
import re

html_files = glob.glob("*.html")

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Make the image smaller on mobile
    old_img = 'class="inline-block h-24 w-24 object-cover rounded-full mx-2 align-middle"'
    new_img = 'class="inline-block h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 object-cover rounded-full mx-1 md:mx-2 align-middle"'
    content = content.replace(old_img, new_img)

    # Make the wrapper <a> tag an inline-flex container so it stays on one line
    def replace_a_tag(match):
        a_tag_content = match.group(0)
        if 'class="' in a_tag_content:
            # Replace 'block' if it exists, and add flex classes
            a_tag_content = re.sub(
                r'class="([^"]*)"', 
                lambda m: f'class="{m.group(1).replace("block", "").strip()} inline-flex items-center justify-center whitespace-nowrap"', 
                a_tag_content, 
                count=1
            )
        return a_tag_content

    content = re.sub(r'<a[^>]*>\s*Pall\s*<img src="logo\.jpeg"[^>]*>\s*Pearl\s*</a>', replace_a_tag, content, flags=re.IGNORECASE)
    
    # Check for cases where it's a div instead of a
    def replace_div_tag(match):
        div_tag_content = match.group(0)
        if 'class="' in div_tag_content:
            div_tag_content = re.sub(
                r'class="([^"]*)"', 
                lambda m: f'class="{m.group(1).replace("block", "").strip()} inline-flex items-center justify-center whitespace-nowrap"', 
                div_tag_content, 
                count=1
            )
        return div_tag_content
        
    content = re.sub(r'<div[^>]*>\s*Pall\s*<img src="logo\.jpeg"[^>]*>\s*Pearl\s*</div>', replace_div_tag, content, flags=re.IGNORECASE)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Mobile navbar optimization applied.")
