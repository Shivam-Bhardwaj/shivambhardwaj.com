import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { mapVersions } from '@/lib/tech/registry';

export async function GET() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);
  const techVersions = mapVersions(packageJson);
  return NextResponse.json(techVersions);
}