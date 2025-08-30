console.log('Attempting to import `vitest`...');

try {
  const vitest = await import('vitest');
  console.log('Successfully imported `vitest`. Keys:', Object.keys(vitest));
} catch (e) {
  console.error('Failed to import `vitest`:', e);
}
