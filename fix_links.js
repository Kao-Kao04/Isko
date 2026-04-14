const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Match `<a href="..." ...> ... </Link>` and replace </Link> with </a>
  // Actually, since these are very specifically located near "quick-action-item" or "profileWebsite", we can do strict replacements
  content = content.replace(/<a href="#" className="quick-action-item"([\s\S]*?)<\/Link>/g, '<a href="#" className="quick-action-item"$1</a>');
  content = content.replace(/<a href="#" id="profileWebsite" target="_blank">educationfoundation.com<\/Link>/g, '<a href="#" id="profileWebsite" target="_blank">educationfoundation.com</a>');
  content = content.replace(/<a href="#about">About<\/Link>/g, '<a href="#about">About</a>');
  content = content.replace(/<a href="#how-it-works">How It Works<\/Link>/g, '<a href="#how-it-works">How It Works</a>');
  content = content.replace(/<a href="#hero" id="footerHomeLink">\s+Home\s+<\/Link>/g, '<a href="#hero" id="footerHomeLink">\n                  Home\n                </a>');
  fs.writeFileSync(filePath, content);
}

const files = [
  './app/osfa/notifications/page.tsx',
  './app/osfa/profile/page.tsx',
  './app/osfa/reports/page.tsx',
  './app/osfa/scholarships/page.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    fixFile(f);
    console.log(`Fixed ${f}`);
  }
});
