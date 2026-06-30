const fs = require('fs');
const path = require('path');

const filesToUpdate = {
    'tops.html': 'Tops',
    'kurtis.html': 'Kurtis',
    'dresses.html': 'Dresses',
    'coord-sets.html': 'Co-ord Sets',
    'bottom-wear.html': 'Bottom Wear',
    'ethnic-wear.html': 'Ethnic Wear',
    'new-arrivals.html': 'All', // All products
    'sale.html': 'All',
    'summer-collection.html': 'All',
    'festive-collection.html': 'All',
    'best-sellers.html': 'All',
    'collection.html': 'All'
};

const scriptTag = '<script type="module" src="public-store.js"></script>';

for (const [filename, category] of Object.entries(filesToUpdate)) {
    const filePath = path.join(__dirname, filename);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 1. Find <div class="masonry-grid"> and everything inside it up to its closing </div>
        // Using a regex to match the masonry-grid div and its contents
        // Wait, regex for nested divs is tricky. Let's just find the exact string '<div class="masonry-grid">' 
        // and assume it ends before the next tag like `<!-- Footer -->` or `</main>` or we can just replace everything between 
        // '<div class="masonry-grid">' and '</div>\n</main>' or similar.
        
        // Let's replace the grid content. 
        // We know they all have `<!-- Product 1 -->` or `<!-- Card 1` inside `<div class="masonry-grid">`.
        const gridStartIdx = content.indexOf('<div class="masonry-grid">');
        if (gridStartIdx !== -1) {
            // Find the end of this div. We can look for `</main>` and step back.
            const mainEndIdx = content.indexOf('</main>', gridStartIdx);
            if (mainEndIdx !== -1) {
                // Find the last </div> before </main>
                const gridEndIdx = content.lastIndexOf('</div>', mainEndIdx);
                
                if (gridEndIdx !== -1) {
                    const newGrid = `<div id="product-grid" class="masonry-grid" data-category="${category}">\n    <!-- Products will be injected here by public-store.js -->\n</div>`;
                    content = content.substring(0, gridStartIdx) + newGrid + content.substring(gridEndIdx + 6);
                }
            }
        }

        // 2. Add public-store.js before </body> if not already there
        if (!content.includes('public-store.js')) {
            content = content.replace('</body>', `    ${scriptTag}\n</body>`);
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filename} with category: ${category}`);
    } else {
        console.log(`File not found: ${filename}`);
    }
}
