import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
const srcDir = path.join(repoRoot, 'src');
const distSrcDir = path.join(repoRoot, 'dist', 'src');

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyWithExclude(src, dest, exclude = []) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (exclude.some(ex => srcPath.includes(ex))) {
      continue; // Skip excluded paths
    }
    
    if (entry.isDirectory()) {
      await copyWithExclude(srcPath, destPath, exclude);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  if (!(await exists(srcDir))) {
    throw new Error(`Expected ${srcDir} to exist.`);
  }

  // Copy everything except vendor.js (which is bundled by Vite)
  await copyWithExclude(srcDir, distSrcDir, ['vendor.js']);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
