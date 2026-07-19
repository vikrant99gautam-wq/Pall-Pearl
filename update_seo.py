import os
import re

seo_data = {
    "collection.html": ("Collections | Pall and Pearl", "Explore our exclusive collections of premium women's clothing, ethnic wear, dresses, and more at Pall and Pearl."),
    "best-sellers.html": ("Best Sellers - Trending Women's Fashion | Pall and Pearl", "Shop our most loved and trending women's fashion pieces. Discover the best sellers at Pall and Pearl."),
    "new-arrivals.html": ("New Arrivals - Latest Women's Fashion | Pall and Pearl", "Check out the newest arrivals in women's clothing. Upgrade your wardrobe with the latest styles from Pall and Pearl."),
    "sale.html": ("Sale - Offers on Women's Clothing | Pall and Pearl", "Grab the best deals on premium women's clothing. Shop ethnic wear, dresses, and tops on sale at Pall and Pearl."),
    "dresses.html": ("Premium Dresses for Women | Pall and Pearl", "Discover a stunning collection of premium dresses for women. Perfect for every occasion, exclusively at Pall and Pearl."),
    "tops.html": ("Stylish Tops & Shirts for Women | Pall and Pearl", "Shop stylish and comfortable tops, shirts, and tunics for women at Pall and Pearl. Upgrade your everyday look."),
    "bottom-wear.html": ("Women's Bottom Wear - Pants, Palazzos & Skirts | Pall and Pearl", "Find the perfect fit with our collection of women's bottom wear including pants, palazzos, and skirts at Pall and Pearl."),
    "coord-sets.html": ("Trendy Co-ord Sets for Women | Pall and Pearl", "Shop matching co-ord sets for women. Effortlessly stylish and comfortable premium sets at Pall and Pearl."),
    "ethnic-wear.html": ("Premium Ethnic Wear & Suits | Pall and Pearl", "Embrace tradition with our premium ethnic wear collection for women. Shop kurtas, suits, and more at Pall and Pearl."),
    "festive-collection.html": ("Festive Collection - Special Occasion Wear | Pall and Pearl", "Shine this festive season with our exclusive festive collection. Premium traditional wear for women at Pall and Pearl."),
    "kurtis.html": ("Designer Kurtis & Tunics | Pall and Pearl", "Shop beautifully crafted designer kurtis and tunics for women. Perfect blend of comfort and style at Pall and Pearl."),
    "summer-collection.html": ("Summer Collection - Breezy & Light Fashion | Pall and Pearl", "Beat the heat with our summer collection. Lightweight, breathable, and stylish women's clothing at Pall and Pearl."),
    "about.html": ("About Us | Pall and Pearl", "Learn more about Pall and Pearl. We are dedicated to providing premium quality women's fashion and ethnic wear."),
    "cart.html": ("Shopping Cart | Pall and Pearl", "Review your selected items in the shopping cart and proceed to checkout at Pall and Pearl."),
    "checkout.html": ("Secure Checkout | Pall and Pearl", "Complete your purchase securely. Fast and safe checkout process at Pall and Pearl."),
    "product-detail.html": ("Premium Women's Clothing | Pall and Pearl", "View product details, fabric information, and sizes for our premium women's clothing at Pall and Pearl.")
}

directory = "."

for filename, (title, desc) in seo_data.items():
    filepath = os.path.join(directory, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        replacement = f'<title>{title}</title>\n<meta name="description" content="{desc}">\n<meta name="keywords" content="Pall and Pearl, women fashion, {title.split("|")[0].strip()}">'
        
        new_content = re.sub(r'<title>.*?</title>', replacement, content, flags=re.IGNORECASE)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated SEO tags in {filename}")

print("Done updating SEO tags!")
