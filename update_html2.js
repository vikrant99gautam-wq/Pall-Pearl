const fs = require('fs');
const path = require('path');

const filesToUpdate = {
    'tops.html': 'Tops',
    'kurtis.html': 'Kurtis',
    'dresses.html': 'Dresses',
    'coord-sets.html': 'Co-ord Sets',
    'bottom-wear.html': 'Bottom Wear',
    'ethnic-wear.html': 'Ethnic Wear',
    'new-arrivals.html': 'All', 
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
        
        if (!content.includes(scriptTag)) {
            content = content.replace(/<\/body>/i, `    ${scriptTag}\n</body>`);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Added script to ${filename}`);
        } else {
            console.log(`Script already in ${filename}`);
        }
    }
}
