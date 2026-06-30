const fs = require('fs');
const path = require('path');

const targetStr = `<a href="auth.html" class="nav-profile-link hover:opacity-80 transition-opacity duration-300" style="display:inline-flex; align-items:center; justify-content:center; text-decoration:none;">
    <span class="material-symbols-outlined">person</span>
</a>`;

const targetStr2 = `<a href="auth.html" class="nav-profile-link hover:opacity-80 transition-opacity duration-300" style="display:inline-flex; align-items:center; justify-content:center; text-decoration:none;">
    <span class="material-symbols-outlined">person</span>
</a>
`;

let count = 0;
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(targetStr)) {
        content = content.replace(targetStr, '');
        fs.writeFileSync(file, content);
        count++;
        console.log('Fixed:', file);
    } else if (content.includes(targetStr2)) {
        content = content.replace(targetStr2, '');
        fs.writeFileSync(file, content);
        count++;
        console.log('Fixed:', file);
    }
});
console.log('Total files fixed:', count);
