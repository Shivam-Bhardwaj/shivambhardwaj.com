#!/usr/bin/env node
/**
 * Interactive Google Cloud setup script
 * Guides through: auth login, project selection/creation, region, enabling APIs,
 * App Engine init, optional service account + roles, optional key export, ADC.
 *
 * Usage: npm run setup:gcloud
 */

const readline = require('readline');
const { execSync } = require('child_process');
// Inline lightweight ANSI color helpers (avoid chalk ESM import issues in CJS)
const color = {
  cyan: s => `\x1b[36m${s}\x1b[0m`,
  blue: s => `\x1b[34m${s}\x1b[0m`,
  green: s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  red: s => `\x1b[31m${s}\x1b[0m`,
  magenta: s => `\x1b[35m${s}\x1b[0m`,
  bold: s => `\x1b[1m${s}\x1b[0m`,
};
const path = require('path');

const REQUIRED_APIS = [
  'appengine.googleapis.com',
  'cloudbuild.googleapis.com',
  'logging.googleapis.com',
  'monitoring.googleapis.com',
  'storage.googleapis.com'
];

const DEFAULT_REGION = 'us-central'; // App Engine region base (will append 1)
const APP_ENGINE_REGIONS = [
  'us-central', 'us-east1', 'us-east4', 'us-west2', 'us-west3', 'us-west4',
  'northamerica-northeast1', 'southamerica-east1', 'europe-west1', 'europe-west3',
  'europe-west6', 'europe-central2', 'asia-northeast1', 'asia-northeast2', 'asia-northeast3',
  'asia-south1', 'asia-southeast1', 'asia-southeast2', 'australia-southeast1'
];

function rl() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function q(rlInstance, question) {
  return new Promise(res => rlInstance.question(color.cyan(question), ans => res(ans.trim())));
}

function yesNoDefault(rlInstance, question, def = true) {
  const suffix = def ? ' [Y/n]: ' : ' [y/N]: ';
  return q(rlInstance, question + suffix).then(ans => {
    if (!ans) return def;
    return /^y(es)?$/i.test(ans);
  });
}

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { stdio: opts.silent ? 'pipe' : 'inherit', encoding: 'utf8' });
  } catch (e) {
    if (!opts.ignoreError) throw e;
    return '';
  }
}

function header(text) { console.log('\n' + color.magenta(color.bold('▶ ' + text)) + '\n'); }
function info(text) { console.log(color.blue('ℹ ') + text); }
function ok(text) { console.log(color.green('✔ ') + text); }
function warn(text) { console.log(color.yellow('⚠ ') + text); }
function err(text) { console.log(color.red('✖ ' + text)); }

function gcloudAvailable() {
  try { run('gcloud version', { silent: true }); return true; } catch { return false; }
}

function getActiveAccounts() {
  try {
    const out = run('gcloud auth list --format="value(account)"', { silent: true });
    return out.split(/\r?\n/).filter(Boolean);
  } catch { return []; }
}


function listProjects() {
  try {
    const out = run('gcloud projects list --format="value(projectId)"', { silent: true });
    return out.split(/\r?\n/).filter(Boolean);
  } catch { return []; }
}

function projectExists(id) {
  try { const list = listProjects(); return list.includes(id); } catch { return false; }
}

function enabledApis() {
  try {
    const out = run('gcloud services list --enabled --format="value(config.name)"', { silent: true });
    return new Set(out.split(/\r?\n/).filter(Boolean));
  } catch { return new Set(); }
}

function appEngineInitialized() {
  try { run('gcloud app describe', { silent: true }); return true; } catch { return false; }
}

async function main() {
  const r = rl();
  header('Google Cloud Interactive Setup');

  if (!gcloudAvailable()) {
    err('gcloud CLI not found. Install: https://cloud.google.com/sdk/docs/install');
    process.exit(1);
  }
  ok('gcloud CLI detected');

  // Auth
  const accounts = getActiveAccounts();
  if (accounts.length === 0) {
    info('No active authenticated accounts. Running gcloud auth login...');
    run('gcloud auth login');
  } else {
    ok(`Active account(s): ${accounts.join(', ')}`);
    const addAnother = await yesNoDefault(r, 'Add/Login another account?', false);
    if (addAnother) run('gcloud auth login');
  }

  // Project selection
  header('Project Configuration');
  const existingProjects = listProjects();
  if (existingProjects.length) info('Existing projects:\n  ' + existingProjects.join('\n  '));
  let projectId = await q(r, 'Enter target PROJECT_ID: ');
  while (!projectId) projectId = await q(r, 'PROJECT_ID (cannot be empty): ');

  if (!projectExists(projectId)) {
    const create = await yesNoDefault(r, `Project ${projectId} not found. Create it?`, true);
    if (create) {
      info('Creating project (this may require billing to be set manually later)...');
      try { run(`gcloud projects create ${projectId}`); ok('Project created'); }
      catch (e) { err('Failed to create project: ' + e.message); process.exit(1); }
    } else { err('Project must exist to continue.'); process.exit(1); }
  } else ok('Project exists');

  run(`gcloud config set project ${projectId}`);
  ok(`Active project set: ${projectId}`);

  // Region
  header('Region');
  let region = await q(r, `Select App Engine region base (default ${DEFAULT_REGION}): `);
  if (!region) region = DEFAULT_REGION;
  while (!APP_ENGINE_REGIONS.includes(region)) {
    warn('Invalid region base. Valid options include: ' + APP_ENGINE_REGIONS.slice(0, 8).join(', ') + ' ...');
    region = await q(r, 'Region base: ');
  }
  const fullRegion = region.endsWith('1') ? region : region + (/-\d$/.test(region) ? '' : '1');
  ok(`Chosen region: ${fullRegion}`);
  run(`gcloud config set compute/region ${fullRegion}`, { ignoreError: true });

  // Enable APIs
  header('APIs');
  const currentApis = enabledApis();
  const toEnable = REQUIRED_APIS.filter(a => !currentApis.has(a));
  if (toEnable.length === 0) ok('All required APIs already enabled');
  else {
    info('Enabling APIs: ' + toEnable.join(', '));
    run('gcloud services enable ' + toEnable.join(' '));
    ok('APIs enabled');
  }

  // App Engine
  header('App Engine');
  if (appEngineInitialized()) ok('App Engine already initialized');
  else {
    const init = await yesNoDefault(r, 'Initialize App Engine now?', true);
    if (init) {
      run(`gcloud app create --region=${fullRegion}`);
      ok('App Engine app created');
    } else warn('Skipping App Engine initialization (deploy will fail until done)');
  }

  // Service Account
  header('Service Account (Optional)');
  const createSA = await yesNoDefault(r, 'Create deployment service account?', true);
  let saEmail = null;
  if (createSA) {
    const saName = await q(r, 'Service account name (default deployment-sa): ' ) || 'deployment-sa';
    saEmail = `${saName}@${projectId}.iam.gserviceaccount.com`;
    try {
      run(`gcloud iam service-accounts create ${saName} --display-name="Deployment SA"`, { ignoreError: true });
      ok(`Service account ensured: ${saEmail}`);
      const roles = [
        'roles/appengine.deployer',
        'roles/cloudbuild.builds.editor',
        'roles/logging.logWriter',
        'roles/monitoring.viewer',
        'roles/storage.admin'
      ];
      for (const role of roles) {
        run(`gcloud projects add-iam-policy-binding ${projectId} --member=serviceAccount:${saEmail} --role=${role}`, { ignoreError: true, silent: true });
      }
      ok('Roles bound (idempotent)');
    } catch (e) { warn('Could not create/bind service account: ' + e.message); }
  }

  // Key file
  if (saEmail) {
    const createKey = await yesNoDefault(r, 'Generate JSON key for service account (local/CI usage)?', false);
    if (createKey) {
      const keyPath = path.resolve(process.cwd(), 'deployment-sa-key.json');
      try {
        run(`gcloud iam service-accounts keys create ${keyPath} --iam-account=${saEmail}`);
        ok('Key written: ' + keyPath);
        info('Set env var before scripts:');
        info(`  $env:GOOGLE_APPLICATION_CREDENTIALS = "${keyPath}"`);
      } catch (e) { warn('Key creation failed: ' + e.message); }
    }
  }

  // ADC
  header('Application Default Credentials (Optional)');
  const adc = await yesNoDefault(r, 'Run gcloud auth application-default login?', false);
  if (adc) run('gcloud auth application-default login');
  else info('Skipped ADC');

  // Summary
  header('Summary');
  console.log(color.bold('Project: ') + projectId);
  console.log(color.bold('Region: ') + fullRegion);
  console.log(color.bold('APIs: ') + REQUIRED_APIS.join(', '));
  if (saEmail) console.log(color.bold('Service Account: ') + saEmail);
  ok('Setup flow complete. You can now run:');
  console.log('  npm run deploy:staging');
  console.log('  npm run deploy:production');

  r.close();
}

main().catch(e => { err(e.message); process.exit(1); });
