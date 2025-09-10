import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'deploy-gcp.sh');

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const result = data.replace(/\r\n/g, '\n');
  fs.writeFileSync(filePath, result, 'utf8');
  console.log('Successfully converted line endings for', filePath);
} catch (err) {
  console.error('Error processing file:', err);
  process.exit(1);
}