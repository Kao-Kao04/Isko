const fs = require('fs');

const f = './app/student/kapwa/page.tsx';
const content = fs.readFileSync(f, 'utf8');
const lines = content.split('\n');

// Keep lines 0 to 125 (which is up to line 126 in 1-indexed view)
// Then skip lines 126 to 320
// Keep lines 321 to end (which starts at 322 in 1-indexed view)

const newLines = [
  ...lines.slice(0, 126),
  ...lines.slice(321)
];

fs.writeFileSync(f, newLines.join('\n'));
console.log('Fixed kapwa/page.tsx');
