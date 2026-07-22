const { execSync } = require('child_process');
const path = require('path');
const prismaPath = path.join(path.dirname(require.resolve('prisma/package.json')), 'build', 'index.js');
const args = process.argv.slice(2).join(' ');
execSync(`node "${prismaPath}" ${args}`, { stdio: 'inherit', cwd: __dirname + '/..' });
