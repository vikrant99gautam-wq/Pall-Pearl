const fs = require('fs');
const path = require('path');

const filesToUpdate = [
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
    'collection.html'
];

const newFilterBar = `<div class="sticky top-[72px] z-40 glass-panel rounded-xl py-3 px-4 md:px-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
    <div class="flex items-center space-x-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
        <!-- Category -->
        <div class="relative flex items-center group">
            <select id="filter-category" onchange="if(this.value) window.location.href=this.value" class="appearance-none bg-transparent font-label-sm uppercase text-on-surface-variant group-hover:text-primary transition-colors cursor-pointer outline-none pr-6">
                <option value="">CATEGORY</option>
                <option value="collection.html">All Products</option>
                <option value="tops.html">Tops</option>
                <option value="kurtis.html">Kurtis</option>
                <option value="dresses.html">Dresses</option>
                <option value="coord-sets.html">Co-ord Sets</option>
                <option value="bottom-wear.html">Bottom Wear</option>
                <option value="ethnic-wear.html">Ethnic Wear</option>
            </select>
            <span class="material-symbols-outlined text-[18px] absolute right-0 pointer-events-none text-on-surface-variant group-hover:text-primary">keyboard_arrow_down</span>
        </div>
        <div class="w-px h-4 bg-outline-variant/50"></div>
        <!-- Color -->
        <div class="relative flex items-center group">
            <select id="filter-color" class="appearance-none bg-transparent font-label-sm uppercase text-on-surface-variant group-hover:text-primary transition-colors cursor-pointer outline-none pr-6">
                <option value="">COLOR (ALL)</option>
                <option value="black">Black</option>
                <option value="white">White</option>
                <option value="red">Red</option>
                <option value="blue">Blue</option>
                <option value="pink">Pink</option>
                <option value="green">Green</option>
                <option value="yellow">Yellow</option>
            </select>
            <span class="material-symbols-outlined text-[18px] absolute right-0 pointer-events-none text-on-surface-variant group-hover:text-primary">keyboard_arrow_down</span>
        </div>
        <div class="w-px h-4 bg-outline-variant/50"></div>
        <!-- Price -->
        <div class="relative flex items-center group">
            <select id="filter-price" class="appearance-none bg-transparent font-label-sm uppercase text-on-surface-variant group-hover:text-primary transition-colors cursor-pointer outline-none pr-6">
                <option value="">PRICE (ALL)</option>
                <option value="under1000">Under ₹1000</option>
                <option value="1000to2000">₹1000 - ₹2000</option>
                <option value="over2000">Over ₹2000</option>
            </select>
            <span class="material-symbols-outlined text-[18px] absolute right-0 pointer-events-none text-on-surface-variant group-hover:text-primary">keyboard_arrow_down</span>
        </div>
    </div>
    
    <div class="flex items-center justify-between w-full md:w-auto">
        <span id="result-count" class="text-on-surface-variant font-label-sm hidden md:inline-block mr-4">Loading...</span>
        
        <!-- Sort By -->
        <div class="relative flex items-center group bg-surface px-4 py-2 rounded-lg border border-outline-variant hover:border-primary transition-colors cursor-pointer">
            <select id="sort-by" class="appearance-none bg-transparent font-label-sm uppercase text-on-surface cursor-pointer outline-none pr-6">
                <option value="newest">Sort By: Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
            </select>
            <span class="material-symbols-outlined text-[18px] absolute right-2 pointer-events-none text-on-surface">swap_vert</span>
        </div>
    </div>
</div>`;

for (const filename of filesToUpdate) {
    const filePath = path.join(__dirname, filename);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Find the start of the filter bar.
        // It starts with <div class="sticky top-[72px]" and ends with the matching </div> (two levels deep).
        // A simpler way: we know it comes right after <!-- Sticky Filter Bar --> and before <!-- Quick Filters -->
        
        const startMarker = '<!-- Sticky Filter Bar -->';
        const endMarker = '<!-- Quick Filters -->';
        
        const startIdx = content.indexOf(startMarker);
        const endIdx = content.indexOf(endMarker);
        
        if (startIdx !== -1 && endIdx !== -1) {
            const before = content.substring(0, startIdx + startMarker.length);
            const after = content.substring(endIdx);
            
            content = before + '\n' + newFilterBar + '\n' + after;
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated filter bar in ${filename}`);
        } else {
            console.log(`Markers not found in ${filename}`);
        }
    }
}
