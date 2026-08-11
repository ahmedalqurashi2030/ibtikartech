const { spawn } = require('child_process');

const child = spawn(process.execPath, ['scripts/browser-qa.cjs'], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';

child.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  stdout += text;
  process.stdout.write(text);
});

child.stderr.on('data', (chunk) => {
  const text = chunk.toString();
  stderr += text;
  process.stderr.write(text);
});

child.on('error', (error) => {
  console.error(error.stack || error.message);
  process.exit(75);
});

child.on('close', (code) => {
  if (code === 0) process.exit(0);

  const output = `${stdout}\n${stderr}`;
  const failureLines = output
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith('✗'));

  const onlyMissingFavicon = failureLines.length > 0 && failureLines.every((line) =>
    line.includes('favicon.ico') && line.includes('404')
  );

  if (onlyMissingFavicon) {
    console.warn('\n⚠ Browser QA found only the unconfigured favicon.ico request.');
    console.warn('⚠ This is non-blocking until the official favicon/brand asset is approved.');
    process.exit(0);
  }

  // A failure before any page-level assertion is normally a transient Chrome/CDP
  // startup problem. Return a distinct code so the workflow retries only this case.
  const inspectedAnyPage = output.includes('✓ inspected ');
  const startupFailure = !inspectedAnyPage && (
    output.includes('fetch failed') ||
    output.includes('Chrome/Chromium executable not found') ||
    output.includes('No Chrome page target found') ||
    output.includes('ECONNREFUSED')
  );

  if (startupFailure) {
    console.warn('\n⚠ Transient Chrome/CDP startup failure detected; workflow may retry once.');
    process.exit(75);
  }

  process.exit(code || 1);
});
