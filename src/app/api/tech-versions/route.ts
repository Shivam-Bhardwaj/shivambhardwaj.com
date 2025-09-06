import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);
  const { dependencies, devDependencies } = packageJson;

  const techVersions = {
    'Next.js': dependencies.next,
    'React': dependencies.react,
    'Tailwind CSS': devDependencies.tailwindcss,
    'TypeScript': devDependencies.typescript,
    'Three.js': dependencies.three,
    'Playwright': devDependencies['@playwright/test'],
    'Vitest': devDependencies.vitest,
    'ESLint': devDependencies.eslint,
  };

  return NextResponse.json(techVersions);
}