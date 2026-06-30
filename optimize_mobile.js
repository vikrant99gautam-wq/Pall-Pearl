const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'hero.html',
    'index.html',
    'tops.html',
    'kurtis.html',
    'dresses.html',
    'coord-sets.html',
    'bottom-wear.html',
    'ethnic-wear.html',
    'new-arrivals.html',
    'sale.html',
    'summer-collection.html',
    'festive-collection.html',
    'best-sellers.html',
    'collection.html',
    'product-detail.html',
    'cart.html',
    'wishlist.html'
];

const mobileMenuHtml = `
<!-- Mobile Menu Overlay -->
<div id="mobile-menu-overlay" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] hidden opacity-0 transition-opacity duration-300"></div>

<!-- Mobile Menu Drawer -->
<div id="mobile-menu-drawer" class="fixed top-0 left-0 w-[80%] max-w-sm h-full bg-surface-container-lowest z-[70] transform -translate-x-full transition-transform duration-300 shadow-2xl flex flex-col">
    <div class="flex justify-between items-center p-6 border-b border-outline-variant/30">
        <a href="hero.html" class="font-display-lg-mobile text-primary text-2xl tracking-tighter">Pall &amp; Pearl</a>
        <button id="close-mobile-menu" class="text-on-surface-variant hover:text-primary transition-colors">
            <span class="material-symbols-outlined text-[28px]">close</span>
        </button>
    </div>
    <div class="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-6">
        <a href="collection.html" class="text-on-surface font-headline-lg-mobile text-xl hover:text-primary transition-colors">Collections</a>
        <a href="new-arrivals.html" class="text-on-surface font-headline-lg-mobile text-xl hover:text-primary transition-colors">New Arrivals</a>
        <a href="tops.html" class="text-on-surface font-headline-lg-mobile text-xl hover:text-primary transition-colors">Tops</a>
        <a href="kurtis.html" class="text-on-surface font-headline-lg-mobile text-xl hover:text-primary transition-colors">Kurtis</a>
        <a href="dresses.html" class="text-on-surface font-headline-lg-mobile text-xl hover:text-primary transition-colors">Dresses</a>
        <a href="coord-sets.html" class="text-on-surface font-headline-lg-mobile text-xl hover:text-primary transition-colors">Co-ord Sets</a>
        <a href="hero.html" class="text-on-surface font-headline-lg-mobile text-xl hover:text-primary transition-colors">About</a>
    </div>
    <div class="p-6 border-t border-outline-variant/30 bg-surface-container-low">
        <p class="font-label-sm uppercase text-on-surface-variant tracking-wider">Dreamy Silhouettes &amp; Conscious Craftsmanship</p>
    </div>
</div>
<script src="mobile-menu.js"></script>
</body>`;

for (const filename of filesToUpdate) {
    const filePath = path.join(__dirname, filename);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // 1. Add ID to hamburger button
        const oldBtn = '<button class="md:hidden text-primary dark:text-primary-fixed hover:opacity-70 transition-opacity duration-300">';
        const newBtn = '<button id="mobile-menu-btn" class="md:hidden text-primary dark:text-primary-fixed hover:opacity-70 transition-opacity duration-300">';
        if (content.includes(oldBtn)) {
            content = content.replace(oldBtn, newBtn);
            modified = true;
        }

        // Handle another common format of hamburger button
        const oldBtn2 = '<button class="md:hidden text-primary hover:opacity-70 transition-opacity duration-300">';
        const newBtn2 = '<button id="mobile-menu-btn" class="md:hidden text-primary hover:opacity-70 transition-opacity duration-300">';
        if (content.includes(oldBtn2)) {
            content = content.replace(oldBtn2, newBtn2);
            modified = true;
        }

        // 2. Change masonry grid columns
        const oldGrid = `        .masonry-grid {
            column-count: 1;
            column-gap: 24px;
        }`;
        const newGrid = `        .masonry-grid {
            column-count: 2;
            column-gap: 16px;
        }`;
        if (content.includes(oldGrid)) {
            content = content.replace(oldGrid, newGrid);
            modified = true;
        }

        // A single line format
        if (content.match(/column-count:\s*1;\s*column-gap:\s*24px;/)) {
            content = content.replace(/column-count:\s*1;\s*column-gap:\s*24px;/, 'column-count: 2; column-gap: 16px;');
            modified = true;
        }

        // 3. Inject Mobile Menu if not already present
        if (!content.includes('id="mobile-menu-overlay"')) {
            // Replace the closing body tag
            content = content.replace('</body>', mobileMenuHtml);
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Optimized for mobile: ${filename}`);
        } else {
            console.log(`No matching patterns in: ${filename}`);
        }
    }
}
