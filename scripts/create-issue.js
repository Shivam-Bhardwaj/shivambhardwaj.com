#!/usr/bin/env node
/**
 * Helper script to create GitHub issues from command line
 * Usage: node scripts/create-issue.js "Title" "Description"
 */

const fs = require('fs');
const path = require('path');

const issueTemplate = `---
name: Custom Issue
about: Custom issue created via script
title: '{TITLE}'
labels: ''
assignees: ''
---

## Description
{DESCRIPTION}

## Additional Context
<!-- Add any other context or screenshots here -->
`;

function createIssueFile(title, description) {
  const sanitizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const fileName = `${sanitizedTitle}-${Date.now()}.md`;
  const filePath = path.join(__dirname, '..', '.github', 'ISSUES', fileName);
  const dirPath = path.dirname(filePath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const content = issueTemplate
    .replace('{TITLE}', title)
    .replace('{DESCRIPTION}', description);
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Issue draft created: ${filePath}`);
  console.log(`📝 You can now commit and push this file to create the issue`);
  
  return filePath;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/create-issue.js "Title" "Description"');
    process.exit(1);
  }
  
  const [title, ...descriptionParts] = args;
  const description = descriptionParts.join(' ');
  
  createIssueFile(title, description);
}

module.exports = { createIssueFile };

