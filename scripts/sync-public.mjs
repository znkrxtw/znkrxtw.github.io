import { execSync } from 'node:child_process';

const srcDir = 'src/content/twitchdactle/src';
const publicDir = 'public/src/content/twitchdactle/src';

// Sync src to public (excluding vendor.js)
execSync(`robocopy "${srcDir}" "${publicDir}" /E /XF vendor.js`, { stdio: 'inherit' });

console.log('✓ Synced src files to public folder');
