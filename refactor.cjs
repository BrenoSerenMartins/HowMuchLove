const fs = require('fs');
const path = require('path');
const glob = require('glob'); // Not available by default, I'll use recursive readdir

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
  let original = content;

  // We need to match <button ... className="...btn-primary..." ...> ... </button>
  // Regex that matches self-closing or regular buttons:
  // Since buttons in React are rarely self-closing, we look for opening and closing tags.
  // We'll use a replacer function to handle it.
  
  const buttonRegex = /<button\b([^>]*)className=(['"])(.*?)\bbtn-(primary|secondary)\b(.*?)\2([^>]*)>([\s\S]*?)<\/button>/g;

  let hasChanges = false;

  content = content.replace(buttonRegex, (match, p1, quote, classBefore, variant, classAfter, p2, innerText) => {
    hasChanges = true;
    const cleanClass = `${classBefore}${classAfter}`.replace(/\s+/g, ' ').trim();
    const classAttr = cleanClass ? ` className="${cleanClass}"` : '';
    return `<EliteButton variant="${variant}"${p1}${classAttr}${p2}>${innerText}</EliteButton>`;
  });

  if (hasChanges) {
    // Add import statement at the top if not present
    if (!content.includes('EliteButton')) {
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
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
    changedFiles++;
  }
}

console.log(`Total files updated: ${changedFiles}`);
