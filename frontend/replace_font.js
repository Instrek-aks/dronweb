const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

cssContent = cssContent.replace(/'DM Sans'/g, "'Poppins'");
cssContent = cssContent.replace(/'Syne'/g, "'Poppins'");

fs.writeFileSync(cssPath, cssContent);
console.log('Fonts updated successfully!');
