const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = getFiles(srcDir).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
let hasError = false;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      const dir = path.dirname(file);
      let targetPath = path.resolve(dir, importPath);
      
      let found = false;
      const extensions = ['', '.js', '.jsx', '.css', '.json'];
      let actualTarget = '';
      
      for (const ext of extensions) {
        if (fs.existsSync(targetPath + ext)) {
          found = true;
          actualTarget = targetPath + ext;
          break;
        }
      }
      
      if (found) {
        const dirName = path.dirname(actualTarget);
        const baseName = path.basename(actualTarget);
        const actualFiles = fs.readdirSync(dirName);
        if (!actualFiles.includes(baseName)) {
          console.error('Case mismatch in ' + file + ': imported ' + importPath + ' but actual file is ' + actualFiles.find(f => f.toLowerCase() === baseName.toLowerCase()));
          hasError = true;
        }
      } else {
        console.error('File not found in ' + file + ': imported ' + importPath);
        hasError = true;
      }
    }
  }
});

if (!hasError) console.log('No case mismatch found!');
