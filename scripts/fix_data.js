const fs = require('fs');
const path = require('path');

// Read the current file
const filePath = path.join(__dirname, '..', 'src', 'data', 'roommates.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace ALL right/curly single quotes with escaped regular apostrophes inside strings
// The right single quote is U+2019
content = content.replace(/\u2019/g, "\\'");

// Also replace left single quote U+2018 if present
content = content.replace(/\u2018/g, "\\'");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed! Replaced curly apostrophes in', filePath);

// Verify by checking for remaining curly quotes
const remaining = (content.match(/[\u2018\u2019]/g) || []).length;
console.log('Remaining curly quotes:', remaining);
