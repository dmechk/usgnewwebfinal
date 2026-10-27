const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const backendDir = __dirname;
const frontendDir = path.resolve(backendDir, '../usgweb-main');
const publicDistDir = path.join(backendDir, 'public/dist');

console.log('=== Step 1: Checking Frontend Directory ===');
console.log('Frontend:', frontendDir);
console.log('Backend :', backendDir);

if (fs.existsSync(frontendDir)) {
  console.log('=== Step 2: Installing Frontend Dependencies ===');
  try {
    execSync('npm install --legacy-peer-deps --no-audit', { cwd: frontendDir, stdio: 'inherit' });
  } catch (err) {
    console.error('Warning: frontend install encountered issue, continuing if node_modules exists:', err.message);
  }

  console.log('=== Step 3: Building React/Vite Frontend ===');
  execSync('npm run build', {
    cwd: frontendDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'https://usgnewwebfinal.onrender.com/api',
    },
  });

  console.log('=== Step 4: Copying Frontend Build to Backend public/dist ===');
  const frontendDist = path.join(frontendDir, 'dist');
  if (fs.existsSync(frontendDist)) {
    fs.rmSync(publicDistDir, { recursive: true, force: true });
    fs.mkdirSync(publicDistDir, { recursive: true });
    fs.cpSync(frontendDist, publicDistDir, { recursive: true });
    console.log('Successfully copied build assets to:', publicDistDir);
  } else {
    console.warn('Frontend dist folder not found at', frontendDist);
  }
} else {
  console.log('Frontend source directory not found. Assuming pre-built public/dist exists.');
}

console.log('=== Step 5: Verifying Build Result ===');
if (fs.existsSync(path.join(publicDistDir, 'index.html'))) {
  console.log('SUCCESS: public/dist/index.html is ready to serve!');
} else {
  console.error('WARNING: public/dist/index.html was not generated.');
}
