#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function generateVersionInfo() {
  try {
    // Read package.json to get current version
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Get git information
    let gitHash = 'unknown';
    let gitBranch = 'unknown';
    
    try {
      gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      console.warn('Git information not available:', error.message);
    }
    
    // Generate build timestamp
    const buildTime = new Date().toISOString();
    
    // Create version info object
    const versionInfo = {
      version: packageJson.version,
      buildTime,
      gitHash,
      gitBranch,
      buildNumber: Date.now().toString(), // Unique build number
    };
    
    // Write to src/data/version.json
    const versionPath = path.join(__dirname, '..', 'src', 'data', 'version.json');
    
    // Ensure directory exists
    const versionDir = path.dirname(versionPath);
    if (!fs.existsSync(versionDir)) {
      fs.mkdirSync(versionDir, { recursive: true });
    }
    
    fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));
    
    // Also copy to public directory for static access
    const publicVersionPath = path.join(__dirname, '..', 'public', 'data', 'version.json');
    const publicVersionDir = path.dirname(publicVersionPath);
    
    if (!fs.existsSync(publicVersionDir)) {
      fs.mkdirSync(publicVersionDir, { recursive: true });
    }
    
    fs.writeFileSync(publicVersionPath, JSON.stringify(versionInfo, null, 2));
    
    console.log('✅ Version info generated:');
    console.log(`   Version: ${versionInfo.version}`);
    console.log(`   Build: ${versionInfo.buildNumber}`);
    console.log(`   Git: ${versionInfo.gitHash} (${versionInfo.gitBranch})`);
    console.log(`   Time: ${versionInfo.buildTime}`);
    
    return versionInfo;
  } catch (error) {
    console.error('❌ Error generating version info:', error.message);
    process.exit(1);
  }
}

// Auto-increment version if requested
function bumpVersion(type = 'patch') {
  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const version = packageJson.version.split('.').map(Number);
    
    switch (type) {
      case 'major':
        version[0]++;
        version[1] = 0;
        version[2] = 0;
        break;
      case 'minor':
        version[1]++;
        version[2] = 0;
        break;
      case 'patch':
      default:
        version[2]++;
        break;
    }
    
    packageJson.version = version.join('.');
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(`✅ Version bumped to ${packageJson.version}`);
    return packageJson.version;
  } catch (error) {
    console.error('❌ Error bumping version:', error.message);
    process.exit(1);
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

if (command === 'bump') {
  const type = args[1] || 'patch';
  bumpVersion(type);
}

generateVersionInfo();