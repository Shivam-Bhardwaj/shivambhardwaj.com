#!/usr/bin/env node

/**
 * Quick Firebase Deployment
 * 
 * Minimal deployment script that focuses on successful build and deploy
 */

const { execSync } = require('child_process');
const fs = require('fs');

const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`, 
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`
};

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  switch (level) {
    case 'error':
      console.error(colors.red(logMessage));
      break;
    case 'warn':
      console.warn(colors.yellow(logMessage));
      break;
    case 'success':
      console.log(colors.green(logMessage));
      break;
    default:
      console.log(colors.blue(logMessage));
      break;
  }
}

async function quickDeploy() {
  try {
    const startTime = Date.now();
    log('🚀 Starting quick deployment to Firebase');

    // Step 1: Clean build
    log('🧹 Cleaning previous build...');
    try {
      execSync('npm run clean', { stdio: 'inherit' });
    } catch (error) {
      log('⚠️ Clean failed (continuing anyway)', 'warn');
    }

    // Step 2: Build (this is the critical step)
    log('🏗️ Building production version...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Step 3: Verify build output
    if (!fs.existsSync('out/index.html')) {
      throw new Error('Build failed - no index.html found');
    }
    log('✅ Build successful - output verified', 'success');

    // Step 4: Deploy to Firebase
    log('🚀 Deploying to Firebase...');
    execSync('firebase deploy --only hosting', { stdio: 'inherit' });

    const duration = Math.round((Date.now() - startTime) / 1000);
    log(`🎉 Deployment completed successfully in ${duration}s!`, 'success');
    log('🌐 Your site should be live at: https://shivambhardwaj.com', 'success');
    
    return true;

  } catch (error) {
    log(`💥 Deployment failed: ${error.message}`, 'error');
    return false;
  }
}

if (require.main === module) {
  quickDeploy().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { quickDeploy };