/**
 * scripts/generate-openapi.mjs
 *
 * Universal, cross-platform script to fetch the OpenAPI 3.1 spec from the
 * running Spring Boot backend and write it to docs/openapi.json.
 *
 * Using Node.js ensures 100% identical JSON formatting, UTF-8 encoding (no BOM),
 * and LF line endings across Windows, macOS, and Linux CI.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputFile = path.join(rootDir, 'docs', 'openapi.json');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const SPEC_URL = `${BACKEND_URL}/v3/api-docs`;
const HEALTH_URL = `${BACKEND_URL}/actuator/health`;
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForBackend() {
  console.log(`Checking backend health at ${HEALTH_URL}...`);
  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      const res = await fetch(HEALTH_URL);
      if (res.ok) {
        const body = await res.json();
        if (body.status === 'UP') {
          console.log('✅ Backend is healthy.');
          return;
        }
      }
    } catch {
      // Backend not yet reachable
    }
    console.log(`  Waiting for backend... (${i}/${MAX_RETRIES})`);
    await sleep(RETRY_DELAY_MS);
  }
  throw new Error(`Backend did not become healthy at ${HEALTH_URL} within timeout.`);
}

async function generateSpec() {
  await waitForBackend();

  console.log(`Fetching OpenAPI spec from ${SPEC_URL}...`);
  const res = await fetch(SPEC_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch spec from ${SPEC_URL}: ${res.status} ${res.statusText}`);
  }

  const spec = await res.json();
  // Ensure consistent 2-space indentation and trailing LF newline
  const formattedJson = JSON.stringify(spec, null, 2) + '\n';

  fs.writeFileSync(outputFile, formattedJson, { encoding: 'utf8' });
  console.log(`✅ Spec written to docs/openapi.json`);
  console.log('');
  console.log('Next steps:');
  console.log('  git add docs/openapi.json');
  console.log('  git commit -m "docs: regenerate openapi.json"');
}

generateSpec().catch((err) => {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
});
