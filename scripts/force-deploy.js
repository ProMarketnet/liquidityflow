const fs = require('fs');
const path = require('path');

console.log('🚀 FORCING RAILWAY CACHE BUST...');

// 1. Update package.json with new timestamp
const packagePath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.lastCacheBust = new Date().toISOString();
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

// 2. Create a cache-busting CSS file
const cacheBustCss = `
/* FORCE CACHE BUST - ${new Date().toISOString()} */
.cache-bust-${Date.now()} {
  display: none;
}
`;
fs.writeFileSync(path.join(__dirname, '../styles/cache-bust.css'), cacheBustCss);

// 3. Update globals.css with timestamp
const globalsPath = path.join(__dirname, '../styles/globals.css');
let globalsContent = fs.readFileSync(globalsPath, 'utf8');
globalsContent = globalsContent.replace(
  /\/\* OPENAI\/ANTHROPIC DESIGN SYSTEM.*?\*\//,
  `/* OPENAI/ANTHROPIC DESIGN SYSTEM - FORCED CACHE BUST ${new Date().toISOString()} */`
);
fs.writeFileSync(globalsPath, globalsContent);

// 4. Update next.config.js to force rebuild
const nextConfigPath = path.join(__dirname, '../next.config.js');
let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
if (!nextConfig.includes('cacheBust')) {
  nextConfig = nextConfig.replace(
    'module.exports = nextConfig',
    `// Cache bust: ${Date.now()}\nmodule.exports = nextConfig`
  );
  fs.writeFileSync(nextConfigPath, nextConfig);
}

console.log('✅ Cache bust files updated!');
console.log('📦 Now run: npm run build && git add . && git commit -m "🚨 FORCE CACHE BUST" && git push'); 