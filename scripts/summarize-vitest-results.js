#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const input = process.argv[2] || path.join('test-logs', 'unit-results.json');
const outPath = process.argv[3] || '';

function sanitize(str, max = 800) {
  if (!str) return '';
  return String(str).replace(/\u001b\[[0-9;]*m/g, '').replace(/\s+/g, ' ').slice(0, max);
}

try {
  const raw = fs.readFileSync(input, 'utf8');
  const data = JSON.parse(raw);
  const lines = [];

  lines.push(`Failed suites: ${data.numFailedTestSuites}/${data.numTotalTestSuites}`);
  lines.push(`Failed tests: ${data.numFailedTests}/${data.numTotalTests}`);

  (data.testResults || []).forEach((suite) => {
    const failedAsserts = (suite.assertionResults || []).filter(a => a.status !== 'passed');
    const suiteFailed = suite.status && suite.status !== 'passed';
    if (suiteFailed || failedAsserts.length) {
      lines.push('');
      lines.push(`Suite: ${suite.name}`);
      lines.push(`Status: ${suite.status || 'unknown'}`);
      if (suite.message) lines.push(`Suite message: ${sanitize(suite.message, 400)}`);
      failedAsserts.slice(0, 10).forEach((a) => {
        lines.push(`  Test: ${a.fullName}`);
        const msg = (a.failureMessages && a.failureMessages[0]) || '';
        lines.push(`    ${sanitize(msg, 600)}`);
      });
    }
  });

  const output = lines.join('\n');
  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, output, 'utf8');
    console.log(`Wrote summary to ${outPath}`);
  } else {
    console.log(output);
  }
} catch (err) {
  console.error('Error summarizing results:', err.message);
  process.exit(1);
}
