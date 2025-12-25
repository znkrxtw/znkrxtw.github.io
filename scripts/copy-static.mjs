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

async function main() {
  if (!(await exists(srcDir))) {
    throw new Error(`Expected ${srcDir} to exist.`);
  }

  await fs.mkdir(distSrcDir, { recursive: true });
  await fs.cp(srcDir, distSrcDir, { recursive: true });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
