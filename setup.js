const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🐾 Starting TabbyAnnounce setup...');

// 1. Install Dependencies
try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
} catch (err) {
  console.error('❌ Failed to install dependencies.');
  process.exit(1);
}

// 2. Setup .env
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📄 Creating .env from example...');
  fs.copyFileSync(envExamplePath, envPath);
} else {
  console.log('ℹ️  .env already exists, skipping.');
}

// 3. Platform-specific startup info
console.log('\n✅ Setup complete!');
console.log('------------------------------------');

if (process.platform === 'win32') {
  console.log('👉 To run on boot (Windows):');
  console.log('   Create a shortcut of "start-bot.bat" in your Startup folder (shell:startup).');
} else if (process.platform === 'darwin') {
  console.log('👉 To run on boot (macOS):');
  console.log('   Add "start-bot.sh" to System Settings > General > Login Items.');
} else {
  console.log('👉 To run on boot (Linux):');
  console.log('   Run ./install.sh to automatically add to crontab.');
}

console.log('\nNext: Fill out your .env and add your google-credentials.json.');
