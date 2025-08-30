#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

function run(command, options = {}) {
  console.log(`🔧 Running: ${command}`);
  try {
    const result = execSync(command, { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..'),
      ...options 
    });
    return result;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    process.exit(1);
  }
}

function deploy() {
  console.log('🚀 Starting deployment process...\n');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const versionType = args.find(arg => ['major', 'minor', 'patch'].includes(arg)) || 'patch';
  const skipBump = args.includes('--no-bump');
  
  try {
    // Step 1: Bump version (unless skipped)
    if (!skipBump) {
      console.log(`📈 Bumping ${versionType} version...`);
      run(`node scripts/generate-version.js bump ${versionType}`);
    }
    
    // Step 2: Generate version info
    console.log('📋 Generating version metadata...');
    run('node scripts/generate-version.js');
    
    // Step 3: Run type check
    console.log('🔍 Running type check...');
    run('npm run type-check');
    
    // Step 4: Run lint
    console.log('🧹 Running linter...');
    run('npm run lint');
    
    // Step 5: Build project
    console.log('🏗️  Building project...');
    run('npm run build');
    
    // Step 5.5: Ensure version data is copied to build output
    console.log('📋 Copying version data to build output...');
    const fs = require('fs');
    const path = require('path');
    
    const srcData = path.join(__dirname, '..', 'public', 'data');
    const outData = path.join(__dirname, '..', 'out', 'data');
    
    if (fs.existsSync(srcData)) {
      if (!fs.existsSync(outData)) {
        fs.mkdirSync(outData, { recursive: true });
      }
      
      // Copy version.json
      const srcVersion = path.join(srcData, 'version.json');
      const outVersion = path.join(outData, 'version.json');
      
      if (fs.existsSync(srcVersion)) {
        fs.copyFileSync(srcVersion, outVersion);
        console.log('✅ Version data copied to build output');
      }
    }
    
    // Step 6: Deploy to Firebase
    console.log('☁️  Deploying to Firebase...');
    run('firebase deploy');
    
    // Step 7: Success
    console.log('\n✅ Deployment completed successfully!');
    console.log('🌐 Site URL: https://anti-mony.web.app');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🚀 Deployment Script Usage:

  npm run deploy              Deploy with patch version bump
  npm run deploy minor        Deploy with minor version bump  
  npm run deploy major        Deploy with major version bump
  npm run deploy --no-bump    Deploy without version bump

Examples:
  npm run deploy              1.2.3 → 1.2.4
  npm run deploy minor        1.2.3 → 1.3.0
  npm run deploy major        1.2.3 → 2.0.0
  npm run deploy --no-bump    Keep current version
`);
  process.exit(0);
}

deploy();