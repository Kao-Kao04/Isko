const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix unescaped entities
    content = content.replace(/don't/g, "don&apos;t");
    content = content.replace(/Don't/g, "Don&apos;t");
    content = content.replace(/can't/g, "can&apos;t");
    content = content.replace(/Can't/g, "Can&apos;t");
    content = content.replace(/doesn't/g, "doesn&apos;t");
    content = content.replace(/Doesn't/g, "Doesn&apos;t");
    content = content.replace(/You're/g, "You&apos;re");
    content = content.replace(/you're/g, "you&apos;re");
    content = content.replace(/we're/g, "we&apos;re");
    content = content.replace(/We're/g, "We&apos;re");
    content = content.replace(/they're/g, "they&apos;re");
    content = content.replace(/I'm/g, "I&apos;m");
    content = content.replace(/I've/g, "I&apos;ve");
    content = content.replace(/I'll/g, "I&apos;ll");
    content = content.replace(/We'll/g, "We&apos;ll");
    content = content.replace(/you'll/g, "you&apos;ll");
    content = content.replace(/It's/g, "It&apos;s");
    content = content.replace(/it's/g, "it&apos;s");
    content = content.replace(/Let's/g, "Let&apos;s");
    content = content.replace(/"Iskolarships"/g, "&quot;Iskolarships&quot;");
    content = content.replace(/"Status"/g, "&quot;Status&quot;");
    content = content.replace(/Mother's/g, "Mother&apos;s");
    content = content.replace(/Father's/g, "Father&apos;s");
    content = content.replace(/Guardian's/g, "Guardian&apos;s");
    // Generic match for other simple words with apostrophes inside JSX >text<
    content = content.replace(/>([^<]+)(')([a-z]+)\b/g, (match, prefix, apos, suffix) => {
        return `>${prefix}&apos;${suffix}`;
    });

    // Replace <a> tags for internal routes with <Link>
    content = content.replace(/<a ([^>]*)href="(\/[^"]*)"([^>]*)>/g, '<Link $1href="$2"$3>');
    content = content.replace(/<\/a>/g, '</Link>');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', filePath);
    }
}

function walkDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            fixFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'app'));
console.log('Lint fixing completed.');
