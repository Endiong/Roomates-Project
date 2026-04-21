const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'roommates.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace curly/smart single quotes (U+2019 and U+2018) with straight apostrophe
content = content.split('\u2019').join("'");
content = content.split('\u2018').join("'");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done! Replaced curly apostrophes.');

const remaining = (content.match(/[\u2018\u2019]/g) || []).length;
console.log('Remaining curly quotes:', remaining);
