import fs from 'node:fs/promises';
import path from 'node:path';

const srcDir = 'src/content/twitchdactle/src';
const publicDir = 'public/src/content/twitchdactle/src';

async function copyRecursive(src, dest, exclude = []) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (exclude.includes(entry.name)) {
      continue; // Skip excluded files
    }
    
    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath, exclude);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// Copy src to public
await copyRecursive(srcDir, publicDir, ['startup.js', 'redactleGame.js', 'main-entry.js']);

console.log('✓ Synced src files to public folder');
