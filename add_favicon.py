import os
import glob
import re

html_files = glob.glob("*.html")
favicon_tag = '<link rel="icon" type="image/jpeg" href="logo.jpeg">\n'

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add favicon if not present
    if "rel=\"icon\"" not in content:
        content = content.replace("</head>", f"    {favicon_tag}</head>")

    # Update title to exactly what user wants for the main pages
    if filepath in ["index.html", "hero.html", "about.html"]:
        content = re.sub(r'<title>.*?</title>', '<title>Pall &amp; Pearl</title>', content, flags=re.IGNORECASE)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Favicon and titles updated.")
