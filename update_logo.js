const fs = require('fs');
const path = require('path');

const directoryPath = __dirname;
const oldImgTag = '<img src="logo.jpeg" alt="&" class="inline-block h-16 w-16 object-cover rounded-full mx-2 align-middle">';
const newImgTag = '<img src="logo.jpeg" alt="&" class="inline-block h-24 w-24 object-cover rounded-full mx-2 align-middle">';

function replaceLogoSize(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(oldImgTag)) {
        content = content.split(oldImgTag).join(newImgTag);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated size in: ${path.basename(filePath)}`);
    } else if (content.includes('h-24 w-24')) {
        console.log(`Already updated: ${path.basename(filePath)}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                processDirectory(fullPath);
            }
        } else if (path.extname(file) === '.html') {
            replaceLogoSize(fullPath);
        }
    });
}

processDirectory(directoryPath);
console.log("Done updating logo sizes to 24x24.");
