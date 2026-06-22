const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const baseDir = '/home/brenosm/personal-projects/HowMuchLove';
const dirs = ['app', 'shared', 'auth', 'marketing', 'customer', 'story'];

const files = dirs.flatMap(d => walk(path.join(baseDir, d)));

let changedFiles = 0;

for (const file of files) {
  if (file.includes('EliteButton.tsx')) continue;

  let content = fs.readFileSync(file, 'utf8');

  if (content.includes('<EliteButton') && !content.includes('import EliteButton from')) {
    const importStmt = `import EliteButton from '@/shared/ui/EliteButton';\n`;
    
    // Find last import
    const importRegex = /^import .*?;?$/gm;
    let lastImportIndex = 0;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      lastImportIndex = importRegex.lastIndex;
    }
    
    if (lastImportIndex > 0) {
      content = content.slice(0, lastImportIndex) + '\n' + importStmt + content.slice(lastImportIndex);
    } else {
      content = importStmt + content;
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Added import to: ${file}`);
    changedFiles++;
  }
}

console.log(`Total files fixed: ${changedFiles}`);
