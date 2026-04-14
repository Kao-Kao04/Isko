const fs = require('fs');

const files = [
  './app/privacy/page.tsx',
  './app/terms/page.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    // For these files, the issue is `<a href="...">...</Link>`
    // We can replace all `</Link>` with `</a>` that follow `<a href=`
    // The easiest is just globally replacing </Link> with </a> for lines that contain `<a href`
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('<a href') && lines[i].includes('</Link>')) {
        lines[i] = lines[i].replace(/<\/Link>/g, '</a>');
      }
    }
    fs.writeFileSync(f, lines.join('\n'));
    console.log(`Fixed ${f}`);
  }
});
